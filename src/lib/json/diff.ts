/**
 * Structural JSON diff. Compares two parsed JSON values and produces a tree of
 * changes (added / removed / changed / unchanged) keyed by path. Objects are
 * compared by key; arrays by index. Used by the /json-diff tool.
 */

export type DiffEntry = {
  /** Object key or array index of this entry within its parent. */
  key: string | number;
  diff: Diff;
};

export type Diff =
  | { kind: "unchanged"; value: unknown }
  | { kind: "added"; value: unknown }
  | { kind: "removed"; value: unknown }
  | { kind: "updated"; oldValue: unknown; newValue: unknown }
  // Both sides are containers of the same type — recurse into entries.
  | { kind: "node"; type: "object" | "array"; entries: DiffEntry[] };

export type DiffSummary = { added: number; removed: number; changed: number };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (!deepEqual(a[i], b[i])) return false;
    return true;
  }
  if (isPlainObject(a) && isPlainObject(b)) {
    const ak = Object.keys(a);
    const bk = Object.keys(b);
    if (ak.length !== bk.length) return false;
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

/** Compute the structural diff between two JSON values (left = original). */
export function diffJson(left: unknown, right: unknown): Diff {
  if (deepEqual(left, right)) return { kind: "unchanged", value: left };

  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));
    const entries: DiffEntry[] = keys.map((key) => {
      const inL = Object.prototype.hasOwnProperty.call(left, key);
      const inR = Object.prototype.hasOwnProperty.call(right, key);
      if (inL && !inR) return { key, diff: { kind: "removed", value: left[key] } };
      if (!inL && inR) return { key, diff: { kind: "added", value: right[key] } };
      return { key, diff: diffJson(left[key], right[key]) };
    });
    return { kind: "node", type: "object", entries };
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    const max = Math.max(left.length, right.length);
    const entries: DiffEntry[] = [];
    for (let i = 0; i < max; i++) {
      const inL = i < left.length;
      const inR = i < right.length;
      if (inL && !inR) entries.push({ key: i, diff: { kind: "removed", value: left[i] } });
      else if (!inL && inR) entries.push({ key: i, diff: { kind: "added", value: right[i] } });
      else entries.push({ key: i, diff: diffJson(left[i], right[i]) });
    }
    return { kind: "node", type: "array", entries };
  }

  // Type change or differing primitives.
  return { kind: "updated", oldValue: left, newValue: right };
}

/** Roll up added/removed/changed leaf counts for a summary line. */
export function summarize(diff: Diff): DiffSummary {
  const acc: DiffSummary = { added: 0, removed: 0, changed: 0 };
  walk(diff, acc);
  return acc;
}

function walk(diff: Diff, acc: DiffSummary) {
  switch (diff.kind) {
    case "added":
      acc.added++;
      break;
    case "removed":
      acc.removed++;
      break;
    case "updated":
      acc.changed++;
      break;
    case "node":
      for (const e of diff.entries) walk(e.diff, acc);
      break;
    case "unchanged":
      break;
  }
}

/** True if this diff subtree contains any change (used to hide unchanged rows). */
export function hasChanges(diff: Diff): boolean {
  if (diff.kind === "unchanged") return false;
  if (diff.kind === "node") return diff.entries.some((e) => hasChanges(e.diff));
  return true;
}

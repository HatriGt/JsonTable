import { startTransition } from "react";
import { create } from "zustand";
import type { PathSegment } from "@/lib/json/path";
import { computeStats, type DocStats } from "@/lib/json/stats";
import {
  HUGE_JSON_BYTES,
  LARGE_JSON_BYTES,
  parseJson,
  parseJsonAsync,
  type ParseError,
} from "@/lib/json/parse";
import { saveRecent } from "@/lib/storage/recents";

const EMPTY_STATS: DocStats = {
  nodes: 0,
  objects: 0,
  arrays: 0,
  primitives: 0,
  maxDepth: 0,
  nulls: 0,
};

function scheduleStats(value: unknown, apply: (stats: DocStats) => void) {
  const run = () => apply(computeStats(value));
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(run, { timeout: 3000 });
  } else {
    setTimeout(run, 0);
  }
}

type Doc = {
  name: string;
  raw: string;
  value: unknown;
  sizeBytes: number;
  stats: DocStats;
  loadedAt: number;
};

export type SelectionSource = "tree" | "grid" | "inspector";

function applyParsedEdit(
  set: (partial: Partial<State> | ((s: State) => Partial<State> | State)) => void,
  raw: string,
  value: unknown,
) {
  const sizeBytes = new Blob([raw]).size;
  const apply = () => {
    set((s) => {
      if (!s.doc) return s;
      return {
        error: null,
        parsing: false,
        doc: {
          ...s.doc,
          raw,
          value,
          sizeBytes,
          stats: EMPTY_STATS,
        },
      };
    });
    scheduleStats(value, (stats) => {
      set((s) => (s.doc && s.doc.value === value ? { doc: { ...s.doc, stats } } : s));
    });
  };
  if (sizeBytes >= HUGE_JSON_BYTES) {
    startTransition(apply);
  } else {
    apply();
  }
}

type State = {
  doc: Doc | null;
  error: ParseError | null;
  parsing: boolean;
  selection: PathSegment[];
  source: SelectionSource;
  setSelection: (p: PathSegment[], source?: SelectionSource) => void;
  loadJson: (name: string, raw: string) => Promise<boolean>;
  renameDoc: (name: string) => void;
  editRaw: (raw: string) => boolean;
  updateAt: (path: PathSegment[], value: unknown) => void;
  reset: () => void;
  clearError: () => void;
};

export const useWorkspace = create<State>((set, get) => ({
  doc: null,
  error: null,
  parsing: false,
  selection: [],
  source: "tree",
  setSelection: (p, source = "tree") => set({ selection: p, source }),
  loadJson: async (name, raw) => {
    set({ parsing: true, error: null });
    const result = await parseJsonAsync(raw);
    if (!result.ok) {
      set({ error: result.error, doc: null, parsing: false });
      return false;
    }
    const value = result.value;
    const sizeBytes = new Blob([raw]).size;
    // The worker computes stats off the main thread for large docs; reuse them
    // and only fall back to the main-thread walk for the small sync path.
    const workerStats = result.stats;
    const applyDoc = () => {
      set({
        error: null,
        parsing: false,
        doc: {
          name,
          raw,
          value,
          sizeBytes,
          stats: workerStats ?? EMPTY_STATS,
          loadedAt: Date.now(),
        },
        selection: [],
        source: "tree",
      });
      if (!workerStats) {
        scheduleStats(value, (stats) => {
          set((s) => (s.doc && s.doc.value === value ? { doc: { ...s.doc, stats } } : s));
        });
      }
    };
    if (sizeBytes >= LARGE_JSON_BYTES) {
      startTransition(applyDoc);
    } else {
      applyDoc();
    }
    if (sizeBytes < HUGE_JSON_BYTES) {
      saveRecent(name, raw).catch(() => {});
    }
    return true;
  },
  editRaw: (raw) => {
    if (!get().doc) return false;

    const runSync = () => {
      const result = parseJson(raw);
      if (!result.ok) {
        set({ error: result.error, parsing: false });
        return false;
      }
      applyParsedEdit(set, raw, result.value);
      return true;
    };

    if (raw.length < LARGE_JSON_BYTES) {
      return runSync();
    }

    set({ parsing: true, error: null });
    // Capture the document identity; if it's replaced (a new file loaded) while
    // this parse is in flight, drop the stale result instead of applying it.
    const token = get().doc?.loadedAt;
    void parseJsonAsync(raw)
      .then((result) => {
        const cur = get().doc;
        if (!cur || cur.loadedAt !== token) return;
        if (!result.ok) {
          set({ error: result.error, parsing: false });
          return;
        }
        applyParsedEdit(set, raw, result.value);
      })
      .catch(() => {
        if (get().doc?.loadedAt === token) set({ parsing: false });
      });
    return true;
  },
  updateAt: (path, value) => {
    let nextValue: unknown;
    set((s) => {
      if (!s.doc) return s;
      const next = setDeep(s.doc.value, path, value);
      nextValue = next;
      const raw = JSON.stringify(next, null, 2);
      const sizeBytes = new Blob([raw]).size;
      return {
        doc: {
          ...s.doc,
          value: next,
          raw,
          sizeBytes,
          stats: s.doc.stats,
        },
      };
    });
    scheduleStats(nextValue, (stats) => {
      set((s) => (s.doc && s.doc.value === nextValue ? { doc: { ...s.doc, stats } } : s));
    });
  },
  renameDoc: (name) =>
    set((s) => {
      if (!s.doc) return s;
      const trimmed = name.trim();
      if (!trimmed || trimmed === s.doc.name) return s;
      // Keep the recents entry in step so reopening reflects the new name.
      if (s.doc.sizeBytes < HUGE_JSON_BYTES) saveRecent(trimmed, s.doc.raw).catch(() => {});
      return { doc: { ...s.doc, name: trimmed } };
    }),
  reset: () => set({ doc: null, error: null, parsing: false, selection: [], source: "tree" }),
  clearError: () => set({ error: null }),
}));

function setDeep(root: unknown, path: PathSegment[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const idx = typeof head === "number" ? head : Number(head);
    if (!Number.isFinite(idx)) return root;
    const next = root.slice();
    next[idx] = setDeep(root[idx], rest, value);
    return next;
  }
  if (root && typeof root === "object") {
    const key = String(head);
    const obj = root as Record<string, unknown>;
    return { ...obj, [key]: setDeep(obj[key], rest, value) };
  }
  // primitive parent — replace with appropriate container
  if (typeof head === "number") {
    const arr: unknown[] = [];
    arr[head] = setDeep(undefined, rest, value);
    return arr;
  }
  return { [String(head)]: setDeep(undefined, rest, value) };
}

import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { hasChanges, type Diff, type DiffEntry } from "@/lib/json/diff";

/** Renders a parsed value compactly on a single line (used for leaf rows). */
function valuePreview(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  if (v === null) return "null";
  if (typeof v === "object")
    return Array.isArray(v) ? `[${v.length}]` : `{${Object.keys(v).length}}`;
  return String(v);
}

function keyLabel(key: string | number, isArrayIndex: boolean): string {
  return isArrayIndex ? `[${key}]` : `${key}`;
}

const STATUS_STYLES = {
  added: "diff-row-added",
  removed: "diff-row-removed",
  updated: "diff-row-updated",
} as const;

const SIGN = { added: "+", removed: "−", updated: "~" } as const;

function Row({
  label,
  status,
  depth,
  children,
}: {
  label: React.ReactNode;
  status: "added" | "removed" | "updated";
  depth: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-2 rounded px-2 py-1 font-mono text-[12.5px] leading-relaxed",
        STATUS_STYLES[status],
      )}
      style={{ paddingLeft: depth * 16 + 8 }}
    >
      <span aria-hidden="true" className="w-3 shrink-0 select-none text-center opacity-70">
        {SIGN[status]}
      </span>
      <span className="min-w-0 break-words">
        {label}
        {children}
      </span>
    </div>
  );
}

/** A single entry (key + its diff) rendered at the given depth. */
function EntryRows({
  entry,
  depth,
  isArray,
  hideUnchanged,
}: {
  entry: DiffEntry;
  depth: number;
  isArray: boolean;
  hideUnchanged: boolean;
}) {
  const { key, diff } = entry;
  const label = <span className="text-json-key">{keyLabel(key, isArray)}</span>;

  if (diff.kind === "unchanged") {
    if (hideUnchanged) return null;
    return (
      <div
        className="flex items-baseline gap-2 rounded px-2 py-1 font-mono text-[12.5px] leading-relaxed text-muted-foreground"
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <span aria-hidden="true" className="w-3 shrink-0 select-none text-center opacity-40">
          ·
        </span>
        <span className="min-w-0 break-words">
          {label}
          <span className="text-muted-foreground/70">: {valuePreview(diff.value)}</span>
        </span>
      </div>
    );
  }

  if (diff.kind === "added") {
    return (
      <Row label={label} status="added" depth={depth}>
        <span className="opacity-90">: {valuePreview(diff.value)}</span>
      </Row>
    );
  }

  if (diff.kind === "removed") {
    return (
      <Row label={label} status="removed" depth={depth}>
        <span className="opacity-90">: {valuePreview(diff.value)}</span>
      </Row>
    );
  }

  if (diff.kind === "updated") {
    return (
      <Row label={label} status="updated" depth={depth}>
        <span className="diff-old">: {valuePreview(diff.oldValue)}</span>
        <span className="mx-1 opacity-50">→</span>
        <span className="diff-new">{valuePreview(diff.newValue)}</span>
      </Row>
    );
  }

  // node: container with nested changes
  if (hideUnchanged && !hasChanges(diff)) return null;
  return (
    <>
      <div
        className="flex items-baseline gap-2 px-2 py-1 font-mono text-[12.5px] leading-relaxed text-foreground"
        style={{ paddingLeft: depth * 16 + 8 }}
      >
        <span aria-hidden="true" className="w-3 shrink-0 select-none" />
        <span>
          {label}
          <span className="text-muted-foreground"> {diff.type === "array" ? "[…]" : "{…}"}</span>
        </span>
      </div>
      {diff.entries.map((child) => (
        <EntryRows
          key={String(child.key)}
          entry={child}
          depth={depth + 1}
          isArray={diff.type === "array"}
          hideUnchanged={hideUnchanged}
        />
      ))}
    </>
  );
}

export function JsonDiffView({ diff, hideUnchanged }: { diff: Diff; hideUnchanged: boolean }) {
  if (diff.kind === "unchanged") {
    return (
      <p className="px-3 py-8 text-center text-sm text-muted-foreground">
        The two documents are identical.
      </p>
    );
  }

  if (diff.kind !== "node") {
    // Both roots are primitives (or type-changed) — render a single entry.
    return (
      <div className="py-1">
        <EntryRows
          entry={{ key: "(root)", diff }}
          depth={0}
          isArray={false}
          hideUnchanged={hideUnchanged}
        />
      </div>
    );
  }

  return (
    <div className="py-1">
      {diff.entries.map((entry) => (
        <Fragment key={String(entry.key)}>
          <EntryRows
            entry={entry}
            depth={0}
            isArray={diff.type === "array"}
            hideUnchanged={hideUnchanged}
          />
        </Fragment>
      ))}
    </div>
  );
}

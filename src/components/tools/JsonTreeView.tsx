import { useState } from "react";
import { ChevronRight } from "lucide-react";

function tokenClass(v: unknown) {
  if (v === null) return "text-json-null italic";
  if (typeof v === "string") return "text-json-string";
  if (typeof v === "number") return "text-json-number";
  if (typeof v === "boolean") return "text-json-bool";
  return "";
}

function preview(v: unknown): string {
  if (typeof v === "string") return `"${v.length > 80 ? v.slice(0, 80) + "…" : v}"`;
  return String(v);
}

const INDENT = 14;
const MAX_INDENT_LEVELS = 16;

function Node({
  name,
  value,
  depth,
  defaultOpen,
}: {
  name: string | number;
  value: unknown;
  depth: number;
  defaultOpen?: boolean;
}) {
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  const [open, setOpen] = useState(defaultOpen ?? depth < 1);

  const padding = Math.min(depth, MAX_INDENT_LEVELS) * INDENT + 6;
  const entries = isObj
    ? isArr
      ? (value as unknown[]).map((v, i) => [i, v] as const)
      : Object.entries(value as Record<string, unknown>)
    : [];

  return (
    <div>
      <div
        className="flex min-h-[26px] w-full min-w-0 items-center gap-1 overflow-hidden rounded px-1.5 py-0.5 hover:bg-[var(--grid-row-hover)]"
        style={{ paddingLeft: padding }}
      >
        {isObj ? (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-0 cursor-pointer items-center gap-1 text-left focus-visible:outline-none"
            aria-expanded={open}
          >
            <ChevronRight
              className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
            />
            <span className="truncate text-json-key" title={String(name)}>
              {String(name)}
            </span>
            <span className="ml-1 shrink-0 text-muted-foreground">
              {isArr ? `[${(value as unknown[]).length}]` : `{${entries.length}}`}
            </span>
          </button>
        ) : (
          <>
            <span className="inline-block w-3 shrink-0" />
            <span className="min-w-0 truncate text-json-key" title={String(name)}>
              {String(name)}
            </span>
            <span className="shrink-0 text-muted-foreground">:</span>
            <span className={`min-w-0 truncate ${tokenClass(value)}`}>{preview(value)}</span>
          </>
        )}
      </div>
      {isObj && open && (
        <div>
          {entries.map(([k, v]) => (
            <Node key={String(k)} name={k} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function JsonTreeView({ value }: { value: unknown }) {
  return (
    <div className="font-mono text-[12px] leading-5">
      <Node name="root" value={value} depth={0} defaultOpen />
    </div>
  );
}

import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { pathEquals, type PathSegment } from "@/lib/json/path";

type Matcher = ((key: string, value: unknown) => boolean) | null;

export function TreeNode({
  name,
  value,
  path,
  depth,
  matcher,
  defaultOpen = false,
}: {
  name: string | number;
  value: unknown;
  path: PathSegment[];
  depth: number;
  matcher: Matcher;
  defaultOpen?: boolean;
}) {
  const isObj = value !== null && typeof value === "object";
  const isArr = Array.isArray(value);
  const [open, setOpen] = useState(defaultOpen || depth < 1);
  const selection = useWorkspace((s) => s.selection);
  const setSelection = useWorkspace((s) => s.setSelection);

  const selected = pathEquals(selection, path);

  const entries = useMemo(() => {
    if (!isObj) return [] as Array<readonly [string | number, unknown]>;
    if (isArr) {
      const arr = value as unknown[];
      const cap = Math.min(arr.length, 1000);
      return Array.from({ length: cap }, (_, i) => [i, arr[i]] as const);
    }
    return Object.entries(value as Record<string, unknown>);
  }, [value, isObj, isArr]);

  const filtered = useMemo(() => {
    if (!matcher) return entries;
    return entries.filter(([k, v]) => {
      if (matcher(String(k), v)) return true;
      return containsMatch(v, matcher);
    });
  }, [entries, matcher]);

  const forceOpen = matcher !== null && filtered.length > 0;
  const isOpen = open || forceOpen;

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection(path, "tree");
    if (isObj) setOpen((v) => !v);
  };

  return (
    <div>
      <div
        className={`group flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 ${
          selected ? "bg-brand/15 text-foreground" : "hover:bg-accent/60"
        }`}
        style={{ paddingLeft: depth * 12 + 6 }}
        onClick={onClick}
      >
        {isObj ? (
          <ChevronRight
            className={`h-3 w-3 shrink-0 text-muted-foreground transition-transform ${
              isOpen ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="inline-block w-3 shrink-0" />
        )}
        <span className="text-json-key">{String(name)}</span>
        {isObj ? (
          <span className="ml-1 text-muted-foreground">
            {isArr
              ? `[${(value as unknown[]).length}]`
              : `{${Object.keys(value as object).length}}`}
          </span>
        ) : (
          <>
            <span className="text-muted-foreground">:</span>
            <span className={`truncate ${tokenClass(value)}`}>{preview(value)}</span>
          </>
        )}
      </div>
      {isObj && isOpen && (
        <div>
          {(matcher ? filtered : entries).map(([k, v]) => (
            <TreeNode
              key={String(k)}
              name={k as string | number}
              value={v}
              path={[...path, k as PathSegment]}
              depth={depth + 1}
              matcher={matcher}
            />
          ))}
          {matcher === null && isArr && (value as unknown[]).length > entries.length && (
            <div
              className="px-1.5 py-0.5 text-[11px] italic text-muted-foreground"
              style={{ paddingLeft: (depth + 1) * 12 + 18 }}
            >
              … {(value as unknown[]).length - entries.length} more items
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function tokenClass(v: unknown) {
  if (v === null) return "text-json-null italic";
  if (typeof v === "string") return "text-json-string";
  if (typeof v === "number") return "text-json-number";
  if (typeof v === "boolean") return "text-json-bool";
  return "";
}

function preview(v: unknown) {
  if (typeof v === "string") return `"${v.length > 80 ? v.slice(0, 80) + "…" : v}"`;
  return String(v);
}

function containsMatch(v: unknown, matcher: NonNullable<Matcher>): boolean {
  if (v === null) return false;
  if (typeof v !== "object") return false;
  if (Array.isArray(v)) {
    for (let i = 0; i < Math.min(v.length, 200); i++) {
      if (matcher(String(i), v[i])) return true;
      if (containsMatch(v[i], matcher)) return true;
    }
    return false;
  }
  for (const [k, child] of Object.entries(v as Record<string, unknown>)) {
    if (matcher(k, child)) return true;
    if (containsMatch(child, matcher)) return true;
  }
  return false;
}

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, MoreHorizontal, MoreVertical, GripVertical, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { valueType } from "@/lib/json/path";
import { useWorkspace } from "@/store/workspace";
import { useResolvedOrder, moveColumn } from "@/store/columnOrder";
import {
  isFilterActive,
  matchesFilter,
  useFilters,
  valueToText,
} from "@/store/filters";
import { FilterPopover } from "./FilterPopover";

type Props = {
  value: unknown;
  label?: string;
  path?: string;
  depth?: number;
};

export function NestedGrid({ value, label, path = "", depth = 0 }: Props) {
  if (Array.isArray(value)) {
    return <ArrayTable value={value} label={label} path={path} depth={depth} />;
  }
  if (value && typeof value === "object") {
    return (
      <ObjectTable
        value={value as Record<string, unknown>}
        label={label}
        path={path}
        depth={depth}
      />
    );
  }
  return <PrimitiveCell value={value} path={path} />;
}

/* ---------------- Header chip ---------------- */

function Header({
  label,
  open,
  onToggle,
  kind,
  count,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  kind: "object" | "array";
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="group flex w-full cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-left font-mono text-[11px] transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent/40"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center rounded text-muted-foreground transition-transform duration-[var(--motion-duration-fast)] group-hover:text-foreground">
        {open ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </span>
      <span className="rounded bg-muted/50 px-1 py-px font-mono text-[10px] text-muted-foreground">
        {open ? "[−]" : "[+]"}
      </span>
      <span className="font-semibold text-foreground">{label}</span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] tabular-nums",
          kind === "array"
            ? "bg-brand/15 text-brand"
            : "bg-muted text-muted-foreground"
        )}
      >
        {kind === "array" ? `${count}` : `{${count}}`}
      </span>
    </button>
  );
}

function CollapsibleBody({
  open,
  children,
  className,
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)]",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        className
      )}
    >
      <div className="overflow-hidden">{children}</div>
    </div>
  );
}

/* ---------------- Object ---------------- */

function ObjectTable({
  value,
  label,
  path,
  depth,
}: {
  value: Record<string, unknown>;
  label?: string;
  path: string;
  depth: number;
}) {
  const entries = Object.entries(value);
  const [open, setOpen] = useState(true);

  const body = (
    <table className="w-full border-collapse font-mono text-[12px]">
      <tbody>
        {entries.map(([k, v]) => (
          <tr key={k} className="align-top">
            <td className="w-[160px] min-w-[120px] border-y border-r border-border bg-muted/30 px-2.5 py-1.5 text-foreground/80">
              {k}
            </td>
            <td className="border-y border-border p-0">
              {isContainer(v) ? (
                <div className="p-1.5">
                  <NestedGrid
                    value={v}
                    label={k}
                    path={joinPath(path, k)}
                    depth={depth + 1}
                  />
                </div>
              ) : (
                <div className="px-2.5 py-1.5">
                  <PrimitiveCell value={v} path={joinPath(path, k)} />
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (label === undefined) {
    return (
      <div className="overflow-hidden rounded-md border border-border bg-card/40">
        {body}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card/40">
      <Header
        label={label}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        kind="object"
        count={entries.length}
      />
      <CollapsibleBody open={open} className="border-t border-border">
        {body}
      </CollapsibleBody>
    </div>
  );
}

/* ---------------- Array ---------------- */

function ArrayTable({
  value,
  label,
  path,
  depth,
}: {
  value: unknown[];
  label?: string;
  path: string;
  depth: number;
}) {
  const [open, setOpen] = useState(true);
  const filterState = useFilters((s) => s.filters);
  const clearArray = useFilters((s) => s.clearArray);

  const allObjects =
    value.length > 0 &&
    value.every((v) => v && typeof v === "object" && !Array.isArray(v));

  const columns = useMemo(() => {
    if (!allObjects) return [] as string[];
    const keys = new Set<string>();
    for (const row of value) {
      for (const k of Object.keys(row as Record<string, unknown>)) keys.add(k);
    }
    return Array.from(keys);
  }, [value, allObjects]);

  const orderedColumns = useResolvedOrder(path, columns);

  // Apply filters & sort
  const processed = useMemo(() => {
    let indices = value.map((_, i) => i);
    if (allObjects) {
      // filter
      for (const c of columns) {
        const key = `${path}::${c}`;
        const f = filterState[key];
        if (!f) continue;
        if (!isFilterActive(f)) continue;
        indices = indices.filter((i) => {
          const row = value[i] as Record<string, unknown>;
          return matchesFilter(row[c], f);
        });
      }
      // sort: first sorted column wins
      for (const c of columns) {
        const key = `${path}::${c}`;
        const f = filterState[key];
        if (!f || !f.sort) continue;
        const dir = f.sort === "asc" ? 1 : -1;
        indices = [...indices].sort((a, b) => {
          const av = (value[a] as Record<string, unknown>)[c];
          const bv = (value[b] as Record<string, unknown>)[c];
          const an = Number(av);
          const bn = Number(bv);
          if (Number.isFinite(an) && Number.isFinite(bn)) {
            return (an - bn) * dir;
          }
          return valueToText(av).localeCompare(valueToText(bv)) * dir;
        });
        break;
      }
    }
    return indices;
  }, [value, columns, filterState, path, allObjects]);

  const activeFilterCount = useMemo(() => {
    if (!allObjects) return 0;
    let n = 0;
    for (const c of columns) {
      const f = filterState[`${path}::${c}`];
      if (f && (isFilterActive(f) || f.sort)) n++;
    }
    return n;
  }, [columns, filterState, path, allObjects]);

  const body = allObjects ? (
    <div>
      <table className="w-max min-w-full border-collapse font-mono text-[12px]">
        <ColumnHeaderRow
          path={path}
          columns={orderedColumns}
          rawColumns={columns}
          value={value}
        />
        <tbody>
          {processed.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="border-y border-border px-3 py-6 text-center text-xs text-muted-foreground"
              >
                No rows match the current filters.
              </td>
            </tr>
          )}
          {processed.map((i) => {
            const row = value[i] as Record<string, unknown>;
            return (
              <tr key={i} className="group align-top transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent/30">
                <td className="w-10 border-y border-r border-border bg-muted/30 px-2 py-1.5 text-right text-[10px] text-muted-foreground">
                  {i + 1}
                </td>
                {orderedColumns.map((c) => {
                  const v = row[c];
                  return (
                    <td
                      key={c}
                      className="border-y border-r border-border p-0 align-top"
                    >
                      {isContainer(v) ? (
                        <div className="p-1.5">
                          <NestedGrid
                            value={v}
                            label={c}
                            path={joinPath(joinPath(path, String(i)), c)}
                            depth={depth + 1}
                          />
                        </div>
                      ) : (
                        <div className="p-0">
                          <PrimitiveCell
                            value={v}
                            path={joinPath(joinPath(path, String(i)), c)}
                          />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <table className="w-full border-collapse font-mono text-[12px]">
      <tbody>
        {value.map((v, i) => (
          <tr key={i} className="align-top transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent/30">
            <td className="w-10 border-y border-r border-border bg-muted/30 px-2 py-1.5 text-right text-[10px] text-muted-foreground">
              {i + 1}
            </td>
            <td className="border-y border-border p-0">
              {isContainer(v) ? (
                <div className="p-1.5">
                  <NestedGrid
                    value={v}
                    label={String(i)}
                    path={joinPath(path, String(i))}
                    depth={depth + 1}
                  />
                </div>
              ) : (
                <div className="p-0">
                  <PrimitiveCell value={v} path={joinPath(path, String(i))} />
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const totalFiltered = allObjects
    ? processed.length
    : value.length;

  return (
    <div className="overflow-hidden rounded-md border border-border bg-card/40">
      {label !== undefined && (
        <div className="flex items-center justify-between border-b border-border bg-card/60">
          <Header
            label={label}
            open={open}
            onToggle={() => setOpen((o) => !o)}
            kind="array"
            count={value.length}
          />
          <div className="flex items-center gap-2 pr-2 text-[10px] text-muted-foreground">
            {totalFiltered !== value.length && (
              <span className="rounded bg-brand/15 px-1.5 py-0.5 text-brand">
                {totalFiltered}/{value.length}
              </span>
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={() => clearArray(path)}
                className="rounded px-1.5 py-0.5 hover:bg-accent hover:text-foreground"
                title="Clear all filters on this array"
              >
                Clear {activeFilterCount}
              </button>
            )}
            <button
              className="rounded p-1 hover:bg-accent hover:text-foreground"
              title="More"
              aria-label="More options"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
      {label === undefined ? body : <CollapsibleBody open={open}>{body}</CollapsibleBody>}
    </div>
  );
}

/* ---------------- Primitive ---------------- */

function PrimitiveCell({ value, path }: { value: unknown; path?: string }) {
  const kind = valueType(value);
  const updateAt = useWorkspace((s) => s.updateAt);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const text =
    value === undefined
      ? ""
      : value === null
        ? "null"
        : typeof value === "string"
          ? value
          : String(value);

  const [draft, setDraft] = useState(text);

  useEffect(() => {
    if (editing) {
      setDraft(text);
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, text]);

  function commit() {
    setEditing(false);
    if (!path || draft === text) return;
    updateAt(pathToSegments(path), coerce(draft, value));
  }

  function cancel() {
    setEditing(false);
    setDraft(text);
  }

  if (editing && path) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          else if (e.key === "Escape") cancel();
        }}
        className="block w-full bg-brand/8 px-2.5 py-1.5 font-mono text-[12px] text-foreground outline-none ring-1 ring-inset ring-brand/60"
      />
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() => path && setEditing(true)}
      title={path ? "Double-click to edit" : undefined}
      className={cn(
        "group/cell flex w-full items-center gap-1 px-2.5 py-1.5 text-left break-words",
        path && "cursor-text hover:bg-brand/5"
      )}
    >
      <span className={cn("flex-1 break-words", tokenClass(kind))}>{text}</span>
      {path && (
        <Pencil className="h-3 w-3 shrink-0 text-muted-foreground/0 transition group-hover/cell:text-muted-foreground/60" />
      )}
    </button>
  );
}

function pathToSegments(p: string): (string | number)[] {
  if (!p) return [];
  return p.split("/").map((s) => {
    const n = Number(s);
    return Number.isInteger(n) && String(n) === s ? n : s;
  });
}

function coerce(input: string, original: unknown): unknown {
  if (typeof original === "number") {
    const n = Number(input);
    return Number.isFinite(n) ? n : input;
  }
  if (typeof original === "boolean") {
    if (input === "true") return true;
    if (input === "false") return false;
    return input;
  }
  if (original === null) {
    if (input === "null" || input === "") return null;
    return input;
  }
  return input;
}

/* ---------------- Column header row (drag-to-reorder) ---------------- */

function ColumnHeaderRow({
  path,
  columns,
  rawColumns,
  value,
}: {
  path: string;
  columns: string[];
  rawColumns: string[];
  value: unknown[];
}) {
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  return (
    <thead className="sticky top-0 z-10">
      <tr>
        <th className="w-10 border-y border-r border-border bg-muted/60 px-1 py-1.5 text-left backdrop-blur">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-brand/15 text-brand">
            <MoreHorizontal className="h-3 w-3" />
          </span>
        </th>
        {columns.map((c) => {
          const colValues = value.map(
            (row) => (row as Record<string, unknown>)[c]
          );
          const isOver = over === c && dragging && dragging !== c;
          return (
            <th
              key={c}
              draggable
              onDragStart={(e) => {
                setDragging(c);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", c);
              }}
              onDragOver={(e) => {
                if (dragging && dragging !== c) {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setOver(c);
                }
              }}
              onDragLeave={() => setOver((o) => (o === c ? null : o))}
              onDrop={(e) => {
                e.preventDefault();
                const from = e.dataTransfer.getData("text/plain") || dragging;
                if (from && from !== c) {
                  moveColumn(path, rawColumns, from, c);
                }
                setDragging(null);
                setOver(null);
              }}
              onDragEnd={() => {
                setDragging(null);
                setOver(null);
              }}
              className={cn(
                "group/h min-w-[160px] border-y border-r border-border bg-muted/60 px-2 py-1.5 text-left font-semibold text-foreground backdrop-blur",
                dragging === c && "opacity-50",
                isOver && "ring-2 ring-inset ring-brand/60"
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing">
                  <GripVertical className="h-3 w-3 shrink-0" />
                </span>
                <span
                  className="flex-1 truncate font-mono text-[12px] font-medium text-foreground/90 underline decoration-dotted underline-offset-[3px]"
                  title={c}
                >
                  {c}
                </span>
                <FilterPopover
                  arrayPath={path}
                  column={c}
                  values={colValues}
                />
                <button
                  type="button"
                  title="Column actions"
                  aria-label="Column actions"
                  className="inline-flex h-6 w-5 items-center justify-center rounded text-muted-foreground/70 hover:bg-accent hover:text-foreground"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

function isContainer(v: unknown) {
  return v !== null && typeof v === "object";
}

function joinPath(parent: string, seg: string): string {
  return parent ? `${parent}/${seg}` : seg;
}

function tokenClass(kind: string) {
  switch (kind) {
    case "string":
      return "text-json-string";
    case "number":
      return "text-json-number";
    case "boolean":
      return "text-json-bool";
    case "null":
    case "undefined":
      return "italic text-json-null";
    default:
      return "";
  }
}
import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { useShallow } from "zustand/react/shallow";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  ChevronRight,
  Maximize2,
  MoreVertical,
  GripVertical,
  Pencil,
} from "lucide-react";
import { ArrayTableModal } from "./ArrayTableModal";
import { cn } from "@/lib/utils";
import { HUGE_JSON_BYTES } from "@/lib/json/parse";
import { slashPathToSegments, valueType } from "@/lib/json/path";
import { useWorkspace } from "@/store/workspace";
import { useResolvedOrder, moveColumn } from "@/store/columnOrder";
import {
  isFilterActive,
  matchesFilter,
  useFilters,
  valueToText,
  type ColumnFilter,
} from "@/store/filters";
import { FilterPopover } from "./FilterPopover";

const VIRTUAL_ROW_THRESHOLD = 40;
const GRID_ROW_HEIGHT = 36;
/**
 * Nested virtualizers all measure against the single outer scroll element, so deep
 * instances add scroll/resize listener contention and their offsets drift under the
 * grid's CSS transform: scale(). Only virtualize the outermost collections; render
 * deeper ones plainly (they're already inside a virtualized + collapsed ancestor).
 */
const VIRTUAL_MAX_DEPTH = 1;

type Props = {
  value: unknown;
  label?: string;
  path?: string;
  depth?: number;
  scrollElementRef?: RefObject<HTMLElement | null>;
};

export function NestedGrid({ value, label, path = "", depth = 0, scrollElementRef }: Props) {
  if (Array.isArray(value)) {
    return (
      <ArrayTable
        value={value}
        label={label}
        path={path}
        depth={depth}
        scrollElementRef={scrollElementRef}
      />
    );
  }
  if (value && typeof value === "object") {
    return (
      <ObjectTable
        value={value as Record<string, unknown>}
        label={label}
        path={path}
        depth={depth}
        scrollElementRef={scrollElementRef}
      />
    );
  }
  return <PrimitiveCell value={value} path={path} />;
}

/* ---------------- Nested shell ---------------- */

function NestedShell({
  depth,
  children,
  className,
}: {
  depth: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(depth === 0 ? "nested-grid-root" : "nested-grid-nested", className)}>
      {children}
    </div>
  );
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
      className="group flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left hover:bg-[var(--grid-row-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
    >
      <span className="inline-flex h-4 w-4 items-center justify-center text-muted-foreground group-hover:text-foreground">
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </span>
      <span className="font-mono text-[11px] font-medium text-foreground">{label}</span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums",
          kind === "array" ? "bg-brand/10 text-brand" : "bg-muted/80 text-muted-foreground",
        )}
      >
        {kind === "array" ? `${count} rows` : `${count} keys`}
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
  if (!open) return null;
  return <div className={className}>{children}</div>;
}

function defaultSectionOpen(depth: number, count: number, hugeFile: boolean) {
  if (hugeFile) return depth === 0;
  return depth === 0 || count <= 30;
}

/* ---------------- Object ---------------- */

function ObjectTable({
  value,
  label,
  path,
  depth,
  scrollElementRef,
}: {
  value: Record<string, unknown>;
  label?: string;
  path: string;
  depth: number;
  scrollElementRef?: RefObject<HTMLElement | null>;
}) {
  const hugeFile = useWorkspace((s) => (s.doc?.sizeBytes ?? 0) >= HUGE_JSON_BYTES);
  const entries = Object.entries(value);
  const [open, setOpen] = useState(() => defaultSectionOpen(depth, entries.length, hugeFile));

  const shouldVirtualize =
    depth <= VIRTUAL_MAX_DEPTH &&
    entries.length > VIRTUAL_ROW_THRESHOLD &&
    scrollElementRef != null;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? entries.length : 0,
    getScrollElement: () => scrollElementRef?.current ?? null,
    estimateSize: () => GRID_ROW_HEIGHT,
    overscan: 10,
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    shouldVirtualize && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)
      : 0;

  const body = (
    <table className="w-full border-collapse font-mono text-[12px]">
      <tbody>
        {shouldVirtualize && paddingTop > 0 && (
          <tr aria-hidden="true">
            <td colSpan={2} style={{ height: paddingTop, padding: 0, border: 0 }} />
          </tr>
        )}
        {shouldVirtualize
          ? virtualRows.map((vr) => {
              const [k, v] = entries[vr.index];
              return (
                <ObjectEntryRow
                  key={k}
                  entryKey={k}
                  entryValue={v}
                  path={path}
                  depth={depth}
                  scrollElementRef={scrollElementRef}
                  rowStyle={{ height: vr.size }}
                />
              );
            })
          : entries.map(([k, v]) => (
              <ObjectEntryRow
                key={k}
                entryKey={k}
                entryValue={v}
                path={path}
                depth={depth}
                scrollElementRef={scrollElementRef}
              />
            ))}
        {shouldVirtualize && paddingBottom > 0 && (
          <tr aria-hidden="true">
            <td colSpan={2} style={{ height: paddingBottom, padding: 0, border: 0 }} />
          </tr>
        )}
      </tbody>
    </table>
  );

  if (label === undefined) {
    return <NestedShell depth={depth}>{body}</NestedShell>;
  }
  return (
    <NestedShell depth={depth}>
      <Header
        label={label}
        open={open}
        onToggle={() => setOpen((o) => !o)}
        kind="object"
        count={entries.length}
      />
      <CollapsibleBody open={open}>{body}</CollapsibleBody>
    </NestedShell>
  );
}

/* ---------------- Array ---------------- */

function ArrayTable({
  value,
  label,
  path,
  depth,
  scrollElementRef,
}: {
  value: unknown[];
  label?: string;
  path: string;
  depth: number;
  scrollElementRef?: RefObject<HTMLElement | null>;
}) {
  const hugeFile = useWorkspace((s) => (s.doc?.sizeBytes ?? 0) >= HUGE_JSON_BYTES);
  const [open, setOpen] = useState(() => defaultSectionOpen(depth, value.length, hugeFile));
  const [modalOpen, setModalOpen] = useState(false);
  const clearArray = useFilters((s) => s.clearArray);

  const allObjects =
    value.length > 0 && value.every((v) => v && typeof v === "object" && !Array.isArray(v));

  const columns = useMemo(() => {
    if (!allObjects) return [] as string[];
    const keys = new Set<string>();
    for (const row of value) {
      for (const k of Object.keys(row as Record<string, unknown>)) keys.add(k);
    }
    return Array.from(keys);
  }, [value, allObjects]);

  // Subscribe only to filters for this array's columns so edits on other
  // arrays don't trigger a re-filter/re-sort here.
  const filterState = useFilters(
    useShallow((s) => {
      const slice: Record<string, ColumnFilter> = {};
      for (const c of columns) {
        const f = s.filters[`${path}::${c}`];
        if (f) slice[`${path}::${c}`] = f;
      }
      return slice;
    }),
  );

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

  const shouldVirtualize =
    depth <= VIRTUAL_MAX_DEPTH &&
    allObjects &&
    processed.length > VIRTUAL_ROW_THRESHOLD &&
    scrollElementRef != null;

  const rowVirtualizer = useVirtualizer({
    count: shouldVirtualize ? processed.length : 0,
    getScrollElement: () => scrollElementRef?.current ?? null,
    estimateSize: () => GRID_ROW_HEIGHT,
    overscan: 12,
  });

  const virtualRows = shouldVirtualize ? rowVirtualizer.getVirtualItems() : [];
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom =
    shouldVirtualize && virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0)
      : 0;

  const body = allObjects ? (
    <div>
      <table className="grid-table w-max min-w-full font-mono text-[12px]">
        <ColumnHeaderRow path={path} columns={orderedColumns} rawColumns={columns} value={value} />
        <tbody>
          {processed.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="grid-line-h px-3 py-6 text-center text-xs text-muted-foreground"
              >
                No rows match the current filters.
              </td>
            </tr>
          )}
          {shouldVirtualize && paddingTop > 0 && (
            <tr aria-hidden="true">
              <td
                colSpan={columns.length + 1}
                style={{ height: paddingTop, padding: 0, border: 0 }}
              />
            </tr>
          )}
          {shouldVirtualize
            ? virtualRows.map((vr) => (
                <ObjectArrayRow
                  key={vr.key}
                  rowIndex={processed[vr.index]}
                  rowStyle={{ height: vr.size }}
                  value={value}
                  orderedColumns={orderedColumns}
                  path={path}
                  depth={depth}
                  scrollElementRef={scrollElementRef}
                />
              ))
            : processed.map((i) => (
                <ObjectArrayRow
                  key={i}
                  rowIndex={i}
                  value={value}
                  orderedColumns={orderedColumns}
                  path={path}
                  depth={depth}
                  scrollElementRef={scrollElementRef}
                />
              ))}
          {shouldVirtualize && paddingBottom > 0 && (
            <tr aria-hidden="true">
              <td
                colSpan={columns.length + 1}
                style={{ height: paddingBottom, padding: 0, border: 0 }}
              />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ) : (
    <table className="w-full border-collapse font-mono text-[12px]">
      <tbody>
        {value.map((v, i) => (
          <tr key={i} className="align-top hover:bg-accent/30">
            <td className="grid-row-index grid-line-h grid-line-v w-10 px-2 py-2 text-right text-[10px] tabular-nums">
              {i + 1}
            </td>
            <td className="grid-line-h p-0">
              {isContainer(v) ? (
                <div>
                  <NestedGrid
                    value={v}
                    label={String(i)}
                    path={joinPath(path, String(i))}
                    depth={depth + 1}
                    scrollElementRef={scrollElementRef}
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

  const totalFiltered = allObjects ? processed.length : value.length;

  return (
    <NestedShell depth={depth}>
      {label !== undefined && (
        <div className="flex items-center justify-between grid-line-h">
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
                className="rounded px-1.5 py-0.5 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
                title="Clear all filters on this array"
              >
                Clear {activeFilterCount}
              </button>
            )}
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 sm:min-h-8 sm:min-w-8"
              title="Open array in modal"
              aria-label="Open array in modal"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
      {label === undefined ? body : <CollapsibleBody open={open}>{body}</CollapsibleBody>}
      {label !== undefined && (
        <ArrayTableModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          label={label}
          path={path}
          value={value}
        />
      )}
    </NestedShell>
  );
}

const ObjectEntryRow = memo(function ObjectEntryRow({
  entryKey,
  entryValue,
  path,
  depth,
  scrollElementRef,
  rowStyle,
}: {
  entryKey: string;
  entryValue: unknown;
  path: string;
  depth: number;
  scrollElementRef?: RefObject<HTMLElement | null>;
  rowStyle?: CSSProperties;
}) {
  const cellPath = joinPath(path, entryKey);
  return (
    <tr className="align-top" style={rowStyle}>
      <ObjectKeyCell path={cellPath} label={entryKey} />
      <td className="grid-line-h p-0">
        {isContainer(entryValue) ? (
          <div>
            <NestedGrid
              value={entryValue}
              label={entryKey}
              path={cellPath}
              depth={depth + 1}
              scrollElementRef={scrollElementRef}
            />
          </div>
        ) : (
          <div className="px-2.5 py-1.5">
            <PrimitiveCell value={entryValue} path={cellPath} />
          </div>
        )}
      </td>
    </tr>
  );
});

function ObjectKeyCell({ path, label }: { path: string; label: string }) {
  const setSelection = useWorkspace((s) => s.setSelection);
  return (
    <td className="grid-line-h grid-line-v w-[160px] min-w-[120px] bg-muted/10 px-2.5 py-1.5 text-foreground/80">
      <button
        type="button"
        onClick={() => setSelection(slashPathToSegments(path), "grid")}
        className="w-full cursor-pointer text-left hover:text-brand focus-visible:text-brand focus-visible:outline-none"
      >
        {label}
      </button>
    </td>
  );
}

const ObjectArrayRow = memo(function ObjectArrayRow({
  rowIndex,
  value,
  orderedColumns,
  path,
  depth,
  scrollElementRef,
  rowStyle,
}: {
  rowIndex: number;
  value: unknown[];
  orderedColumns: string[];
  path: string;
  depth: number;
  scrollElementRef?: RefObject<HTMLElement | null>;
  rowStyle?: { height: number };
}) {
  const row = value[rowIndex] as Record<string, unknown>;
  return (
    <tr
      className={cn("group align-top transition-colors duration-[var(--motion-duration-fast)]", rowIndex % 2 === 1 && "bg-[var(--grid-row-alt)]")}
      style={rowStyle}
    >
      <RowIndexCell path={joinPath(path, String(rowIndex))} index={rowIndex + 1} />
      {orderedColumns.map((c) => {
        const v = row[c];
        return (
          <td
            key={c}
            className="grid-body-cell grid-line-v p-0 align-top group-hover:bg-[var(--grid-row-hover)]"
          >
            {isContainer(v) ? (
              <div>
                <NestedGrid
                  value={v}
                  label={c}
                  path={joinPath(joinPath(path, String(rowIndex)), c)}
                  depth={depth + 1}
                  scrollElementRef={scrollElementRef}
                />
              </div>
            ) : (
              <div className="p-0">
                <PrimitiveCell value={v} path={joinPath(joinPath(path, String(rowIndex)), c)} />
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
});

function RowIndexCell({ path, index }: { path: string; index: number }) {
  const setSelection = useWorkspace((s) => s.setSelection);
  return (
    <td className="grid-row-index grid-row-index-cell grid-body-cell grid-line-v w-11 px-2.5 py-2.5 text-right">
      <button
        type="button"
        onClick={() => setSelection(slashPathToSegments(path), "grid")}
        className="w-full cursor-pointer text-right tabular-nums hover:text-brand focus-visible:text-brand focus-visible:outline-none"
      >
        {index}
      </button>
    </td>
  );
}

/* ---------------- Primitive ---------------- */

function PrimitiveCell({ value, path }: { value: unknown; path?: string }) {
  const kind = valueType(value);
  const updateAt = useWorkspace((s) => s.updateAt);
  const setSelection = useWorkspace((s) => s.setSelection);
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
    updateAt(slashPathToSegments(path), coerce(draft, value));
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
        className="block w-full bg-brand/10 px-2.5 py-2 font-mono text-[12px] text-foreground outline-none ring-2 ring-inset ring-brand/50"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => path && setSelection(slashPathToSegments(path), "grid")}
      onDoubleClick={() => path && setEditing(true)}
      title={path ? "Click to inspect · double-click to edit" : undefined}
      className={cn(
        "group/cell flex w-full items-center gap-1 px-2.5 py-1.5 text-left break-words",
        path && "cursor-pointer hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50",
      )}
    >
      <span className={cn("flex-1 break-words", tokenClass(kind))}>{text}</span>
      {path && (
        <Pencil className="h-3 w-3 shrink-0 text-muted-foreground/0 transition group-hover/cell:text-muted-foreground/60" />
      )}
    </button>
  );
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
        <th className="grid-header-cell grid-row-index grid-line-v sticky top-0 z-10 w-11 px-2 py-2 text-left">
          <span className="inline-flex h-5 w-7 items-center justify-center rounded bg-brand/10 text-[10px] font-semibold text-brand">
            #
          </span>
        </th>
        {columns.map((c) => {
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
                "group/h grid-header-cell grid-line-v sticky top-0 z-10 min-w-[148px] px-2.5 py-2",
                dragging === c && "opacity-50",
                isOver && "ring-2 ring-inset ring-brand/40",
              )}
            >
              <div className="flex items-center gap-1.5">
                <span className="cursor-grab text-muted-foreground/60 hover:text-foreground active:cursor-grabbing">
                  <GripVertical className="h-3 w-3 shrink-0" />
                </span>
                <span
                  className="flex-1 truncate font-mono text-xs font-medium text-foreground"
                  title={c}
                >
                  {c}
                </span>
                <FilterPopover
                  arrayPath={path}
                  column={c}
                  getValues={() =>
                    value.slice(0, 200).map((row) => (row as Record<string, unknown>)[c])
                  }
                />
                <button
                  type="button"
                  title="Column actions"
                  aria-label="Column actions"
                  className="inline-flex h-6 w-5 items-center justify-center rounded text-muted-foreground/70 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50"
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

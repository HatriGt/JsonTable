import { useMemo, useRef, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWorkspace } from "@/store/workspace";
import { getAtPath } from "@/lib/json/path";
import { buildGrid, cellDisplay } from "@/lib/json/flatten";
import { Breadcrumb } from "./Breadcrumb";
import { ArrowUp, ArrowDown, Table2, LayoutGrid, Rows3 } from "lucide-react";
import { NestedGrid } from "./NestedGrid";
import { cn } from "@/lib/utils";

type JsonGridProps = {
  lockedMode?: "nested" | "flat";
};

export function JsonGrid({ lockedMode }: JsonGridProps) {
  const { doc, selection, setSelection } = useWorkspace();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [mode, setMode] = useState<"nested" | "flat">(lockedMode ?? "nested");
  const parentRef = useRef<HTMLDivElement>(null);

  const value = doc ? getAtPath(doc.value, selection) : undefined;
  const grid = useMemo(() => buildGrid(value), [value]);

  const columns = useMemo<ColumnDef<unknown>[]>(() => {
    return grid.columns.map((col) => ({
      id: col.key,
      header: col.key,
      accessorFn: (row: unknown) => {
        if (row && typeof row === "object") {
          return (row as Record<string, unknown>)[col.key];
        }
        return row;
      },
      filterFn: (row, columnId, value) => {
        const raw = row.getValue(columnId);
        const text = raw == null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
        return text.toLowerCase().includes(String(value).toLowerCase());
      },
    }));
  }, [grid.columns]);

  const table = useReactTable({
    data: grid.rows,
    columns,
    state: { sorting, columnFilters: filters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 12,
  });

  if (!doc) return null;

  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = rowVirtualizer.getTotalSize() - (virtualItems.at(-1)?.end ?? 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 pr-2">
        <Breadcrumb />
        {!lockedMode && (
          <div className="flex items-center gap-1 rounded border border-border bg-card p-0.5 text-[11px]">
            <button
              onClick={() => setMode("nested")}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:text-foreground",
                mode === "nested" && "bg-accent text-foreground",
              )}
              title="Nested grid (recursive tables)"
            >
              <LayoutGrid className="h-3 w-3" /> Nested
            </button>
            <button
              onClick={() => setMode("flat")}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 text-muted-foreground hover:text-foreground",
                mode === "flat" && "bg-accent text-foreground",
              )}
              title="Flat array table"
            >
              <Rows3 className="h-3 w-3" /> Flat
            </button>
          </div>
        )}
      </div>
      {(lockedMode ?? mode) === "nested" ? (
        <div className="flex-1 overflow-auto border-t border-border p-2">
          <NestedGrid value={value} />
        </div>
      ) : !grid.isTabular ? (
        <EmptyGrid reason={grid.reason ?? ""} />
      ) : grid.rows.length === 0 ? (
        <EmptyGrid reason="Empty array." />
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden border-t border-border">
          <div ref={parentRef} className="relative flex-1 overflow-auto">
            <table className="w-full border-separate border-spacing-0 font-mono text-[12px]">
              <thead className="sticky top-0 z-20">
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id}>
                    <th className="sticky left-0 z-30 w-12 border-b border-r border-border bg-card px-2 py-1.5 text-left text-[10px] font-normal text-muted-foreground">
                      #
                    </th>
                    {hg.headers.map((h) => {
                      const sort = h.column.getIsSorted();
                      return (
                        <th
                          key={h.id}
                          className="min-w-[140px] border-b border-r border-border bg-card px-2 py-1.5 text-left font-semibold text-foreground"
                        >
                          <button
                            className="flex w-full items-center justify-between gap-1 hover:text-brand"
                            onClick={h.column.getToggleSortingHandler()}
                          >
                            <span className="truncate">
                              {flexRender(h.column.columnDef.header, h.getContext())}
                            </span>
                            {sort === "asc" && <ArrowUp className="h-3 w-3" />}
                            {sort === "desc" && <ArrowDown className="h-3 w-3" />}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                ))}
                <tr>
                  <th className="sticky left-0 z-30 w-12 border-b border-r border-border bg-card/80 px-2 py-1" />
                  {table.getHeaderGroups()[0].headers.map((h) => (
                    <th key={h.id} className="border-b border-r border-border bg-card/80 px-1 py-1">
                      <input
                        value={(h.column.getFilterValue() as string) ?? ""}
                        onChange={(e) => h.column.setFilterValue(e.target.value)}
                        placeholder="filter…"
                        className="h-6 w-full rounded border border-transparent bg-muted/40 px-2 text-[11px] outline-none placeholder:text-muted-foreground/60 focus:border-brand focus:bg-background"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paddingTop > 0 && (
                  <tr style={{ height: paddingTop }}>
                    <td colSpan={grid.columns.length + 1} />
                  </tr>
                )}
                {virtualItems.map((vr) => {
                  const row = rows[vr.index];
                  const rowIndex = row.index;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelection([...selection, rowIndex], "grid")}
                      className="group cursor-pointer hover:bg-accent/40"
                      style={{ height: 32 }}
                    >
                      <td className="sticky left-0 z-10 w-12 border-b border-r border-border bg-card px-2 text-right text-[10px] text-muted-foreground group-hover:bg-accent/40">
                        {rowIndex}
                      </td>
                      {row.getVisibleCells().map((cell) => {
                        const raw = cell.getValue();
                        const d = cellDisplay(raw);
                        return (
                          <td
                            key={cell.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelection([...selection, rowIndex, cell.column.id], "grid");
                            }}
                            className="max-w-[400px] truncate border-b border-r border-border px-2"
                            title={typeof raw === "string" ? raw : d.text}
                          >
                            <span className={tokenClass(d.kind)}>{d.text}</span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {paddingBottom > 0 && (
                  <tr style={{ height: paddingBottom }}>
                    <td colSpan={grid.columns.length + 1} />
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex shrink-0 items-center justify-between border-t border-border px-3 py-1 text-[11px] text-muted-foreground">
            <span>
              {rows.length.toLocaleString()} / {grid.rows.length.toLocaleString()} rows
            </span>
            <span>{grid.columns.length} columns</span>
          </div>
        </div>
      )}
    </div>
  );
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
      return "text-json-null italic";
    case "object":
    case "array":
      return "text-muted-foreground italic";
    default:
      return "";
  }
}

function EmptyGrid({ reason }: { reason: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t border-border p-8 text-center text-muted-foreground">
      <Table2 className="h-8 w-8 opacity-40" />
      <p className="text-sm">{reason}</p>
      <p className="text-[11px]">
        Pick an array in the tree to render it as a sortable, filterable table.
      </p>
    </div>
  );
}

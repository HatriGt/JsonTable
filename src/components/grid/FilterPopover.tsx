import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
  X,
  Search as SearchIcon,
  ListChecks,
  SlidersHorizontal,
  Hash,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  defaultFilter,
  isFilterActive,
  useFilters,
  valueToText,
  type ColumnFilter,
  type ConditionOp,
} from "@/store/filters";
import { cn } from "@/lib/utils";

type Props = {
  arrayPath: string;
  column: string;
  values: unknown[];
};

export function FilterPopover({ arrayPath, column, values }: Props) {
  const getFilter = useFilters((s) => s.get);
  const setFilter = useFilters((s) => s.set);
  const clearFilter = useFilters((s) => s.clear);
  const current = getFilter(arrayPath, column);
  const active = isFilterActive(current) || current.sort !== null;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnFilter>(current);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"values" | "condition">("values");

  // Reset draft each time dialog opens
  function onOpenChange(v: boolean) {
    if (v) {
      setDraft(getFilter(arrayPath, column));
      setSearch("");
      setTab("values");
    }
    setOpen(v);
  }

  const distinct = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of values) {
      const t = valueToText(v);
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([v, c]) => ({ value: v, count: c }));
  }, [values]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return distinct;
    return distinct.filter(({ value }) => value.toLowerCase().includes(q));
  }, [distinct, search]);

  const selectedSet = useMemo(
    () => new Set(draft.selected ?? distinct.map((d) => d.value)),
    [draft.selected, distinct]
  );
  const allSelected = draft.selected === null || draft.selected.length === distinct.length;

  function toggleValue(v: string) {
    const base = new Set(draft.selected ?? distinct.map((d) => d.value));
    if (base.has(v)) base.delete(v);
    else base.add(v);
    setDraft({ ...draft, selected: Array.from(base) });
  }

  function toggleAll() {
    if (allSelected) setDraft({ ...draft, selected: [] });
    else setDraft({ ...draft, selected: null });
  }

  function apply() {
    // Normalize: if "all selected" make it null
    const normalized: ColumnFilter = {
      ...draft,
      selected:
        draft.selected === null || draft.selected.length === distinct.length
          ? null
          : draft.selected,
    };
    setFilter(arrayPath, column, normalized);
    setOpen(false);
  }

  function reset() {
    const d = defaultFilter();
    setDraft(d);
    clearFilter(arrayPath, column);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          title="Filter & sort"
          className={cn(
            "relative inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground",
            active && "text-brand"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {active && (
            <span className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full bg-brand" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent
        className="block w-[460px] max-w-[94vw] gap-0 overflow-hidden border-border/70 p-0 shadow-2xl"
      >
        <div className="flex max-h-[85vh] flex-col">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-border/70 bg-gradient-to-br from-brand/10 via-card to-card px-5 py-4">
          <div className="absolute inset-0 bg-grid opacity-[0.04]" />
          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                <Filter className="h-3 w-3 text-brand" /> Column filter
              </div>
              <h2 className="mt-1 truncate font-mono text-base font-semibold text-foreground">
                {column}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Hash className="h-3 w-3" /> {values.length.toLocaleString()} rows
                </span>
                <span className="text-border">·</span>
                <span>{distinct.length.toLocaleString()} unique</span>
                {isFilterActive(current) && (
                  <>
                    <span className="text-border">·</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-brand">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" /> active
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 border-b border-border/70 px-5 py-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Sort
          </span>
          <div className="ml-auto inline-flex rounded-lg border border-border bg-card/60 p-0.5">
            <SortBtn
              active={draft.sort === "asc"}
              onClick={() =>
                setDraft({ ...draft, sort: draft.sort === "asc" ? null : "asc" })
              }
            >
              <ArrowUpAZ className="h-3.5 w-3.5" /> Asc
            </SortBtn>
            <SortBtn
              active={draft.sort === "desc"}
              onClick={() =>
                setDraft({ ...draft, sort: draft.sort === "desc" ? null : "desc" })
              }
            >
              <ArrowDownAZ className="h-3.5 w-3.5" /> Desc
            </SortBtn>
          </div>
        </div>

        {/* Segmented tabs */}
        <div className="flex gap-1 border-b border-border/70 bg-card/30 px-3 pt-2">
          <SegmentTab
            active={tab === "values"}
            onClick={() => setTab("values")}
            icon={<ListChecks className="h-3.5 w-3.5" />}
            label="Values"
          />
          <SegmentTab
            active={tab === "condition"}
            onClick={() => setTab("condition")}
            icon={<SlidersHorizontal className="h-3.5 w-3.5" />}
            label="Condition"
          />
        </div>

        {/* Values */}
        {tab === "values" && (
          <div>
            <div className="space-y-2.5 px-5 py-3">
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search values…"
                  className="h-9 pl-8 text-xs"
                />
              </div>
              <div className="flex items-center justify-between">
                <button
                  onClick={toggleAll}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
                >
                  <Check className="h-3 w-3" />
                  {allSelected ? "Clear all" : "Select all"}
                  <span className="text-muted-foreground">
                    · {filtered.length}
                  </span>
                </button>
                <div className="inline-flex overflow-hidden rounded-md border border-border text-[10px]">
                  <ModeBtn
                    active={draft.mode === "include"}
                    onClick={() => setDraft({ ...draft, mode: "include" })}
                  >
                    Include
                  </ModeBtn>
                  <ModeBtn
                    active={draft.mode === "exclude"}
                    onClick={() => setDraft({ ...draft, mode: "exclude" })}
                  >
                    Exclude
                  </ModeBtn>
                </div>
              </div>
            </div>
            <div className="max-h-[280px] overflow-auto border-t border-border/60 px-2 py-1">
              {filtered.length === 0 && (
                <div className="px-3 py-10 text-center text-xs text-muted-foreground">
                  No values match “{search}”.
                </div>
              )}
              {filtered.map(({ value, count }) => {
                const isOn = selectedSet.has(value);
                return (
                  <button
                    key={value}
                    onClick={() => toggleValue(value)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition",
                      isOn ? "bg-brand/8" : "hover:bg-accent/50"
                    )}
                  >
                    <Checkbox checked={isOn} className="h-3.5 w-3.5" />
                    <span className="flex-1 truncate font-mono text-foreground/90">
                      {value === "" ? (
                        <span className="italic text-muted-foreground">(empty)</span>
                      ) : (
                        value
                      )}
                    </span>
                    <span className="rounded bg-muted/50 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Condition */}
        {tab === "condition" && (
          <div className="space-y-3 px-5 py-4">
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Operator
              </span>
              <select
                value={draft.condition.op}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    condition: {
                      ...draft.condition,
                      op: e.target.value as ConditionOp,
                    },
                  })
                }
                className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="any">No condition</option>
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="notEquals">Not equals</option>
                <option value="startsWith">Starts with</option>
                <option value="endsWith">Ends with</option>
                <option value="gt">Greater than (number)</option>
                <option value="lt">Less than (number)</option>
                <option value="between">Between (number)</option>
              </select>
            </label>
            {draft.condition.op !== "any" && (
              <div
                className={cn(
                  "grid gap-2",
                  draft.condition.op === "between" && "grid-cols-2"
                )}
              >
                <Input
                  value={draft.condition.a ?? ""}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      condition: { ...draft.condition, a: e.target.value },
                    })
                  }
                  placeholder={draft.condition.op === "between" ? "From" : "Value"}
                  className="h-9 text-xs"
                />
                {draft.condition.op === "between" && (
                  <Input
                    value={draft.condition.b ?? ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        condition: { ...draft.condition, b: e.target.value },
                      })
                    }
                    placeholder="To"
                    className="h-9 text-xs"
                  />
                )}
              </div>
            )}
            <p className="rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Conditions combine with selected values above using AND logic.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-card/50 px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={reset}
          >
            <RotateCcw className="mr-1 h-3 w-3" /> Reset
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs"
              onClick={() => setOpen(false)}
            >
              <X className="mr-1 h-3 w-3" /> Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 bg-brand px-4 text-xs text-white hover:bg-brand/90"
              onClick={apply}
            >
              <Check className="mr-1 h-3 w-3" /> Apply
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:text-foreground",
        active && "bg-brand text-white shadow-sm hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function SegmentTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative -mb-px inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-2 text-[11px] font-medium transition",
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ModeBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-2.5 py-1 font-medium transition",
        active
          ? "bg-brand/15 text-brand"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
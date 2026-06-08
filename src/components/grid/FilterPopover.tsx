import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  Check,
  Filter,
  Hash,
  ListChecks,
  RotateCcw,
  Search as SearchIcon,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const OPERATORS: { value: ConditionOp; label: string }[] = [
  { value: "any", label: "No condition" },
  { value: "contains", label: "Contains" },
  { value: "equals", label: "Equals" },
  { value: "notEquals", label: "Not equals" },
  { value: "startsWith", label: "Starts with" },
  { value: "endsWith", label: "Ends with" },
  { value: "gt", label: "Greater than" },
  { value: "lt", label: "Less than" },
  { value: "between", label: "Between" },
];

export function FilterPopover({ arrayPath, column, values }: Props) {
  const getFilter = useFilters((s) => s.get);
  const setFilter = useFilters((s) => s.set);
  const clearFilter = useFilters((s) => s.clear);
  const current = getFilter(arrayPath, column);
  const active = isFilterActive(current) || current.sort !== null;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ColumnFilter>(current);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("values");

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
      .map(([value, count]) => ({ value, count }));
  }, [values]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return distinct;
    return distinct.filter(({ value }) => value.toLowerCase().includes(q));
  }, [distinct, search]);

  const selectedSet = useMemo(
    () => new Set(draft.selected ?? distinct.map((d) => d.value)),
    [draft.selected, distinct],
  );
  const allSelected = draft.selected === null || draft.selected.length === distinct.length;
  const selectedCount = draft.selected === null ? distinct.length : draft.selected.length;

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
    setDraft(defaultFilter());
    clearFilter(arrayPath, column);
    setOpen(false);
  }

  const sortValue = draft.sort ?? "none";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          title="Filter & sort column"
          aria-label={`Filter column ${column}`}
          className={cn(
            "relative inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[background-color,color] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground",
            active && "bg-brand/12 text-brand hover:bg-brand/15 hover:text-brand",
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          {active && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-[var(--pane-header)] bg-brand" />
          )}
        </button>
      </DialogTrigger>
      <DialogContent className="block max-h-[90vh] w-[min(480px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[480px]">
        <div className="flex max-h-[85vh] flex-col">
          <div className="space-y-2 border-b border-border px-5 py-4">
            <div className="flex items-start justify-between gap-2 pr-6">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Filter column</p>
                <p className="truncate font-mono text-base font-semibold">{column}</p>
              </div>
              {active && (
                <Badge
                  variant="secondary"
                  className="shrink-0 bg-brand/12 text-brand hover:bg-brand/12"
                >
                  Active
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Hash className="h-3 w-3" />
                {values.length.toLocaleString()} rows
              </span>
              <span>·</span>
              <span>{distinct.length.toLocaleString()} unique</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <span className="text-xs font-medium text-muted-foreground">Sort</span>
            <ToggleGroup
              type="single"
              value={sortValue}
              onValueChange={(v) =>
                setDraft({
                  ...draft,
                  sort: v === "none" || !v ? null : (v as "asc" | "desc"),
                })
              }
              className="rounded-lg border border-border bg-muted/40 p-0.5"
            >
              <ToggleGroupItem
                value="none"
                className="h-7 px-2.5 text-xs data-[state=on]:bg-background"
              >
                None
              </ToggleGroupItem>
              <ToggleGroupItem
                value="asc"
                className="h-7 gap-1 px-2.5 text-xs data-[state=on]:bg-background"
              >
                <ArrowUpAZ className="h-3 w-3" /> A→Z
              </ToggleGroupItem>
              <ToggleGroupItem
                value="desc"
                className="h-7 gap-1 px-2.5 text-xs data-[state=on]:bg-background"
              >
                <ArrowDownAZ className="h-3 w-3" /> Z→A
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="min-h-0 flex-1 gap-0">
            <TabsList className="mx-4 mt-3 h-8 w-[calc(100%-2rem)]">
              <TabsTrigger value="values" className="flex-1 gap-1.5 text-xs">
                <ListChecks className="h-3.5 w-3.5" />
                Values
              </TabsTrigger>
              <TabsTrigger value="condition" className="flex-1 gap-1.5 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Condition
              </TabsTrigger>
            </TabsList>

            <TabsContent value="values" className="mt-0 space-y-0">
              <div className="space-y-2.5 px-5 py-3">
                <div className="relative">
                  <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search values…"
                    className="h-8 pl-8 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="cursor-pointer text-xs font-medium text-brand hover:underline"
                  >
                    {allSelected ? "Clear all" : "Select all"}
                    <span className="text-muted-foreground">
                      {" "}
                      · {selectedCount}/{distinct.length}
                    </span>
                  </button>
                  <ToggleGroup
                    type="single"
                    value={draft.mode}
                    onValueChange={(v) =>
                      v && setDraft({ ...draft, mode: v as "include" | "exclude" })
                    }
                    className="rounded-md border border-border"
                  >
                    <ToggleGroupItem
                      value="include"
                      className="h-7 px-2.5 text-[11px] data-[state=on]:bg-brand/12 data-[state=on]:text-brand"
                    >
                      Include
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="exclude"
                      className="h-7 px-2.5 text-[11px] data-[state=on]:bg-brand/12 data-[state=on]:text-brand"
                    >
                      Exclude
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>
              <ScrollArea className="h-[240px] border-t border-border">
                <div className="p-1.5">
                  {filtered.length === 0 && (
                    <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                      No values match “{search}”.
                    </p>
                  )}
                  {filtered.map(({ value, count }) => {
                    const isOn = selectedSet.has(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleValue(value)}
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors duration-[var(--motion-duration-fast)]",
                          isOn ? "bg-brand/10" : "hover:bg-accent/60",
                        )}
                      >
                        <Checkbox checked={isOn} className="pointer-events-none h-3.5 w-3.5" />
                        <span className="min-w-0 flex-1 truncate font-mono">
                          {value === "" ? (
                            <span className="italic text-muted-foreground">(empty)</span>
                          ) : (
                            value
                          )}
                        </span>
                        <Badge
                          variant="secondary"
                          className="h-5 shrink-0 px-1.5 font-mono text-[10px] tabular-nums"
                        >
                          {count}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="condition" className="mt-0 space-y-3 px-5 py-4">
              <div className="space-y-1.5">
                <label
                  htmlFor={`filter-op-${column}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Operator
                </label>
                <Select
                  value={draft.condition.op}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      condition: { ...draft.condition, op: v as ConditionOp },
                    })
                  }
                >
                  <SelectTrigger id={`filter-op-${column}`} className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPERATORS.map((op) => (
                      <SelectItem key={op.value} value={op.value} className="text-xs">
                        {op.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {draft.condition.op !== "any" && (
                <div
                  className={cn("grid gap-2", draft.condition.op === "between" && "grid-cols-2")}
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
                    className="h-8 text-xs"
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
                      className="h-8 text-xs"
                    />
                  )}
                </div>
              )}
              <p className="rounded-md surface-inset px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
                Conditions combine with value selections using AND logic.
              </p>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer px-2 text-xs text-muted-foreground"
              onClick={reset}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer px-3 text-xs"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button size="sm" className="h-8 cursor-pointer px-3 text-xs" onClick={apply}>
                <Check className="mr-1 h-3 w-3" />
                Apply filter
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

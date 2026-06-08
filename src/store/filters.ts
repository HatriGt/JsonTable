import { create } from "zustand";

export type SortDir = "asc" | "desc" | null;
export type FilterMode = "include" | "exclude";
export type ConditionOp =
  | "any"
  | "contains"
  | "equals"
  | "notEquals"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "lt"
  | "between";

export type ColumnFilter = {
  mode: FilterMode;
  // null/undefined = all values selected
  selected: string[] | null;
  condition: { op: ConditionOp; a?: string; b?: string };
  sort: SortDir;
};

const DEFAULT: ColumnFilter = {
  mode: "include",
  selected: null,
  condition: { op: "any" },
  sort: null,
};

type Key = string; // `${arrayPath}::${column}`

type State = {
  filters: Record<Key, ColumnFilter>;
  get: (arrayPath: string, column: string) => ColumnFilter;
  set: (arrayPath: string, column: string, value: ColumnFilter) => void;
  clear: (arrayPath: string, column: string) => void;
  clearArray: (arrayPath: string) => void;
  clearAll: () => void;
};

function key(p: string, c: string) {
  return `${p}::${c}`;
}

export const useFilters = create<State>((set, getState) => ({
  filters: {},
  get: (p, c) => getState().filters[key(p, c)] ?? DEFAULT,
  set: (p, c, value) => set((s) => ({ filters: { ...s.filters, [key(p, c)]: value } })),
  clear: (p, c) =>
    set((s) => {
      const next = { ...s.filters };
      delete next[key(p, c)];
      return { filters: next };
    }),
  clearArray: (p) =>
    set((s) => {
      const next: Record<string, ColumnFilter> = {};
      for (const [k, v] of Object.entries(s.filters)) {
        if (!k.startsWith(`${p}::`)) next[k] = v;
      }
      return { filters: next };
    }),
  clearAll: () => set({ filters: {} }),
}));

export function isFilterActive(f: ColumnFilter): boolean {
  if (f.selected && f.selected.length > 0) return true;
  if (f.condition.op !== "any") return true;
  return false;
}

export function defaultFilter(): ColumnFilter {
  return { ...DEFAULT, condition: { op: "any" } };
}

export function valueToText(v: unknown): string {
  if (v === undefined) return "";
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function matchesFilter(v: unknown, f: ColumnFilter): boolean {
  const text = valueToText(v);

  // Distinct-value checkbox filter
  if (f.selected && f.selected.length > 0) {
    const inSet = f.selected.includes(text);
    if (f.mode === "include" && !inSet) return false;
    if (f.mode === "exclude" && inSet) return false;
  }

  // Condition
  const c = f.condition;
  if (c.op !== "any") {
    const a = c.a ?? "";
    const b = c.b ?? "";
    const lower = text.toLowerCase();
    const aL = a.toLowerCase();
    switch (c.op) {
      case "contains":
        if (!lower.includes(aL)) return false;
        break;
      case "equals":
        if (text !== a) return false;
        break;
      case "notEquals":
        if (text === a) return false;
        break;
      case "startsWith":
        if (!lower.startsWith(aL)) return false;
        break;
      case "endsWith":
        if (!lower.endsWith(aL)) return false;
        break;
      case "gt": {
        const nv = Number(v);
        const na = Number(a);
        if (!Number.isFinite(nv) || !Number.isFinite(na) || !(nv > na)) return false;
        break;
      }
      case "lt": {
        const nv = Number(v);
        const na = Number(a);
        if (!Number.isFinite(nv) || !Number.isFinite(na) || !(nv < na)) return false;
        break;
      }
      case "between": {
        const nv = Number(v);
        const na = Number(a);
        const nb = Number(b);
        if (
          !Number.isFinite(nv) ||
          !Number.isFinite(na) ||
          !Number.isFinite(nb) ||
          nv < Math.min(na, nb) ||
          nv > Math.max(na, nb)
        )
          return false;
        break;
      }
    }
  }
  return true;
}

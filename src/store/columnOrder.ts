import { useMemo } from "react";
import { create } from "zustand";

type State = {
  orders: Record<string, string[]>;
  get: (arrayPath: string, defaultCols: string[]) => string[];
  move: (arrayPath: string, from: string, to: string) => void;
  reset: (arrayPath: string) => void;
};

export const useColumnOrder = create<State>((set, get) => ({
  orders: {},
  get: (arrayPath, defaultCols) => {
    const saved = get().orders[arrayPath];
    if (!saved) return defaultCols;
    const known = new Set(defaultCols);
    const filtered = saved.filter((c) => known.has(c));
    const missing = defaultCols.filter((c) => !filtered.includes(c));
    return [...filtered, ...missing];
  },
  move: (arrayPath, from, to) =>
    set((s) => {
      const current = s.orders[arrayPath];
      if (!current || from === to) {
        // fall back: nothing to do unless we know default order
        return s;
      }
      const next = current.slice();
      const fi = next.indexOf(from);
      const ti = next.indexOf(to);
      if (fi < 0 || ti < 0) return s;
      next.splice(fi, 1);
      next.splice(ti, 0, from);
      return { orders: { ...s.orders, [arrayPath]: next } };
    }),
  reset: (arrayPath) =>
    set((s) => {
      const { [arrayPath]: _, ...rest } = s.orders;
      return { orders: rest };
    }),
}));

/** Seed an order for an array path if not present, returning a stable resolved order. */
export function useResolvedOrder(arrayPath: string, defaultCols: string[]) {
  const saved = useColumnOrder((s) => s.orders[arrayPath]);
  return useMemo(() => {
    if (!saved) return defaultCols;
    const known = new Set(defaultCols);
    const filtered = saved.filter((c) => known.has(c));
    const missing = defaultCols.filter((c) => !filtered.includes(c));
    return [...filtered, ...missing];
  }, [saved, defaultCols]);
}

/** Persist a move; seeds default order if needed. */
export function moveColumn(arrayPath: string, defaultCols: string[], from: string, to: string) {
  if (from === to) return;
  useColumnOrder.setState((s) => {
    const base = s.orders[arrayPath] ?? defaultCols;
    const next = base.slice();
    const fi = next.indexOf(from);
    const ti = next.indexOf(to);
    if (fi < 0 || ti < 0) return s;
    next.splice(fi, 1);
    next.splice(ti, 0, from);
    return { orders: { ...s.orders, [arrayPath]: next } };
  });
}

import { create } from "zustand";
import type { PathSegment } from "@/lib/json/path";
import { computeStats, type DocStats } from "@/lib/json/stats";
import { parseJson, type ParseError } from "@/lib/json/parse";
import { saveRecent } from "@/lib/storage/recents";

type Doc = {
  name: string;
  raw: string;
  value: unknown;
  sizeBytes: number;
  stats: DocStats;
  loadedAt: number;
};

export type SelectionSource = "tree" | "grid" | "inspector";

type State = {
  doc: Doc | null;
  error: ParseError | null;
  selection: PathSegment[];
  source: SelectionSource;
  setSelection: (p: PathSegment[], source?: SelectionSource) => void;
  loadJson: (name: string, raw: string) => Promise<boolean>;
  updateAt: (path: PathSegment[], value: unknown) => void;
  reset: () => void;
  clearError: () => void;
};

export const useWorkspace = create<State>((set) => ({
  doc: null,
  error: null,
  selection: [],
  source: "tree",
  setSelection: (p, source = "tree") => set({ selection: p, source }),
  loadJson: async (name, raw) => {
    const result = parseJson(raw);
    if (!result.ok) {
      set({ error: result.error, doc: null });
      return false;
    }
    const stats = computeStats(result.value);
    const sizeBytes = new Blob([raw]).size;
    set({
      error: null,
      doc: {
        name,
        raw,
        value: result.value,
        sizeBytes,
        stats,
        loadedAt: Date.now(),
      },
      selection: [],
      source: "tree",
    });
    saveRecent(name, raw).catch(() => {});
    return true;
  },
  updateAt: (path, value) =>
    set((s) => {
      if (!s.doc) return s;
      const next = setDeep(s.doc.value, path, value);
      const raw = JSON.stringify(next, null, 2);
      const sizeBytes = new Blob([raw]).size;
      return {
        doc: {
          ...s.doc,
          value: next,
          raw,
          sizeBytes,
          stats: computeStats(next),
        },
      };
    }),
  reset: () => set({ doc: null, error: null, selection: [], source: "tree" }),
  clearError: () => set({ error: null }),
}));

function setDeep(root: unknown, path: PathSegment[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const idx = typeof head === "number" ? head : Number(head);
    if (!Number.isFinite(idx)) return root;
    const next = root.slice();
    next[idx] = setDeep(root[idx], rest, value);
    return next;
  }
  if (root && typeof root === "object") {
    const key = String(head);
    const obj = root as Record<string, unknown>;
    return { ...obj, [key]: setDeep(obj[key], rest, value) };
  }
  // primitive parent — replace with appropriate container
  if (typeof head === "number") {
    const arr: unknown[] = [];
    arr[head] = setDeep(undefined, rest, value);
    return arr;
  }
  return { [String(head)]: setDeep(undefined, rest, value) };
}
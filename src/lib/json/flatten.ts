import { valueType } from "./path";

export type GridColumn = {
  key: string;
  path: string[];
  types: Set<string>;
};

export type GridShape = {
  isTabular: boolean;
  columns: GridColumn[];
  rows: unknown[];
  reason?: string;
};

export function buildGrid(value: unknown): GridShape {
  if (!Array.isArray(value)) {
    return {
      isTabular: false,
      columns: [],
      rows: [],
      reason: "Select an array in the tree to view it as a table.",
    };
  }
  if (value.length === 0) {
    return { isTabular: true, columns: [], rows: [], reason: "Empty array." };
  }

  const allPrimitive = value.every((v) => v === null || typeof v !== "object");
  if (allPrimitive) {
    return {
      isTabular: true,
      columns: [{ key: "value", path: [], types: new Set(value.map(valueType)) }],
      rows: value.map((v) => ({ value: v })),
    };
  }

  const colMap = new Map<string, GridColumn>();
  const sample = Math.min(value.length, 500);
  for (let i = 0; i < sample; i++) {
    const row = value[i];
    if (row && typeof row === "object" && !Array.isArray(row)) {
      for (const [k, v] of Object.entries(row as Record<string, unknown>)) {
        const existing = colMap.get(k);
        if (existing) existing.types.add(valueType(v));
        else colMap.set(k, { key: k, path: [k], types: new Set([valueType(v)]) });
      }
    }
  }
  const columns = Array.from(colMap.values());
  return { isTabular: true, columns, rows: value };
}

export function cellDisplay(v: unknown): { text: string; kind: string } {
  if (v === undefined) return { text: "", kind: "undefined" };
  if (v === null) return { text: "null", kind: "null" };
  if (typeof v === "string") return { text: v, kind: "string" };
  if (typeof v === "number") return { text: String(v), kind: "number" };
  if (typeof v === "boolean") return { text: String(v), kind: "boolean" };
  if (Array.isArray(v)) return { text: `Array(${v.length})`, kind: "array" };
  if (typeof v === "object") {
    const keys = Object.keys(v as object);
    return { text: `{${keys.length}}`, kind: "object" };
  }
  return { text: String(v), kind: "unknown" };
}

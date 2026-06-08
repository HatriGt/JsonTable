import type { PathSegment } from "./path";

export type SearchMatch = {
  path: PathSegment[];
  key: string;
  preview: string;
  matchType: "key" | "value";
};

const MAX_RESULTS = 200;

export function searchJson(root: unknown, query: string, max = MAX_RESULTS): SearchMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results: SearchMatch[] = [];

  function walk(value: unknown, path: PathSegment[], key: string) {
    if (results.length >= max) return;

    if (key && key.toLowerCase().includes(q)) {
      results.push({
        path,
        key,
        preview: previewValue(value),
        matchType: "key",
      });
      if (results.length >= max) return;
    }

    if (value !== null && typeof value !== "object") {
      const text = String(value).toLowerCase();
      if (text.includes(q)) {
        results.push({
          path,
          key,
          preview: previewValue(value),
          matchType: "value",
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      for (let i = 0; i < value.length && results.length < max; i++) {
        walk(value[i], [...path, i], String(i));
      }
      return;
    }

    if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        if (results.length >= max) break;
        walk(v, [...path, k], k);
      }
    }
  }

  walk(root, [], "root");
  return results;
}

function previewValue(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") {
    return value.length > 80 ? `"${value.slice(0, 80)}…"` : `"${value}"`;
  }
  if (typeof value === "object") {
    try {
      const s = JSON.stringify(value);
      return s.length > 80 ? s.slice(0, 80) + "…" : s;
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export type PathSegment = string | number;

export function formatPath(path: PathSegment[]): string {
  if (path.length === 0) return "root";
  let out = "root";
  for (const seg of path) {
    if (typeof seg === "number") out += `[${seg}]`;
    else if (/^[a-zA-Z_$][\w$]*$/.test(seg)) out += `.${seg}`;
    else out += `[${JSON.stringify(seg)}]`;
  }
  return out;
}

export function valueType(v: unknown): string {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
}

export function pathEquals(a: PathSegment[], b: PathSegment[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Slash-separated path used by NestedGrid → PathSegment[] */
export function slashPathToSegments(p: string): PathSegment[] {
  if (!p) return [];
  return p.split("/").map((s) => {
    const n = Number(s);
    return Number.isInteger(n) && String(n) === s ? n : s;
  });
}

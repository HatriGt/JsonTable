export type DocStats = {
  nodes: number;
  objects: number;
  arrays: number;
  primitives: number;
  maxDepth: number;
  nulls: number;
};

export function computeStats(root: unknown): DocStats {
  const s: DocStats = {
    nodes: 0,
    objects: 0,
    arrays: 0,
    primitives: 0,
    maxDepth: 0,
    nulls: 0,
  };
  const stack: Array<{ v: unknown; d: number }> = [{ v: root, d: 0 }];
  while (stack.length) {
    const { v, d } = stack.pop()!;
    s.nodes++;
    if (d > s.maxDepth) s.maxDepth = d;
    if (v === null) {
      s.nulls++;
      s.primitives++;
    } else if (Array.isArray(v)) {
      s.arrays++;
      for (let i = 0; i < v.length; i++) stack.push({ v: v[i], d: d + 1 });
    } else if (typeof v === "object") {
      s.objects++;
      for (const k in v as object)
        stack.push({ v: (v as Record<string, unknown>)[k], d: d + 1 });
    } else {
      s.primitives++;
    }
  }
  return s;
}
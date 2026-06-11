import { useDeferredValue, useMemo, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { TreeNode } from "./TreeNode";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function JsonTree() {
  const doc = useWorkspace((s) => s.doc);
  const parsing = useWorkspace((s) => s.parsing);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const matcher = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return null;
    return (key: string, value: unknown) => {
      if (key.toLowerCase().includes(q)) return true;
      if (value !== null && typeof value !== "object") {
        return String(value).toLowerCase().includes(q);
      }
      return false;
    };
  }, [deferredQuery]);

  if (!doc) return null;

  return (
    <div className="relative flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search keys & values"
          className="h-7 border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="flex-1 overflow-auto px-1 py-1 font-mono text-[12px] leading-5">
        <TreeNode name="root" value={doc.value} path={[]} depth={0} matcher={matcher} defaultOpen />
      </div>
      {parsing && <TreeParsingSkeleton />}
    </div>
  );
}

const SKEL_TREE_ITEMS = [
  { indent: 0, w: 45 }, { indent: 1, w: 60 }, { indent: 2, w: 70 },
  { indent: 2, w: 50 }, { indent: 2, w: 80 }, { indent: 1, w: 55 },
  { indent: 2, w: 65 }, { indent: 2, w: 40 }, { indent: 1, w: 72 },
  { indent: 0, w: 48 }, { indent: 1, w: 58 }, { indent: 1, w: 35 },
];

function TreeParsingSkeleton() {
  return (
    <div className="pointer-events-none absolute inset-0 top-[41px] z-10 bg-[var(--source-bg)]/90 px-2 py-2">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className="skel-pulse h-1.5 w-1.5 rounded-full bg-brand" />
        <span className="text-[11px] text-muted-foreground">Updating tree…</span>
      </div>
      <div className="space-y-1">
        {SKEL_TREE_ITEMS.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5" style={{ paddingLeft: item.indent * 16 }}>
            <span className="skel-line h-3 w-3 shrink-0 rounded" style={{ animationDelay: `${i * 50}ms` }} />
            <span className="skel-line h-2.5" style={{ width: `${item.w}%`, animationDelay: `${i * 50 + 25}ms` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

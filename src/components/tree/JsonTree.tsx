import { useMemo, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { TreeNode } from "./TreeNode";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function JsonTree() {
  const { doc } = useWorkspace();
  const [query, setQuery] = useState("");

  const matcher = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return (key: string, value: unknown) => {
      if (key.toLowerCase().includes(q)) return true;
      if (value !== null && typeof value !== "object") {
        return String(value).toLowerCase().includes(q);
      }
      return false;
    };
  }, [query]);

  if (!doc) return null;

  return (
    <div className="flex h-full flex-col">
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
    </div>
  );
}

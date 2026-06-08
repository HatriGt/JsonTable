import { useWorkspace } from "@/store/workspace";
import { ChevronRight } from "lucide-react";

export function Breadcrumb() {
  const { selection, setSelection } = useWorkspace();
  const crumbs = ["root", ...selection.map((s) => String(s))];
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" />}
          <button
            onClick={() => setSelection(selection.slice(0, i), "grid")}
            className="rounded px-1 py-0.5 hover:bg-accent hover:text-foreground"
          >
            {c}
          </button>
        </div>
      ))}
    </div>
  );
}

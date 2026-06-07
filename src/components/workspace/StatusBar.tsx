import { useWorkspace } from "@/store/workspace";
import { formatPath } from "@/lib/json/path";

export function StatusBar() {
  const { doc, error, selection } = useWorkspace();
  return (
    <div className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-border bg-card/60 px-3 font-mono text-[11px] text-muted-foreground backdrop-blur">
      <div className="flex items-center gap-3">
        {error ? (
          <span className="text-destructive">
            ● {error.message} (line {error.line}, col {error.column})
          </span>
        ) : doc ? (
          <span className="text-success">● Valid JSON</span>
        ) : (
          <span>○ No document</span>
        )}
        {doc && (
          <>
            <span>{doc.stats.nodes.toLocaleString()} nodes</span>
            <span>{doc.stats.objects.toLocaleString()} objects</span>
            <span>{doc.stats.arrays.toLocaleString()} arrays</span>
            <span>depth {doc.stats.maxDepth}</span>
          </>
        )}
      </div>
      <div className="truncate">{doc && formatPath(selection)}</div>
    </div>
  );
}
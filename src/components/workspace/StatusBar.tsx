import { AnimatePresence, m } from "@/lib/motion/framer";
import { useWorkspace } from "@/store/workspace";
import { formatPath } from "@/lib/json/path";
import { motionTransition } from "@/lib/motion/presets";

export function StatusBar() {
  const { doc, error, selection } = useWorkspace();
  const pathLabel = doc ? formatPath(selection) : "";

  return (
    <div className="flex h-7 shrink-0 items-center justify-between gap-4 border-t border-border bg-card/60 px-3 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
      <div className="flex items-center gap-3">
        {error ? (
          <span className="text-destructive animate-shake">
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
      <AnimatePresence mode="wait">
        {pathLabel && (
          <m.div
            key={pathLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={motionTransition.fast}
            className="truncate"
          >
            {pathLabel}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

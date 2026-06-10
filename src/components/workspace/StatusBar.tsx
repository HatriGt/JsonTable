import { AnimatePresence, m } from "@/lib/motion/framer";
import { useWorkspace } from "@/store/workspace";
import { formatPath } from "@/lib/json/path";
import { motionTransition } from "@/lib/motion/presets";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBar({ className }: { className?: string }) {
  const { doc, error, parsing, selection } = useWorkspace();
  const pathLabel = doc ? formatPath(selection) : "";

  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center justify-between gap-4 border-t border-border/80 bg-[var(--pane-header)]/90 px-3 font-mono text-[11px] text-muted-foreground shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_3%,transparent)] backdrop-blur-md",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        {parsing ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Parsing…
          </span>
        ) : error ? (
          <Badge variant="destructive" className="h-5 gap-1 px-2 font-mono text-[10px] font-normal">
            {error.message} · L{error.line}:{error.column}
          </Badge>
        ) : doc ? (
          <span className="inline-flex items-center gap-1.5 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Valid JSON
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            No document
          </span>
        )}
        {doc && (
          <>
            <span className="hidden tabular-nums sm:inline">
              {doc.stats.nodes.toLocaleString()} nodes
            </span>
            <span className="hidden tabular-nums md:inline">
              {doc.stats.objects.toLocaleString()} objects
            </span>
            <span className="hidden tabular-nums lg:inline">
              {doc.stats.arrays.toLocaleString()} arrays
            </span>
            <span className="hidden tabular-nums xl:inline">depth {doc.stats.maxDepth}</span>
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
            className="max-w-[50%] truncate text-foreground/80"
          >
            {pathLabel}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

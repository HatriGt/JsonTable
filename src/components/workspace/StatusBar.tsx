import type { ReactNode } from "react";
import { AnimatePresence, m } from "@/lib/motion/framer";
import { Boxes, Braces, Brackets, Layers, MapPin } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { formatPath } from "@/lib/json/path";
import { motionTransition } from "@/lib/motion/presets";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Stat({
  icon,
  value,
  label,
  className,
}: {
  icon: ReactNode;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("items-center gap-1.5 tabular-nums", className)} title={label}>
      <span className="text-muted-foreground/70">{icon}</span>
      {value.toLocaleString()}
      <span className="text-muted-foreground/60">{label}</span>
    </span>
  );
}

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
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
        {parsing ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-muted-foreground">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand" />
            Parsing…
          </span>
        ) : error ? (
          <Badge variant="destructive" className="h-5 gap-1 px-2 font-mono text-[10px] font-normal">
            {error.message} · L{error.line}:{error.column}
          </Badge>
        ) : doc ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Valid JSON
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
            No document
          </span>
        )}
        {doc && (
          <>
            <span className="hidden h-3.5 w-px bg-border/70 sm:inline-block" aria-hidden="true" />
            <Stat
              className="hidden sm:inline-flex"
              icon={<Boxes className="h-3 w-3" />}
              value={doc.stats.nodes}
              label="nodes"
            />
            <Stat
              className="hidden md:inline-flex"
              icon={<Braces className="h-3 w-3" />}
              value={doc.stats.objects}
              label="objects"
            />
            <Stat
              className="hidden lg:inline-flex"
              icon={<Brackets className="h-3 w-3" />}
              value={doc.stats.arrays}
              label="arrays"
            />
            <Stat
              className="hidden xl:inline-flex"
              icon={<Layers className="h-3 w-3" />}
              value={doc.stats.maxDepth}
              label="deep"
            />
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
            className="flex min-w-0 items-center gap-1.5 text-foreground/80"
          >
            <MapPin className="h-3 w-3 shrink-0 text-muted-foreground/70" />
            <span className="max-w-[40vw] truncate">{pathLabel}</span>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

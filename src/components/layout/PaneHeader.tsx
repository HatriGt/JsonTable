import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function PaneHeader({ title, meta, actions, className }: Props) {
  return (
    <div
      className={cn(
        "flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-3 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="font-bold text-foreground">{title}</span>
        {meta && (
          <>
            <span className="text-muted-foreground/70">·</span>
            <span className="inline-flex items-center gap-1 truncate">{meta}</span>
          </>
        )}
      </div>
      {actions && <div className="flex items-center gap-0.5">{actions}</div>}
    </div>
  );
}

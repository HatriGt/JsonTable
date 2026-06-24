import type { ReactNode } from "react";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

type Props = {
  title: string;
  icon?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  onHide?: () => void;
  hideSide?: "left" | "right";
  className?: string;
};

export function PaneHeader({
  title,
  icon,
  meta,
  actions,
  onHide,
  hideSide = "left",
  className,
}: Props) {
  const HideIcon = hideSide === "left" ? PanelLeftClose : PanelRightClose;

  return (
    <div
      className={cn(
        "flex h-11 shrink-0 items-center justify-between border-b border-border/80 bg-[var(--pane-header)]/95 px-3 backdrop-blur-sm",
        "shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_4%,transparent)]",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-brand/20 bg-gradient-to-br from-brand/15 to-brand/5 text-brand shadow-[inset_0_1px_0_color-mix(in_oklab,white_18%,transparent)]">
            {icon}
          </span>
        )}
        <div className="min-w-0 leading-tight">
          <span className="text-[13px] font-semibold tracking-tight text-foreground">{title}</span>
          {meta && (
            <span className="mt-0.5 hidden truncate text-[10.5px] text-muted-foreground/80 sm:block">
              {meta}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-background/50 p-0.5 backdrop-blur-sm">
        {actions}
        {onHide && (
          <IconButton
            title={`Hide ${title.toLowerCase()} pane`}
            aria-label={`Hide ${title.toLowerCase()} pane`}
            onClick={onHide}
            className="h-7 w-7 rounded-md"
          >
            <HideIcon className="h-3.5 w-3.5" />
          </IconButton>
        )}
      </div>
    </div>
  );
}

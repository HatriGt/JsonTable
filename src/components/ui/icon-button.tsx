import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  onClick?: () => void;
  title: string;
  disabled?: boolean;
  active?: boolean;
  className?: string;
};

export function IconButton({ children, onClick, title, disabled, active, className }: Props) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform,box-shadow] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] hover:bg-accent hover:text-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100",
        active && "bg-accent text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

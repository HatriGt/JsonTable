import { m, useReducedMotion } from "@/lib/motion/framer";
import { useState, type ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { staggerContainer, staggerItem, viewportOnce } from "@/lib/motion/presets";
import { isRouteTransitioning } from "@/lib/motion/view-transition";
import { cn } from "@/lib/utils";

/**
 * Orchestrated entrance: children wrapped in <StaggerItem> reveal in sequence.
 * Shares FadeIn's guards — no animation under reduced-motion, before hydration,
 * or while a route View Transition owns the entrance (prevents the blink).
 */
export function Stagger({
  children,
  className,
  inView = false,
}: {
  children: ReactNode;
  className?: string;
  inView?: boolean;
}) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();
  const [routeOwned] = useState(() => isRouteTransitioning());

  if (reduced || !mounted || routeOwned) {
    return <div className={className}>{children}</div>;
  }

  const mode = inView
    ? { initial: "hidden" as const, whileInView: "visible" as const, viewport: viewportOnce }
    : { initial: "hidden" as const, animate: "visible" as const };

  return (
    <m.div variants={staggerContainer} className={cn(className)} {...mode}>
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();
  const [routeOwned] = useState(() => isRouteTransitioning());

  if (reduced || !mounted || routeOwned) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div variants={staggerItem} className={cn(className)}>
      {children}
    </m.div>
  );
}

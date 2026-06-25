import { m, useReducedMotion } from "@/lib/motion/framer";
import { useState, type ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { fadeUp, motionTransition, viewportOnce } from "@/lib/motion/presets";
import { isRouteTransitioning } from "@/lib/motion/view-transition";
import { cn } from "@/lib/utils";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  inView?: boolean;
};

export function FadeIn({ children, className, delay = 0, inView = false }: Props) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();
  // If this element mounted during a route View Transition, the transition is
  // the entrance — render it visible so the snapshot isn't blank and it doesn't
  // re-fade afterwards. Frozen at first render.
  const [routeOwned] = useState(() => isRouteTransitioning());

  if (reduced || !mounted || routeOwned) {
    return <div className={className}>{children}</div>;
  }

  const motionProps = inView
    ? {
        initial: "hidden" as const,
        whileInView: "visible" as const,
        viewport: viewportOnce,
      }
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
      };

  return (
    <m.div
      variants={fadeUp}
      transition={{ ...motionTransition.normal, delay }}
      className={cn(className)}
      {...motionProps}
    >
      {children}
    </m.div>
  );
}

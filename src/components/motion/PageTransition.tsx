import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, m, useReducedMotion } from "@/lib/motion/framer";
import type { ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { motionTransition } from "@/lib/motion/presets";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();

  if (reduced || !mounted) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={pathname}
        initial={false}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={motionTransition.normal}
      >
        {children}
      </m.div>
    </AnimatePresence>
  );
}

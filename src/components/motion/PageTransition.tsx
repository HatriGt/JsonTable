import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, m, useReducedMotion } from "@/lib/motion/framer";
import { useEffect, useState, type ReactNode } from "react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { routeDirection } from "@/hooks/use-route-direction";
import { motionTransition, pageFade } from "@/lib/motion/presets";
import {
  prefersReducedMotion,
  runRouteViewTransition,
  supportsViewTransitions,
} from "@/lib/motion/view-transition";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const reducedMotion = useReducedMotion();
  const mounted = useMountAnimation();
  const [committedPath, setCommittedPath] = useState(pathname);
  const [committedChildren, setCommittedChildren] = useState(children);

  const useViewTransition =
    mounted && !reducedMotion && !prefersReducedMotion() && supportsViewTransitions();

  useEffect(() => {
    if (pathname === committedPath) {
      if (children !== committedChildren) {
        setCommittedChildren(children);
      }
      return;
    }

    const direction = routeDirection(committedPath, pathname);
    const apply = () => {
      setCommittedPath(pathname);
      setCommittedChildren(children);
    };

    if (useViewTransition) {
      runRouteViewTransition(direction, apply);
      return;
    }

    apply();
  }, [pathname, children, committedPath, committedChildren, useViewTransition]);

  if (!mounted || reducedMotion) {
    return <div className="route-page-shell min-h-dvh w-full">{children}</div>;
  }

  if (useViewTransition) {
    return <div className="route-page-shell min-h-dvh w-full">{committedChildren}</div>;
  }

  return (
    <div className="min-h-dvh w-full">
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={committedPath}
          className="route-page-shell min-h-dvh w-full"
          variants={pageFade}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={motionTransition.page}
        >
          {committedChildren}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

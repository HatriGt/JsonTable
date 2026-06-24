import type { Transition, Variants } from "framer-motion";

const EASE_OUT: Transition["ease"] = [0.16, 1, 0.3, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/** Route depth for directional enter/exit (landing = 0, workspace = 1). */
export function routeDepth(pathname: string): number {
  if (pathname === "/workspace") return 1;
  return 0;
}

/** Fade + slide fallback when the View Transitions API is unavailable. */
export const pageFade: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const pageTransition: Transition = {
  duration: 0.28,
  ease: EASE_OUT,
};

export const motionTransition = {
  fast: { duration: 0.12, ease: EASE_OUT },
  normal: { duration: 0.22, ease: EASE_OUT },
  slow: { duration: 0.36, ease: EASE_OUT },
  page: pageTransition,
} as const;

export const viewportOnce = {
  once: true,
  margin: "-80px" as const,
};

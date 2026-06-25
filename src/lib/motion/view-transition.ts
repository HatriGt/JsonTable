import { flushSync } from "react-dom";
import type { RouteDirection } from "@/hooks/use-route-direction";

// True while a route View Transition is committing the new page. Entrance
// animations read this so they render their content already-visible (the View
// Transition is the entrance), instead of fading in and fighting the snapshot.
let routeTransitioning = false;

export function isRouteTransitioning(): boolean {
  return routeTransitioning;
}

export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function runRouteViewTransition(direction: RouteDirection, updateDom: () => void): void {
  if (!supportsViewTransitions() || prefersReducedMotion()) {
    updateDom();
    return;
  }

  const root = document.documentElement;
  root.dataset.routeDir = direction;
  root.classList.add("route-transition-active");

  routeTransitioning = true;
  const transition = document.startViewTransition(() => {
    flushSync(updateDom);
  });

  void transition.finished.finally(() => {
    routeTransitioning = false;
    root.classList.remove("route-transition-active");
    delete root.dataset.routeDir;
  });
}

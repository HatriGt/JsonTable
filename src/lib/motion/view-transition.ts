import { flushSync } from "react-dom";
import type { RouteDirection } from "@/hooks/use-route-direction";

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

  const transition = document.startViewTransition(() => {
    flushSync(updateDom);
  });

  void transition.finished.finally(() => {
    root.classList.remove("route-transition-active");
    delete root.dataset.routeDir;
  });
}

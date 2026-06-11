import { routeDepth } from "@/lib/motion/presets";

export type RouteDirection = "forward" | "back";

export function routeDirection(from: string, to: string): RouteDirection {
  return routeDepth(to) >= routeDepth(from) ? "forward" : "back";
}

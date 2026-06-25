import { useEffect, useState } from "react";

// Once the app has hydrated, later mounts (client navigations) should start in
// their animated state immediately rather than rendering a visible plain node
// first and then flipping to hidden — that flip is what makes route transitions
// blink. Tracked module-wide so it survives component unmount/remount.
let appHydrated = false;

/** Avoid SSR/hydration leaving Framer Motion elements at opacity: 0. */
export function useMountAnimation(): boolean {
  const [mounted, setMounted] = useState(appHydrated);
  useEffect(() => {
    appHydrated = true;
    if (!mounted) setMounted(true);
  }, [mounted]);
  return mounted;
}

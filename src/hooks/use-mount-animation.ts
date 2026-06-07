import { useEffect, useState } from "react";

/** Avoid SSR/hydration leaving Framer Motion elements at opacity: 0. */
export function useMountAnimation(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

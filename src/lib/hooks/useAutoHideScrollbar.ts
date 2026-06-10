import { useCallback, useEffect, useRef } from "react";

const HIDE_DELAY_MS = 700;

function attachAutoHideScrollbar(el: HTMLElement): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const onScroll = () => {
    el.classList.add("is-scrolling");
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove("is-scrolling"), HIDE_DELAY_MS);
  };

  el.addEventListener("scroll", onScroll, { passive: true });
  return () => {
    el.removeEventListener("scroll", onScroll);
    if (timer) clearTimeout(timer);
    el.classList.remove("is-scrolling");
  };
}

/**
 * Reveals a scroll container's scrollbar only while the user is actively
 * scrolling by toggling the `is-scrolling` class (see `.scroll-autohide` in
 * styles.css). Returns a callback ref so listeners attach as soon as the
 * element mounts.
 */
export function useAutoHideScrollbar<T extends HTMLElement>() {
  const cleanupRef = useRef<(() => void) | null>(null);

  const ref = useCallback((el: T | null) => {
    cleanupRef.current?.();
    cleanupRef.current = null;
    if (el) cleanupRef.current = attachAutoHideScrollbar(el);
  }, []);

  useEffect(() => () => cleanupRef.current?.(), []);

  return ref;
}

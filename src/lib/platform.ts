import { useEffect, useState } from "react";

/** True on Apple platforms, where the primary modifier is ⌘ rather than Ctrl. */
function isMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const p =
    navigator.platform ||
    (navigator as { userAgentData?: { platform?: string } }).userAgentData?.platform ||
    navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(p);
}

/**
 * The platform's primary-modifier label, resolved after mount.
 *
 * Server and the first client render both return "Ctrl" so hydration matches;
 * the effect then upgrades to "⌘" on Apple devices. Use for any shortcut hint
 * (tooltips, kbd badges) so Windows/Linux users don't see macOS-only keys.
 */
export function useModKey(): string {
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    if (isMac()) setMod("⌘");
  }, []);
  return mod;
}

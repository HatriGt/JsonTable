import { useId } from "react";

/** The JSON-Table brand mark: a white spreadsheet glyph (header row + grid) on
 *  a rounded, brand-gradient tile. Reads cleanly from 16px favicons up. Size
 *  via className. */
export function BrandLogo({ className }: { className?: string }) {
  const id = useId();
  const grad = `${id}-grad`;
  const mask = `${id}-mask`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="JSON-Table logo"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={grad} x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5b86ff" />
          <stop offset="1" stopColor="#2551e0" />
        </linearGradient>
        <mask id={mask}>
          <rect x="16" y="17" width="32" height="30" rx="4.5" fill="#fff" />
          <rect x="16" y="25.5" width="32" height="2.4" fill="#000" />
          <rect x="30.8" y="27.9" width="2.4" height="19.1" fill="#000" />
          <rect x="16" y="36.5" width="32" height="2.4" fill="#000" />
        </mask>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${grad})`} />
      <rect x="16" y="17" width="32" height="30" rx="4.5" fill="#ffffff" mask={`url(#${mask})`} />
    </svg>
  );
}

/** Wordmark: "JSON" in brand, "‑Table" in the current text color. */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="text-brand">JSON</span>
      <span>‑Table</span>
    </span>
  );
}

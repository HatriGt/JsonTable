import { useId } from "react";

/** The JSON-Table brand mark: white braces framing three JSON-token-colored
 *  dots (string/number/other) on a rounded brand-gradient tile. Reads cleanly
 *  from 16px favicons up. Size via className. */
export function BrandLogo({ className }: { className?: string }) {
  const id = useId();
  const grad = `${id}-grad`;
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
          <stop stopColor="#3f6fff" />
          <stop offset="1" stopColor="#1b3fb8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="16" fill={`url(#${grad})`} />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M24 18c-4 0-5.6 1.8-5.6 5.6v3.4c0 2.9-1.3 4.4-3.4 4.4 2.1 0 3.4 1.5 3.4 4.4v3.4c0 3.8 1.6 5.6 5.6 5.6" />
        <path d="M40 18c4 0 5.6 1.8 5.6 5.6v3.4c0 2.9 1.3 4.4 3.4 4.4-2.1 0-3.4 1.5-3.4 4.4v3.4c0 3.8-1.6 5.6-5.6 5.6" />
      </g>
      <circle cx="26.5" cy="32" r="2.6" fill="#7cf3c2" />
      <circle cx="32" cy="32" r="2.6" fill="#ffd36b" />
      <circle cx="37.5" cy="32" r="2.6" fill="#ff9db1" />
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

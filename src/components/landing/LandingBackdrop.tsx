/**
 * Full-page illustration behind the landing content. Fixed to the viewport so it
 * stays put while the page scrolls. The image is set in CSS (`.landing-backdrop`)
 * with a theme-aware override — a sunny park in light mode, the same scene at
 * night in dark mode — so only the matching image is fetched and the
 * pre-hydration theme class picks the right one before first paint. A blurred
 * LQIP paints instantly beneath it, and a theme-aware scrim keeps the glass
 * panels and text legible.
 */
export function LandingBackdrop() {
  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0" aria-hidden="true">
      <div className="landing-scrim absolute inset-0" />
    </div>
  );
}

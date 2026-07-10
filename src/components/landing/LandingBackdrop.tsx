const AVIF_SRCSET =
  "/hero/park-640.avif 640w, /hero/park-1024.avif 1024w, /hero/park-1600.avif 1600w, /hero/park-2560.avif 2560w";
const WEBP_SRCSET =
  "/hero/park-640.webp 640w, /hero/park-1024.webp 1024w, /hero/park-1600.webp 1600w, /hero/park-2560.webp 2560w";

/**
 * Full-page illustration behind the landing content. Fixed to the viewport so it
 * stays put while the page scrolls; a low-quality blurred placeholder (CSS
 * background) paints instantly, the real responsive image fades in on top, and a
 * theme-aware scrim keeps the glass panels and text legible over it.
 */
export function LandingBackdrop() {
  return (
    <div className="landing-backdrop pointer-events-none fixed inset-0" aria-hidden="true">
      <picture>
        <source type="image/avif" srcSet={AVIF_SRCSET} sizes="100vw" />
        <source type="image/webp" srcSet={WEBP_SRCSET} sizes="100vw" />
        <img
          src="/hero/park-1600.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </picture>
      <div className="landing-scrim absolute inset-0" />
    </div>
  );
}

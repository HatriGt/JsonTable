import { useEffect, useRef } from "react";

type RGB = [number, number, number];
type Dot = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  phase: number;
  tw: number;
  ci: number;
};

// Dots within this many px of each other get linked; the line fades out as they
// approach the limit, so the network feels alive rather than a static mesh.
const LINK_DIST = 140;

// The app's JSON syntax palette — keys, strings, numbers, booleans, null. Using
// these ties the background network to the product's signature look.
const PALETTE_VARS = [
  "--json-key",
  "--json-string",
  "--json-number",
  "--json-bool",
  "--brand",
] as const;

/**
 * Subtle "constellation" network painted behind the landing content: drifting
 * dots connected by lines that fade with distance. Dots are colored with the
 * app's JSON token palette and each link blends its two endpoints' colors, so
 * the field reads as the same color-coded JSON the product renders. Canvas-based
 * (one layer, rAF), viewport-fixed, honors prefers-reduced-motion and pauses
 * while the tab is hidden.
 */
export function LandingDots() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const c = ctx;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Resolve the JSON palette to rgb tuples (re-read when the theme flips).
    // One probe per var so all style writes happen up front and all the
    // getComputedStyle reads happen after — no interleaved write/read thrash.
    let palette: RGB[] = [[37, 99, 235]];
    function readPalette() {
      const probes = PALETTE_VARS.map((v) => {
        const el = document.createElement("span");
        el.style.cssText = `display:none;color:var(${v})`;
        document.body.appendChild(el);
        return el;
      });
      const next: RGB[] = [];
      for (const el of probes) {
        const m = getComputedStyle(el).color.match(/\d+(\.\d+)?/g);
        if (m && m.length >= 3) next.push([+m[0], +m[1], +m[2]]);
      }
      probes.forEach((el) => el.remove());
      if (next.length) palette = next;
    }
    readPalette();

    let w = 0;
    let h = 0;
    let dots: Dot[] = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      c.canvas.width = Math.round(w * dpr);
      c.canvas.height = Math.round(h * dpr);
      c.canvas.style.width = `${w}px`;
      c.canvas.style.height = `${h}px`;
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(150, Math.max(40, Math.round((w * h) / 13000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.3 + 0.8,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        a: Math.random() * 0.35 + 0.25,
        phase: Math.random() * Math.PI * 2,
        tw: Math.random() * 0.6 + 0.4,
        ci: Math.floor(Math.random() * PALETTE_VARS.length),
      }));
    }

    let t = 0;

    function paint() {
      c.clearRect(0, 0, w, h);

      // Links first, so the dots sit on top of the lines. Each line is the
      // blend of its two endpoints' JSON colors.
      c.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        const ca = palette[a.ci % palette.length];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const cb = palette[b.ci % palette.length];
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.28;
          const r = (ca[0] + cb[0]) >> 1;
          const g = (ca[1] + cb[1]) >> 1;
          const bl = (ca[2] + cb[2]) >> 1;
          c.strokeStyle = `rgba(${r}, ${g}, ${bl}, ${alpha})`;
          c.beginPath();
          c.moveTo(a.x, a.y);
          c.lineTo(b.x, b.y);
          c.stroke();
        }
      }

      for (const d of dots) {
        const col = palette[d.ci % palette.length];
        // Gentle twinkle: ease the alpha up and down so dots feel alive.
        const alpha = d.a * (0.62 + 0.38 * Math.sin(d.phase + t * d.tw));
        c.beginPath();
        c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        c.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${alpha})`;
        c.fill();
      }
    }

    let raf = 0;
    function frame() {
      t += 0.016;
      for (const d of dots) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -6) d.x = w + 6;
        else if (d.x > w + 6) d.x = -6;
        if (d.y < -6) d.y = h + 6;
        else if (d.y > h + 6) d.y = -6;
      }
      paint();
      raf = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduced) paint();
      else raf = requestAnimationFrame(frame);
    }

    resize();
    start();

    function onResize() {
      resize();
      start();
    }
    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    }
    const themeObserver = new MutationObserver(() => {
      readPalette();
      if (reduced) paint();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      themeObserver.disconnect();
    };
  }, []);

  // aria-hidden sits on a display:contents wrapper (which adds no box) rather
  // than directly on the canvas, so the decorative subtree stays out of the
  // accessibility tree without flagging aria-hidden on the canvas element.
  return (
    <div aria-hidden="true" style={{ display: "contents" }}>
      <canvas ref={ref} className="landing-dots pointer-events-none fixed inset-0" />
    </div>
  );
}

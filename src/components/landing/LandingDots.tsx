import { useEffect, useRef } from "react";

type Dot = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  a: number;
  phase: number;
  tw: number;
};

// Dots within this many px of each other get linked; the line fades out as they
// approach the limit, so the network feels alive rather than a static mesh.
const LINK_DIST = 140;

/**
 * Subtle "constellation" network painted behind the landing content: drifting
 * dots connected by lines that fade with distance. Canvas-based so it stays
 * cheap (one layer, rAF), viewport-fixed so the canvas never grows with the
 * page. Honors prefers-reduced-motion (renders a single static frame) and
 * pauses while the tab is hidden.
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

    // Read the brand color as rgb so the canvas fill matches the theme (and
    // re-read it when the light/dark class flips).
    let base = "37, 99, 235";
    function readBrand() {
      const probe = document.createElement("span");
      probe.style.color = "var(--brand)";
      probe.style.display = "none";
      document.body.appendChild(probe);
      const m = getComputedStyle(probe).color.match(/\d+/g);
      probe.remove();
      if (m && m.length >= 3) base = `${m[0]}, ${m[1]}, ${m[2]}`;
    }
    readBrand();

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
      }));
    }

    let t = 0;

    function paint() {
      c.clearRect(0, 0, w, h);

      // Links first, so the dots sit on top of the lines.
      c.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_DIST * LINK_DIST) continue;
          const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.3;
          c.strokeStyle = `rgba(${base}, ${alpha})`;
          c.beginPath();
          c.moveTo(a.x, a.y);
          c.lineTo(b.x, b.y);
          c.stroke();
        }
      }

      for (const d of dots) {
        // Gentle twinkle: ease the alpha up and down so dots feel alive.
        const alpha = d.a * (0.62 + 0.38 * Math.sin(d.phase + t * d.tw));
        c.beginPath();
        c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        c.fillStyle = `rgba(${base}, ${alpha})`;
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
      readBrand();
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

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="landing-dots pointer-events-none fixed inset-0"
    />
  );
}

import { useEffect, useRef } from "react";

type Dot = { x: number; y: number; r: number; vx: number; vy: number; a: number };

/**
 * Subtle drifting dot field painted behind the landing content. Canvas-based so
 * it stays cheap (one layer, rAF), viewport-fixed so the canvas never grows with
 * the page. Honors prefers-reduced-motion (renders a single static frame) and
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
      const count = Math.min(90, Math.max(24, Math.round((w * h) / 20000)));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.9 + 0.8,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        a: Math.random() * 0.4 + 0.18,
      }));
    }

    function paint() {
      c.clearRect(0, 0, w, h);
      for (const d of dots) {
        c.beginPath();
        c.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        c.fillStyle = `rgba(${base}, ${d.a})`;
        c.fill();
      }
    }

    let raf = 0;
    function frame() {
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

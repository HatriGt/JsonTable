import { useEffect, useState, type ReactNode } from "react";
import { PreviewMock } from "./PreviewMock";
import { FadeIn } from "@/components/motion/FadeIn";
import { m, useMotionValue, useReducedMotion, useSpring, useTransform } from "@/lib/motion/framer";

const tiltSpring = { stiffness: 150, damping: 18, mass: 0.4 };

/** Subtle cursor-tracking 3D tilt. Off on touch / reduced-motion. */
function PreviewTilt({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  // Enable only after mount so SSR and the first client render match (avoids a
  // hydration mismatch from branching on `window` during render).
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches);
  }, []);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [4, -4]), tiltSpring);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-5, 5]), tiltSpring);

  if (reduced || !enabled) return <>{children}</>;

  return (
    <m.div
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        px.set((e.clientX - r.left) / r.width - 0.5);
        py.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        px.set(0);
        py.set(0);
      }}
      style={{ rotateX, rotateY, transformPerspective: 1400 }}
      className="will-change-transform [transform-style:preserve-3d]"
    >
      {children}
    </m.div>
  );
}

/**
 * The product demo, shown on its own below the hero (pitch first, proof second)
 * rather than side-by-side. The real workspace preview sits centered on a glass
 * frame so it reads as an object placed into the scene.
 */
export function LandingDemo() {
  return (
    <section aria-labelledby="demo-heading" className="relative px-4 pb-8 pt-2 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <FadeIn inView className="mb-6 text-center sm:mb-8">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-brand [text-shadow:0_1px_10px_rgb(255_255_255/0.7)] dark:[text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">
            the workspace
          </span>
          <h2
            id="demo-heading"
            className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground [text-shadow:0_1px_16px_rgb(255_255_255/0.7)] sm:text-3xl dark:[text-shadow:0_1px_20px_rgb(0_0_0/0.6)]"
          >
            Tree on the left, grid on the right
          </h2>
        </FadeIn>

        <FadeIn inView className="relative">
          <div
            className="demo-glow pointer-events-none absolute inset-x-6 -inset-y-6"
            aria-hidden="true"
          />
          <PreviewTilt>
            <div className="glass-panel relative overflow-hidden rounded-2xl p-1.5 sm:p-2">
              <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-landing-demo">
                <PreviewMock />
              </div>
            </div>
          </PreviewTilt>
        </FadeIn>
      </div>
    </section>
  );
}

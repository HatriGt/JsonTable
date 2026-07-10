import { PreviewMock } from "./PreviewMock";
import { FadeIn } from "@/components/motion/FadeIn";

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
          <div className="glass-panel relative overflow-hidden rounded-2xl p-1.5 sm:p-2">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-landing-demo">
              <PreviewMock />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

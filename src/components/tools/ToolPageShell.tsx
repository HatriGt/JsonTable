import type { ReactNode } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FadeIn } from "@/components/motion/FadeIn";

export type Faq = { q: string; a: string };

/** Shared chrome for the functional tool pages (formatter, viewer): landing
 *  nav + a centered hero, the tool itself, an optional visible FAQ (kept for
 *  SEO), and the footer. */
export function ToolPageShell({
  eyebrow,
  title,
  intro,
  faqs,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  faqs?: readonly Faq[];
  children: ReactNode;
}) {
  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />

      <main id="main-content" className="relative flex-1">
        <section className="relative overflow-hidden">
          <div
            className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[360px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-5 pb-4 pt-10 text-center sm:px-6 lg:pt-14">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              {intro}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 pb-12 sm:px-6">{children}</div>

        {faqs && faqs.length > 0 && (
          <section aria-labelledby="faq-heading" className="border-t border-border/60 bg-card/30">
            <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6">
              <FadeIn inView>
                <h2
                  id="faq-heading"
                  className="text-balance text-2xl font-semibold tracking-tight text-foreground"
                >
                  Frequently asked questions
                </h2>
              </FadeIn>
              <dl className="mt-6 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70">
                {faqs.map((item) => (
                  <details key={item.q} className="group bg-card">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-foreground transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--grid-row-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 sm:px-6">
                      <dt>{item.q}</dt>
                      <span
                        aria-hidden="true"
                        className="text-muted-foreground transition-transform duration-[var(--motion-duration-fast)] group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <dd className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                      {item.a}
                    </dd>
                  </details>
                ))}
              </dl>
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

import type { ReactNode } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { OpenWorkspaceButtons } from "./OpenWorkspaceButtons";
import { FadeIn } from "@/components/motion/FadeIn";

export type Faq = { q: string; a: string };

export type SeoLandingContent = {
  eyebrow: string;
  h1: ReactNode;
  intro: string;
  steps: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  faqs: readonly Faq[];
  related: { href: string; label: string; desc: string }[];
  closing: string;
};

export function SeoLanding({ content }: { content: SeoLandingContent }) {
  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />

      <main id="main-content" className="relative flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[420px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-5 pb-6 pt-14 text-center sm:px-6 lg:pt-20">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              {content.eyebrow}
            </p>
            <h1 className="mt-5 text-balance text-[2.25rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-5xl">
              {content.h1}
            </h1>
            <p className="mx-auto mt-5 max-w-[40rem] text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {content.intro}
            </p>
            <OpenWorkspaceButtons className="mt-8 flex justify-center" />
            <p className="mt-4 text-[11px] text-muted-foreground/80">
              Runs in your browser. No uploads, no accounts, free.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
            <FadeIn inView>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                How it works
              </h2>
            </FadeIn>
            <ol className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 sm:mt-10 sm:grid-cols-3">
              {content.steps.map((step, i) => (
                <li key={step.title} className="bg-card p-6 sm:p-8">
                  <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
            <div className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {content.benefits.map((b) => (
                <FadeIn inView key={b.title}>
                  <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading" className="border-t border-border/60 bg-card/30">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
            <FadeIn inView>
              <h2
                id="faq-heading"
                className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Frequently asked questions
              </h2>
            </FadeIn>
            <dl className="mt-8 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 sm:mt-10">
              {content.faqs.map((item) => (
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

        {/* Closing CTA + related tools */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-6 sm:py-20">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {content.closing}
            </h2>
            <OpenWorkspaceButtons className="mt-7 flex justify-center" />

            {content.related.length > 0 && (
              <nav aria-label="Related tools" className="mt-12 text-left">
                <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  More JSON tools
                </p>
                <ul className="grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 sm:grid-cols-3">
                  {content.related.map((link) => (
                    <li key={link.href} className="bg-card">
                      <a
                        href={link.href}
                        className="block h-full p-5 transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--grid-row-hover)]"
                      >
                        <span className="text-sm font-medium text-brand">{link.label}</span>
                        <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                          {link.desc}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}

import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";

export type RelatedLink = { href: string; label: string; desc: string };
export type Crumb = { label: string; href: string };

/** Shared chrome for guide/article pages: landing nav, a breadcrumb trail, an
 *  article header, the prose body (styled via `.article-prose`), a related-tools
 *  nav, and the footer. Keeps the content cluster consistent and crawlable. */
export function ArticleShell({
  breadcrumbs,
  eyebrow,
  title,
  intro,
  updated,
  readingTime,
  children,
  related,
}: {
  breadcrumbs: readonly Crumb[];
  eyebrow: string;
  title: ReactNode;
  intro: string;
  updated?: string;
  readingTime?: string;
  children: ReactNode;
  related?: readonly RelatedLink[];
}) {
  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />

      <main id="main-content" className="relative flex-1">
        <article className="mx-auto max-w-3xl px-5 pb-12 pt-10 sm:px-6 lg:pt-14">
          <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link to="/" className="transition-colors hover:text-foreground">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-1.5">
                  <span aria-hidden="true">/</span>
                  {i === breadcrumbs.length - 1 ? (
                    <span className="text-foreground">{c.label}</span>
                  ) : (
                    <Link to={c.href} className="transition-colors hover:text-foreground">
                      {c.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <header className="mt-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-[2.5rem]">
              {title}
            </h1>
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
              {intro}
            </p>
            {(updated || readingTime) && (
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/80">
                {updated && <span>Updated {updated}</span>}
                {updated && readingTime && <span aria-hidden="true">·</span>}
                {readingTime && <span>{readingTime}</span>}
              </p>
            )}
          </header>

          <div className="article-prose mt-8">{children}</div>
        </article>

        {related && related.length > 0 && (
          <section className="border-t border-border/60 bg-card/30">
            <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6">
              <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Try the tools
              </p>
              <ul className="grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 sm:grid-cols-3">
                {related.map((link) => (
                  <li key={link.href} className="bg-card">
                    <Link
                      to={link.href}
                      className="block h-full p-5 transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--grid-row-hover)]"
                    >
                      <span className="text-sm font-medium text-brand">{link.label}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        {link.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}

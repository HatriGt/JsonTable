import { createFileRoute, Link } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { GUIDES, guidePath } from "@/lib/content/guides";
import { getSiteUrl } from "@/lib/site";

const TITLE = "JSON Guides — Format, Compare, View & Understand JSON | JSON‑Table";
const DESCRIPTION =
  "Practical guides for working with JSON: how to format and minify it, compare two files, view it as a table, and understand JSON syntax. Free, no sign-up.";

export const Route = createFileRoute("/guides/")({
  head: () => {
    const site = getSiteUrl();
    const url = `${site}/guides`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: url },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${site}/` },
              { "@type": "ListItem", position: 2, name: "Guides", item: url },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "JSON Guides",
            itemListElement: GUIDES.map((g, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: g.title,
              url: `${site}${guidePath(g.slug)}`,
            })),
          }),
        },
      ],
    };
  },
  component: GuidesHub,
});

function GuidesHub() {
  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />

      <main id="main-content" className="relative flex-1">
        <section className="relative overflow-hidden">
          <div
            className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[320px]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-3xl px-5 pb-4 pt-12 text-center sm:px-6 lg:pt-16">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Guides
            </p>
            <h1 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl">
              JSON guides &amp; how‑tos
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Short, practical guides for everyday JSON tasks — formatting, comparing, converting to
              tables, and understanding the syntax. Each one links straight to a free tool that does
              the job in your browser.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6">
          <ul className="grid gap-4 sm:grid-cols-2">
            {GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  to={guidePath(g.slug)}
                  className="group flex h-full flex-col rounded-xl border border-border/70 bg-card p-6 transition-colors duration-[var(--motion-duration-fast)] hover:border-brand/40 hover:bg-[var(--grid-row-hover)]"
                >
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-brand">
                    {g.kicker}
                  </span>
                  <h2 className="mt-2.5 text-lg font-semibold tracking-tight text-foreground">
                    {g.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {g.summary}
                  </p>
                  <span className="mt-4 text-sm font-medium text-brand">
                    Read guide{" "}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

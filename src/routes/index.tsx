import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";
import { FAQ_ITEMS } from "@/components/landing/LandingFaq";
import { getSiteUrl } from "@/lib/site";

// Title 50–60 chars and description 120–160 chars, both carrying the core
// keywords (viewer, formatter, table, tree, spreadsheet, diff) so search
// engines see consistent keyword coverage across title/meta/headings.
const TITLE = "JSON‑Table — Free Online JSON Viewer, Formatter & Table";
const DESCRIPTION =
  "Free online JSON viewer, formatter & table tool. View JSON as a tree or sortable spreadsheet, then beautify, minify, validate, or diff it. No uploads.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${getSiteUrl()}/` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${getSiteUrl()}/` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "JSON\u2011Table",
          url: getSiteUrl(),
          description:
            "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "JSON\u2011Table",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          url: getSiteUrl(),
          description:
            "Explore, edit, and understand JSON visually. The easiest way to view JSON as a table.",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "JSON\u2011Table",
          url: getSiteUrl(),
          logo: `${getSiteUrl()}/favicon.svg`,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Landing />;
}

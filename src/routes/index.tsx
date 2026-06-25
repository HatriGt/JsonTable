import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";
import { FAQ_ITEMS } from "@/components/landing/LandingFaq";
import { getSiteUrl } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JSON\u2011Table \u2014 The fastest way to read JSON" },
      {
        name: "description",
        content:
          "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet. Local\u2011first, fast, free.",
      },
      { property: "og:title", content: "JSON\u2011Table \u2014 The fastest way to read JSON" },
      {
        property: "og:description",
        content: "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
      },
      { property: "og:url", content: `${getSiteUrl()}/` },
      { name: "twitter:title", content: "JSON\u2011Table \u2014 The fastest way to read JSON" },
      {
        name: "twitter:description",
        content: "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
      },
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

import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "@/components/landing/Landing";
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
      { property: "og:url", content: "/" },
      { name: "twitter:title", content: "JSON\u2011Table \u2014 The fastest way to read JSON" },
      {
        name: "twitter:description",
        content: "Turn any JSON into a navigable tree and a sortable, filterable spreadsheet.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
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
    ],
  }),
  component: Index,
});

function Index() {
  return <Landing />;
}

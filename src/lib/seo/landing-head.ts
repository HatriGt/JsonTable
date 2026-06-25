import { getSiteUrl } from "@/lib/site";
import type { Faq } from "@/components/seo/SeoLanding";

type LandingHeadArgs = {
  /** Absolute path, e.g. "/json-viewer". */
  path: string;
  /** Breadcrumb/label name, e.g. "JSON Viewer". */
  name: string;
  title: string;
  description: string;
  faqs: readonly Faq[];
};

/** Builds a TanStack Router `head()` payload for an SEO landing route:
 *  unique title/description, absolute canonical + OG, and FAQPage +
 *  BreadcrumbList JSON-LD. Mirrors the meta strategy in routes/index.tsx. */
export function seoLandingHead({ path, name, title, description, faqs }: LandingHeadArgs) {
  const url = `${getSiteUrl()}${path}`;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: `${getSiteUrl()}/` },
            { "@type": "ListItem", position: 2, name, item: url },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  };
}

import { getSiteUrl } from "@/lib/site";
import type { Faq } from "@/components/seo/SeoLanding";

type Crumb = { name: string; path: string };

type ArticleHeadArgs = {
  /** Absolute path, e.g. "/guides/how-to-format-json". */
  path: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) the article was published. */
  datePublished: string;
  /** ISO date (YYYY-MM-DD) it was last updated; defaults to datePublished. */
  dateModified?: string;
  /** Breadcrumb trail excluding Home, e.g. [{name:"Guides",path:"/guides"}, …]. */
  breadcrumbs: readonly Crumb[];
  /** Optional visible FAQ; emits FAQPage JSON-LD when present. */
  faqs?: readonly Faq[];
};

/** Builds a TanStack Router `head()` payload for a guide/article route:
 *  unique title/description, absolute canonical + OG, BreadcrumbList +
 *  Article JSON-LD, and an optional FAQPage. Mirrors seoLandingHead. */
export function seoArticleHead({
  path,
  title,
  description,
  datePublished,
  dateModified,
  breadcrumbs,
  faqs,
}: ArticleHeadArgs) {
  const site = getSiteUrl();
  const url = `${site}${path}`;
  const crumbs = [{ name: "Home", path: "/" }, ...breadcrumbs];

  const scripts = [
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.name,
          item: `${site}${c.path}`,
        })),
      }),
    },
    {
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        headline: title,
        description,
        datePublished,
        dateModified: dateModified ?? datePublished,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: `${site}/og.png`,
        author: { "@type": "Organization", name: "JSON‑Table" },
        publisher: {
          "@type": "Organization",
          name: "JSON‑Table",
          logo: { "@type": "ImageObject", url: `${site}/icon-512.png` },
        },
      }),
    },
  ];

  if (faqs && faqs.length > 0) {
    scripts.push({
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
    });
  }

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: `${site}/og.png` },
      { property: "article:published_time", content: datePublished },
      { property: "article:modified_time", content: dateModified ?? datePublished },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: `${site}/og.png` },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts,
  };
}

/** Registry of guide articles in the /guides content cluster. Single source of
 *  truth for the hub listing, the sitemap, and cross-links. Keep slugs stable —
 *  they are indexed URLs. */
export type GuideMeta = {
  slug: string;
  title: string;
  /** Short card/summary line for the hub and cross-links. */
  summary: string;
  /** Small category label shown as an eyebrow. */
  kicker: string;
  /** ISO date (YYYY-MM-DD) for schema + display. */
  published: string;
};

export const GUIDES: readonly GuideMeta[] = [
  {
    slug: "how-to-format-json",
    title: "How to Format (Beautify) JSON",
    summary:
      "Pretty-print minified JSON with proper indentation, and minify it again — in your browser, no uploads.",
    kicker: "Formatting",
    published: "2026-07-16",
  },
  {
    slug: "how-to-compare-json-files",
    title: "How to Compare Two JSON Files",
    summary:
      "Find what changed between two JSON documents with a structural diff that ignores key order and formatting.",
    kicker: "Comparing",
    published: "2026-07-16",
  },
  {
    slug: "view-json-as-table",
    title: "How to View JSON as a Table",
    summary:
      "Turn an array of JSON objects into a sortable, filterable spreadsheet without writing a conversion script.",
    kicker: "Tables",
    published: "2026-07-16",
  },
  {
    slug: "json-syntax-explained",
    title: "JSON Syntax Explained",
    summary:
      "The complete rules of JSON — data types, objects, arrays, and the mistakes that make JSON invalid.",
    kicker: "Reference",
    published: "2026-07-16",
  },
] as const;

export function guidePath(slug: string) {
  return `/guides/${slug}`;
}

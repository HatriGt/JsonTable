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
  {
    slug: "how-to-validate-json",
    title: "How to Validate JSON",
    summary:
      "Check whether JSON is valid, read the error message, and jump to the exact line and column to fix it.",
    kicker: "Validation",
    published: "2026-07-17",
  },
  {
    slug: "json-vs-csv",
    title: "JSON vs CSV: Which Should You Use?",
    summary:
      "How JSON and CSV differ, when each format wins, and how to view tabular JSON as a spreadsheet.",
    kicker: "Comparison",
    published: "2026-07-17",
  },
  {
    slug: "read-large-json-files",
    title: "How to Read Large JSON Files",
    summary:
      "Open and explore huge JSON without your browser freezing — using a virtualized tree and a filterable grid.",
    kicker: "Performance",
    published: "2026-07-17",
  },
  {
    slug: "how-to-minify-json",
    title: "How to Minify JSON",
    summary:
      "Strip whitespace to shrink JSON to the smallest valid payload, when to do it, and how to expand it again.",
    kicker: "Formatting",
    published: "2026-07-17",
  },
  {
    slug: "json-vs-xml",
    title: "JSON vs XML: Differences & When to Use Each",
    summary:
      "How JSON and XML compare on syntax, size, and tooling — and why JSON became the default for web APIs.",
    kicker: "Comparison",
    published: "2026-07-17",
  },
  {
    slug: "escape-characters-in-json",
    title: "Escaping Characters in JSON Strings",
    summary:
      "Which characters must be escaped in JSON, the full escape list, and how to handle quotes, newlines, and Unicode.",
    kicker: "Reference",
    published: "2026-07-17",
  },
] as const;

export function guidePath(slug: string) {
  return `/guides/${slug}`;
}

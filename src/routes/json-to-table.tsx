import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, type SeoLandingContent } from "@/components/seo/SeoLanding";
import { seoLandingHead } from "@/lib/seo/landing-head";

const CONTENT: SeoLandingContent = {
  eyebrow: "JSON to table converter",
  h1: (
    <>
      Convert JSON to a <span className="font-mono font-medium text-brand">sortable table</span>
    </>
  ),
  intro:
    "Turn an array of JSON objects into a spreadsheet-style grid. Columns are derived from your keys automatically, so you can sort, filter per column, reorder columns, and edit cells inline — no conversion step, no upload.",
  steps: [
    {
      title: "Paste an array of objects",
      body: "Load JSON that contains an array of objects. Drop a file, paste from the clipboard, or open one up to 10 MB.",
    },
    {
      title: "See it as a table",
      body: "Keys become columns automatically and each object becomes a row in a fast, virtualized grid.",
    },
    {
      title: "Sort, filter, and edit",
      body: "Sort by any column, apply per-column filters, drag to reorder columns, and edit values inline.",
    },
  ],
  benefits: [
    {
      title: "Automatic columns",
      body: "Column headers are inferred from your object keys, with sampling so even very large arrays render instantly.",
    },
    {
      title: "Spreadsheet controls",
      body: "Per-column filters, multi-direction sort, column reordering, and inline editing — the things you expect from a table.",
    },
    {
      title: "Nested data stays explorable",
      body: "Nested objects and arrays open into their own tables, so you can drill in without losing the top-level view.",
    },
    {
      title: "Local-first and free",
      body: "Conversion happens in your browser. Nothing is uploaded, no account is needed, and it is free to use.",
    },
  ],
  faqs: [
    {
      q: "How do I convert JSON to a table?",
      a: "Paste or open JSON that contains an array of objects. JSON-Table automatically derives columns from the keys and renders each object as a row.",
    },
    {
      q: "Can I sort and filter the table?",
      a: "Yes. You can sort by any column, apply per-column filters, reorder columns by dragging, and edit cell values inline.",
    },
    {
      q: "What about nested objects and arrays?",
      a: "Nested values open into their own nested tables, so deeply structured JSON stays fully explorable.",
    },
    {
      q: "Is the data uploaded to convert it?",
      a: "No. The JSON-to-table conversion runs entirely in your browser; your data never leaves your machine.",
    },
  ],
  related: [
    {
      href: "/json-viewer",
      label: "JSON Viewer",
      desc: "Explore JSON as a collapsible tree and a filterable grid.",
    },
    {
      href: "/json-formatter",
      label: "JSON Formatter",
      desc: "Beautify, minify, and validate JSON with inline error locations.",
    },
    {
      href: "/json-diff",
      label: "JSON Diff",
      desc: "Compare two JSON documents and see what changed by path.",
    },
    {
      href: "/workspace",
      label: "Open the workspace",
      desc: "Jump straight into the grid and start building your table.",
    },
  ],
  closing: "Turn your JSON into a table now",
};

export const Route = createFileRoute("/json-to-table")({
  head: () =>
    seoLandingHead({
      path: "/json-to-table",
      name: "JSON to Table",
      title: "JSON to Table — Convert JSON to a Sortable Grid | JSON‑Table",
      description:
        "Free online JSON to table converter. Turn an array of JSON objects into a sortable, filterable spreadsheet grid with inline editing. Local-first, no uploads.",
      faqs: CONTENT.faqs,
    }),
  component: () => <SeoLanding content={CONTENT} />,
});

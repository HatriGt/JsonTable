import { createFileRoute } from "@tanstack/react-router";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonViewerTool } from "@/components/tools/JsonViewerTool";
import { seoLandingHead } from "@/lib/seo/landing-head";

const FAQS = [
  {
    q: "Is this JSON viewer free?",
    a: "Yes. JSON-Table is completely free and requires no sign-up.",
  },
  {
    q: "Is my JSON data uploaded anywhere?",
    a: "No. The viewer runs entirely in your browser — your data never leaves your machine.",
  },
  {
    q: "Can it handle large, deeply nested JSON?",
    a: "Yes. Paste it here for a quick collapsible tree, or open it in the workspace for a virtualized tree plus a filterable grid built for very large documents.",
  },
  {
    q: "What's the difference from the workspace?",
    a: "This page is a fast read-only tree viewer. The workspace adds search, per-column filters, sorting, inline editing, and a spreadsheet grid.",
  },
] as const;

export const Route = createFileRoute("/json-viewer")({
  head: () =>
    seoLandingHead({
      path: "/json-viewer",
      name: "JSON Viewer",
      title: "JSON Viewer Online — Explore JSON as a Tree | JSON‑Table",
      description:
        "Free online JSON viewer. Paste JSON to explore it as a collapsible, color-coded tree. Local-first, fast, no uploads — open in the workspace for grid + filters.",
      faqs: FAQS,
    }),
  component: () => (
    <ToolPageShell
      eyebrow="Online JSON viewer"
      title={
        <>
          View JSON as a <span className="font-mono font-medium text-brand">tree</span>
        </>
      }
      intro="Paste JSON to explore it as a collapsible, color-coded tree. For very large or tabular data, open it in the workspace for a virtualized grid with filters and search."
      faqs={FAQS}
    >
      <JsonViewerTool />
    </ToolPageShell>
  ),
});

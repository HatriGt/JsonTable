import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, type SeoLandingContent } from "@/components/seo/SeoLanding";
import { seoLandingHead } from "@/lib/seo/landing-head";

const CONTENT: SeoLandingContent = {
  eyebrow: "Online JSON viewer",
  h1: (
    <>
      JSON Viewer — explore JSON as a{" "}
      <span className="font-mono font-medium text-brand">tree and grid</span>
    </>
  ),
  intro:
    "Paste, drop, or open a JSON file and read it as a collapsible tree and a sortable, filterable grid. Built for large, deeply nested payloads — find any value in seconds instead of scrolling through raw text.",
  steps: [
    {
      title: "Load your JSON",
      body: "Paste from the clipboard, drag a file in, or open one up to 10 MB. Parsing runs off the main thread so the UI stays smooth.",
    },
    {
      title: "Navigate the tree",
      body: "Expand and collapse nested keys, or jump straight to any node. Long arrays load on demand instead of freezing the page.",
    },
    {
      title: "Inspect in the grid",
      body: "Switch arrays of objects into a spreadsheet-style grid, then sort, filter, and search across every key and value.",
    },
  ],
  benefits: [
    {
      title: "Handles big, nested JSON",
      body: "A virtualized tree and grid keep rendering fast even on files with tens of thousands of rows and deep nesting.",
    },
    {
      title: "Private by design",
      body: "Everything runs locally in your browser. Your JSON is never uploaded to a server and no account is required.",
    },
    {
      title: "Two views, one document",
      body: "Read structure in the tree, read data in the grid, and edit in either — changes stay in sync across both.",
    },
    {
      title: "Fast global search",
      body: "Search keys and values with keyboard shortcuts and jump to matches without losing your place.",
    },
  ],
  faqs: [
    {
      q: "Is this JSON viewer free?",
      a: "Yes. JSON-Table is completely free and requires no sign-up.",
    },
    {
      q: "Is my JSON data uploaded anywhere?",
      a: "No. The viewer runs entirely in your browser — your data never leaves your machine.",
    },
    {
      q: "How large a JSON file can it open?",
      a: "You can paste, drop, or open files up to 10 MB. Large files are parsed off the main thread to keep the interface responsive.",
    },
    {
      q: "Can it handle deeply nested JSON?",
      a: "Yes. The tree and grid are virtualized, so deeply nested objects and very long arrays render without freezing the page.",
    },
  ],
  related: [
    {
      href: "/json-formatter",
      label: "JSON Formatter",
      desc: "Beautify, minify, and validate JSON with inline error locations.",
    },
    {
      href: "/json-to-table",
      label: "JSON to Table",
      desc: "Turn arrays of objects into a sortable, filterable spreadsheet.",
    },
    {
      href: "/json-diff",
      label: "JSON Diff",
      desc: "Compare two JSON documents and see what changed by path.",
    },
    {
      href: "/workspace",
      label: "Open the workspace",
      desc: "Jump straight into the full tree + grid workspace.",
    },
  ],
  closing: "View your JSON now",
};

export const Route = createFileRoute("/json-viewer")({
  head: () =>
    seoLandingHead({
      path: "/json-viewer",
      name: "JSON Viewer",
      title: "JSON Viewer Online — Explore JSON as a Tree & Grid | JSON‑Table",
      description:
        "Free online JSON viewer. Paste, drop, or open JSON and explore it as a collapsible tree and a sortable, filterable grid. Local-first, fast, no uploads.",
      faqs: CONTENT.faqs,
    }),
  component: () => <SeoLanding content={CONTENT} />,
});

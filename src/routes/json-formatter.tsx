import { createFileRoute } from "@tanstack/react-router";
import { SeoLanding, type SeoLandingContent } from "@/components/seo/SeoLanding";
import { seoLandingHead } from "@/lib/seo/landing-head";

const CONTENT: SeoLandingContent = {
  eyebrow: "JSON formatter & validator",
  h1: (
    <>
      JSON Formatter — beautify, minify &{" "}
      <span className="font-mono font-medium text-brand">validate</span>
    </>
  ),
  intro:
    "Paste messy or minified JSON and format it instantly with proper indentation, or minify it back down to a single line. Invalid JSON is flagged inline with the exact line and column so you can fix it fast.",
  steps: [
    {
      title: "Paste your JSON",
      body: "Drop in raw, minified, or malformed JSON. The source editor auto-formats valid input as soon as you paste.",
    },
    {
      title: "Format or minify",
      body: "Beautify with clean 2-space indentation, or minify to a compact single line — one click each, in the Source pane.",
    },
    {
      title: "Catch errors instantly",
      body: "Syntax errors are underlined in the editor with the precise line and column, so you know exactly what to fix.",
    },
  ],
  benefits: [
    {
      title: "Real editor, not a textarea",
      body: "A CodeMirror-based source editor with syntax highlighting, line numbers, code folding, and find/replace.",
    },
    {
      title: "Format and minify",
      body: "Pretty-print for readability or minify for transport, then copy the result to the clipboard in one click.",
    },
    {
      title: "Inline validation",
      body: "Invalid JSON is highlighted as you type, with the error message and exact position surfaced right away.",
    },
    {
      title: "Private and free",
      body: "Formatting happens locally in your browser — no uploads, no accounts, no limits beyond a generous 10 MB file size.",
    },
  ],
  faqs: [
    {
      q: "How do I format (beautify) JSON?",
      a: "Paste your JSON into the Source pane — valid JSON is auto-formatted on paste — or click Format to pretty-print with 2-space indentation.",
    },
    {
      q: "Can I minify JSON too?",
      a: "Yes. The Minify action collapses formatted JSON back to a single compact line, ready to copy.",
    },
    {
      q: "Does it validate JSON?",
      a: "Yes. Invalid JSON is underlined inline with the error message and the exact line and column, so you can fix it quickly.",
    },
    {
      q: "Is my data sent to a server?",
      a: "No. Formatting and validation run entirely in your browser. Your JSON never leaves your machine.",
    },
  ],
  related: [
    {
      href: "/json-viewer",
      label: "JSON Viewer",
      desc: "Explore JSON as a collapsible tree and a filterable grid.",
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
      desc: "Jump straight into the source editor and grid.",
    },
  ],
  closing: "Format your JSON now",
};

export const Route = createFileRoute("/json-formatter")({
  head: () =>
    seoLandingHead({
      path: "/json-formatter",
      name: "JSON Formatter",
      title: "JSON Formatter & Validator — Beautify & Minify JSON | JSON‑Table",
      description:
        "Free online JSON formatter, beautifier, minifier, and validator. Paste JSON to format it with proper indentation or minify it, with inline error locations. Local-first.",
      faqs: CONTENT.faqs,
    }),
  component: () => <SeoLanding content={CONTENT} />,
});

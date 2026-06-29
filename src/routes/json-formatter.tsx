import { createFileRoute } from "@tanstack/react-router";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonFormatterTool } from "@/components/tools/JsonFormatterTool";
import { seoLandingHead } from "@/lib/seo/landing-head";

const FAQS = [
  {
    q: "How do I format (beautify) JSON?",
    a: "Paste your JSON and click Format to pretty-print it with 2-space indentation. Valid JSON also formats into the output panel automatically.",
  },
  {
    q: "Can I minify JSON too?",
    a: "Yes. The Minify action collapses your JSON back to a single compact line, ready to copy.",
  },
  {
    q: "Does it validate JSON?",
    a: "Yes. Invalid JSON shows an inline error with the message and the exact line and column, so you can fix it quickly.",
  },
  {
    q: "Is my data sent to a server?",
    a: "No. Formatting and validation run entirely in your browser. Your JSON never leaves your machine.",
  },
] as const;

export const Route = createFileRoute("/json-formatter")({
  head: () =>
    seoLandingHead({
      path: "/json-formatter",
      name: "JSON Formatter",
      title: "JSON Formatter & Validator — Beautify & Minify JSON | JSON‑Table",
      description:
        "Free online JSON formatter, beautifier, minifier, and validator. Paste JSON to format it with proper indentation or minify it, with inline error locations. Local-first.",
      faqs: FAQS,
    }),
  component: () => (
    <ToolPageShell
      eyebrow="JSON formatter & validator"
      title={
        <>
          Format, minify &amp; validate{" "}
          <span className="font-mono font-medium text-brand">JSON</span>
        </>
      }
      intro="Paste JSON to beautify it with clean indentation or minify it to a single line. Invalid JSON is flagged inline with the exact location. Runs in your browser — nothing is uploaded."
      faqs={FAQS}
    >
      <JsonFormatterTool />
    </ToolPageShell>
  ),
});

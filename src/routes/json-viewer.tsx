import { createFileRoute } from "@tanstack/react-router";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonToolkit } from "@/components/tools/JsonToolkit";
import { seoLandingHead } from "@/lib/seo/landing-head";

const FAQS = [
  {
    q: "Is this JSON viewer and formatter free?",
    a: "Yes. JSON-Table is completely free and requires no sign-up.",
  },
  {
    q: "How do I format (beautify) or minify JSON?",
    a: "Paste your JSON and switch the output to Formatted, or click Format to pretty-print the input with 2-space indentation. Minify collapses it back to a single compact line.",
  },
  {
    q: "Can I view JSON as a tree?",
    a: "Yes. The Tree view renders your JSON as a collapsible, color-coded tree so you can expand and explore nested objects and arrays.",
  },
  {
    q: "Does it validate JSON?",
    a: "Yes. Invalid JSON is flagged inline with the error message and the exact line and column, so you can fix it quickly.",
  },
  {
    q: "Is my JSON data uploaded anywhere?",
    a: "No. Viewing, formatting, and validation all run entirely in your browser — your data never leaves your machine.",
  },
  {
    q: "Can it handle large, deeply nested JSON?",
    a: "Yes. Paste it here for a quick tree or formatted view, or open it in the workspace for a virtualized tree plus a filterable grid built for very large documents.",
  },
] as const;

export const Route = createFileRoute("/json-viewer")({
  head: () =>
    seoLandingHead({
      path: "/json-viewer",
      name: "JSON Viewer & Formatter",
      title: "JSON Viewer & Formatter Online — Tree, Beautify, Validate",
      description:
        "Free online JSON viewer & formatter. Explore JSON as a collapsible tree, or beautify, minify, and validate it with inline error locations. No uploads.",
      faqs: FAQS,
    }),
  component: () => (
    <ToolPageShell
      eyebrow="Online JSON viewer & formatter"
      title={
        <>
          View &amp; format <span className="font-mono font-medium text-brand">JSON</span>
        </>
      }
      intro="Paste JSON to explore it as a collapsible, color-coded tree or to beautify, minify, and validate it. Switch between Tree and Formatted views anytime. Runs in your browser — nothing is uploaded."
      faqs={FAQS}
    >
      <JsonToolkit />
    </ToolPageShell>
  ),
});

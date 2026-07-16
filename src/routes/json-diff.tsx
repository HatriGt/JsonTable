import { createFileRoute, Link } from "@tanstack/react-router";
import { ToolPageShell } from "@/components/tools/ToolPageShell";
import { JsonDiffTool } from "@/components/diff/JsonDiffTool";
import { seoLandingHead } from "@/lib/seo/landing-head";

const FAQS = [
  {
    q: "How does the JSON diff work?",
    a: "Paste an original and a changed JSON document. JSON-Table compares them structurally — objects by key, arrays by index — and shows what was added, removed, and updated at each path.",
  },
  {
    q: "Is my data uploaded to compare it?",
    a: "No. The comparison runs entirely in your browser; neither document is sent to a server.",
  },
  {
    q: "Does key order affect the diff?",
    a: "No. Objects are compared by key regardless of order, so reordering keys is not reported as a change.",
  },
  {
    q: "Is it free?",
    a: "Yes. The JSON diff tool is completely free and requires no sign-up.",
  },
] as const;

export const Route = createFileRoute("/json-diff")({
  head: () =>
    seoLandingHead({
      path: "/json-diff",
      name: "JSON Diff",
      title: "JSON Diff — Compare Two JSON Files Online | JSON‑Table",
      description:
        "Free online JSON diff checker. Paste two JSON documents to see what was added, removed, and changed by path. Structural comparison, local-first, no uploads.",
      faqs: FAQS,
    }),
  component: () => (
    <ToolPageShell
      eyebrow="JSON diff checker"
      title={
        <>
          Compare two <span className="font-mono font-medium text-brand">JSON</span> files
        </>
      }
      intro="Paste an original and a changed document to see exactly what was added, removed, and updated — by path. Objects are matched by key and arrays by index, so reordering keys is never reported as a change. Runs entirely in your browser; nothing is uploaded."
      faqs={FAQS}
    >
      <JsonDiffTool />
      <section className="mx-auto mt-14 max-w-3xl text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">
          What a structural JSON diff shows you
        </h2>
        <p className="mt-3">
          A structural comparison walks both documents at the same time and reports changes at each{" "}
          <em>path</em> rather than line by line. That means a reformatted file — different
          indentation, reordered object keys, or collapsed whitespace — produces{" "}
          <strong>no false differences</strong>. You see only the changes that actually matter:
          values that were updated, keys that were added or removed, and elements that shifted in an
          array.
        </p>
        <h3 className="mt-6 text-base font-semibold text-foreground">Common uses</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>
            Reviewing changes between two API responses or two versions of a config file before
            shipping.
          </li>
          <li>
            Debugging why two environments (staging vs. production) return different payloads for
            the same request.
          </li>
          <li>
            Auditing an edit to a large JSON document to confirm only the intended fields moved.
          </li>
          <li>
            Comparing exported records — feature flags, translations, or fixtures — to catch drift.
          </li>
        </ul>
        <p className="mt-4">
          Everything runs locally in your browser, so you can safely compare private or sensitive
          documents. Need to explore one of them in depth first? Open it in the{" "}
          <Link to="/workspace" className="font-medium text-brand hover:underline">
            JSON workspace
          </Link>{" "}
          for a tree and filterable grid, or beautify it with the{" "}
          <Link to="/json-viewer" className="font-medium text-brand hover:underline">
            JSON viewer &amp; formatter
          </Link>
          .
        </p>
      </section>
    </ToolPageShell>
  ),
});

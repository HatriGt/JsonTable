import { createFileRoute } from "@tanstack/react-router";
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
  component: JsonDiffTool,
});

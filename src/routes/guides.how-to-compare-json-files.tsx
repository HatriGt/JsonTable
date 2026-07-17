import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/how-to-compare-json-files";
const PUBLISHED = "2026-07-16";

const FAQS = [
  {
    q: "How do I compare two JSON files?",
    a: "Paste the original into one panel and the changed version into the other. A structural diff walks both documents and reports every added, removed, and updated value by its path.",
  },
  {
    q: "Does reordering keys count as a change?",
    a: "No. A structural JSON diff matches objects by key, not by position, so reordering keys produces no differences. Only real value changes are reported.",
  },
  {
    q: "Can I compare JSON that is formatted differently?",
    a: "Yes. Because the comparison is structural rather than line-by-line, different indentation or whitespace never shows up as a change.",
  },
  {
    q: "Is my data uploaded when comparing?",
    a: "No. With JSON-Table the diff runs entirely in your browser, so you can safely compare private or sensitive documents.",
  },
] as const;

export const Route = createFileRoute("/guides/how-to-compare-json-files")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to Compare Two JSON Files | JSON‑Table",
      description:
        "Learn how to compare two JSON files and see exactly what changed. Understand structural vs. text diffs, why key order shouldn't matter, and how to diff JSON free in your browser.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to Compare Two JSON Files", path: PATH },
      ],
      faqs: FAQS,
    }),
  component: Article,
});

function Article() {
  return (
    <ArticleShell
      breadcrumbs={[
        { label: "Guides", href: "/guides" },
        { label: "How to Compare Two JSON Files", href: PATH },
      ]}
      eyebrow="Comparing"
      title="How to compare two JSON files"
      intro="Diffing JSON as plain text drowns you in false changes — reordered keys and reformatting look like edits when nothing really changed. A structural diff compares the data itself. Here's the difference and how to do it."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-diff",
          label: "JSON Diff",
          desc: "Compare two JSON documents and see what changed by path.",
        },
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Explore, beautify, and validate JSON in your browser.",
        },
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Explore large JSON as a tree and a grid.",
        },
      ]}
    >
      <h2>Text diff vs. structural diff</h2>
      <p>
        A normal <strong>text diff</strong> (like <code>git diff</code>) compares files line by
        line. For JSON that's a problem, because two files can hold identical data yet look
        completely different as text. Consider these two objects:
      </p>
      <pre>
        <code>{`// A
{ "id": 1, "name": "Ada" }

// B
{
  "name": "Ada",
  "id": 1
}`}</code>
      </pre>
      <p>
        A line-based diff screams that almost every line changed. But the <em>data</em> is the same
        — only the key order and formatting differ. That's noise.
      </p>
      <p>
        A <strong>structural diff</strong> parses both sides into their real structure and compares
        node by node. It matches objects by key and arrays by index, so it reports only genuine
        changes: values that were updated, keys that were added or removed, and elements that
        shifted in an array.
      </p>

      <h2>How to compare two JSON documents</h2>
      <p>
        Using the <Link to="/json-diff">JSON Diff</Link> tool:
      </p>
      <ol>
        <li>Paste the original document into the left panel.</li>
        <li>Paste the changed document into the right panel.</li>
        <li>
          Read the result: additions, removals, and updates are highlighted and grouped by path,
          with a running count of each.
        </li>
        <li>
          Toggle <strong>Hide unchanged</strong> to focus only on what moved, or{" "}
          <strong>Swap sides</strong> to flip which document is the baseline.
        </li>
      </ol>
      <p>
        Both documents are validated as you paste, so if one side isn't valid JSON you'll know
        immediately rather than getting a misleading diff.
      </p>

      <h2>Reading a JSON diff</h2>
      <p>
        Changes are reported against the <strong>path</strong> to each value. For example:
      </p>
      <ul>
        <li>
          <code>limits.requests</code>: <code>1000 → 5000</code> — an updated value.
        </li>
        <li>
          <code>limits.window</code>: <em>added</em> — a key that only exists in the new version.
        </li>
        <li>
          <code>regions[1]</code>: <code>"eu-west" → "ap-south"</code> — an element that changed at
          a specific array index.
        </li>
      </ul>
      <p>
        Paths make it easy to describe a change precisely in a review or bug report, instead of
        pointing at line numbers that shift whenever the file is reformatted.
      </p>

      <h2>Common reasons to diff JSON</h2>
      <ul>
        <li>Reviewing changes between two API responses or two versions of a config file.</li>
        <li>
          Debugging why staging and production return different payloads for the same request.
        </li>
        <li>Auditing an edit to a large document to confirm only the intended fields changed.</li>
        <li>Comparing exported data — feature flags, translations, fixtures — to catch drift.</li>
      </ul>

      <h2>A note on arrays</h2>
      <p>
        Arrays are compared by <strong>index</strong>, so inserting an item near the top can make
        everything after it look "changed" — each element shifted by one position. If you care about
        set membership rather than order, sort both arrays consistently before comparing, or compare
        the objects by a stable id. For most config and API payloads, index-based comparison is
        exactly what you want.
      </p>

      <h2>Frequently asked questions</h2>
      <dl>
        {FAQS.map((f) => (
          <div key={f.q}>
            <h3>{f.q}</h3>
            <p>{f.a}</p>
          </div>
        ))}
      </dl>
    </ArticleShell>
  );
}

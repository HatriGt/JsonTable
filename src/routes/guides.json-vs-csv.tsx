import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/json-vs-csv";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "What is the main difference between JSON and CSV?",
    a: "CSV is a flat grid of rows and columns; JSON is a hierarchical format that can nest objects and arrays to any depth. CSV suits simple tables, while JSON suits structured or nested data.",
  },
  {
    q: "Is JSON or CSV better for large datasets?",
    a: "For simple, flat rows CSV is smaller and streams row by row, which is efficient for very large tabular data. For nested or mixed-type records, JSON is clearer and avoids fragile escaping.",
  },
  {
    q: "Can JSON be viewed like a CSV spreadsheet?",
    a: "Yes, when the JSON is an array of objects. Each object becomes a row and its keys become columns, so you can view and sort it like a spreadsheet.",
  },
  {
    q: "Does CSV support data types?",
    a: "No. Every CSV field is just text; there's no built-in notion of numbers, booleans, or null. JSON preserves those types explicitly.",
  },
] as const;

export const Route = createFileRoute("/guides/json-vs-csv")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "JSON vs CSV: Differences & When to Use Each | JSON‑Table",
      description:
        "A clear comparison of JSON and CSV — structure, data types, size, and readability — with guidance on when to use each and how to view tabular JSON as a spreadsheet.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "JSON vs CSV", path: PATH },
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
        { label: "JSON vs CSV", href: PATH },
      ]}
      eyebrow="Comparison"
      title="JSON vs CSV: which should you use?"
      intro="JSON and CSV both store data as text, but they're built for different shapes. CSV is a flat table; JSON is a nested tree. Picking the right one comes down to how structured your data is — here's how to decide."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-to-table",
          label: "JSON to Table",
          desc: "View an array of JSON objects as a sortable grid.",
        },
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Explore, beautify, and validate JSON in your browser.",
        },
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Tree plus a fast, filterable grid for large JSON.",
        },
      ]}
    >
      <h2>The core difference: flat vs. nested</h2>
      <p>
        CSV (comma-separated values) is a <strong>flat grid</strong>: a header row of column names,
        then one row per record. It's perfect when every record has the same simple fields:
      </p>
      <pre>
        <code>{`id,name,role
1,Ada,admin
2,Linus,editor`}</code>
      </pre>
      <p>
        JSON (JavaScript Object Notation) is a <strong>hierarchy</strong>: values can be objects and
        arrays nested to any depth. The same records in JSON, but with room to grow:
      </p>
      <pre>
        <code>{`[
  { "id": 1, "name": "Ada",   "roles": ["admin", "editor"] },
  { "id": 2, "name": "Linus", "roles": ["editor"] }
]`}</code>
      </pre>
      <p>
        Notice <code>roles</code> is a list. CSV can't express that without awkward workarounds;
        JSON handles it natively.
      </p>

      <h2>How they compare</h2>
      <h3>Data types</h3>
      <p>
        JSON has real types — string, number, boolean, null, object, array. In CSV,{" "}
        <em>everything</em> is text, so <code>42</code>, <code>"42"</code>, and an empty cell are
        indistinguishable until something interprets them.
      </p>
      <h3>Structure</h3>
      <p>
        CSV is strictly two-dimensional. JSON nests, so a record can contain sub-records, lists, and
        optional fields without breaking the format.
      </p>
      <h3>Size and streaming</h3>
      <p>
        For large, flat datasets CSV is more compact (no repeated keys) and streams naturally one
        row at a time. JSON repeats each key on every object, which costs bytes but keeps records
        self-describing.
      </p>
      <h3>Readability and tooling</h3>
      <p>
        CSV opens instantly in any spreadsheet. JSON is the lingua franca of web APIs and config
        files, and is easier to validate and diff programmatically.
      </p>

      <h2>When to use each</h2>
      <ul>
        <li>
          <strong>Use CSV</strong> for simple tabular exports, spreadsheet imports, and huge flat
          datasets where size and streaming matter.
        </li>
        <li>
          <strong>Use JSON</strong> for API payloads, configuration, and any data with nesting,
          optional fields, or mixed types.
        </li>
      </ul>

      <h2>Getting the best of both</h2>
      <p>
        Much of the JSON you deal with is really tabular — an array of similar objects. You don't
        have to give up JSON's precision to get a spreadsheet view of it. Paste it into{" "}
        <Link to="/json-to-table">JSON to Table</Link> and each object becomes a row with columns
        derived from its keys, so you can sort and filter it like a CSV while the underlying data
        stays fully typed. For very large documents, the <Link to="/workspace">workspace</Link>{" "}
        pairs that grid with a tree so nested fields stay explorable. And if you need to check a
        file first, the <Link to="/json-viewer">viewer</Link> validates and formats it.
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

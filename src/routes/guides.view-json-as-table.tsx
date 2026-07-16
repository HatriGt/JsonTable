import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/view-json-as-table";
const PUBLISHED = "2026-07-16";

const FAQS = [
  {
    q: "How do I turn JSON into a table?",
    a: "Load JSON that contains an array of objects. Each object becomes a row and the keys become columns automatically — no conversion step or script required.",
  },
  {
    q: "What shape of JSON works best as a table?",
    a: "An array of objects with overlapping keys, like a list of records. Deeply nested or irregular data still works — nested values open into their own tables.",
  },
  {
    q: "Can I sort and filter the table?",
    a: "Yes. You can sort by any column, apply per-column filters, reorder columns by dragging, and edit values inline.",
  },
  {
    q: "Do I need to upload my file?",
    a: "No. The conversion runs in your browser with JSON-Table, so your data stays on your machine.",
  },
] as const;

export const Route = createFileRoute("/guides/view-json-as-table")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to View JSON as a Table — A Practical Guide | JSON‑Table",
      description:
        "Learn how to turn an array of JSON objects into a sortable, filterable spreadsheet. Understand which JSON shapes map to tables and how to handle nested data. Free, no uploads.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to View JSON as a Table", path: PATH },
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
        { label: "How to View JSON as a Table", href: PATH },
      ]}
      eyebrow="Tables"
      title="How to view JSON as a table"
      intro="A list of JSON records is really a table in disguise — rows and columns wrapped in braces. Seeing it as a grid lets you sort, filter, and scan it the way you would a spreadsheet. Here's how the mapping works."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-to-table",
          label: "JSON to Table",
          desc: "Convert an array of JSON objects into a sortable grid.",
        },
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Tree plus a fast, filterable grid for large JSON.",
        },
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Explore, beautify, and validate JSON in your browser.",
        },
      ]}
    >
      <h2>Which JSON becomes a table</h2>
      <p>
        The natural table shape is an <strong>array of objects</strong>, where each object is a
        record and the keys are the fields:
      </p>
      <pre>
        <code>{`[
  { "id": 1, "name": "Ada",  "role": "admin"  },
  { "id": 2, "name": "Linus","role": "editor" },
  { "id": 3, "name": "Grace","role": "admin"  }
]`}</code>
      </pre>
      <p>
        That maps cleanly onto a grid: three rows, and columns for <code>id</code>,{" "}
        <code>name</code>, and <code>role</code>. The header row is derived from the keys
        automatically, so you never define columns by hand.
      </p>

      <h2>How to convert JSON to a table</h2>
      <p>
        With the <Link to="/json-to-table">JSON to Table</Link> converter:
      </p>
      <ol>
        <li>Paste or open JSON containing an array of objects (files up to 10&nbsp;MB).</li>
        <li>Columns appear automatically, one per key, with each object as a row.</li>
        <li>
          Sort by any column, add per-column filters, drag to reorder columns, and edit cells
          inline.
        </li>
      </ol>

      <h2>Handling messy, real-world data</h2>
      <h3>Objects with different keys</h3>
      <p>
        Records rarely have identical fields. When one object has a key another lacks, the column
        still appears and missing cells are simply empty — you don't lose any data, and you can see
        at a glance which rows are incomplete.
      </p>
      <h3>Nested objects and arrays</h3>
      <p>
        A field whose value is itself an object or array doesn't flatten well into one cell. Instead
        of cramming it in, nested values open into their <strong>own nested table</strong>, so you
        can drill in without losing the top-level view.
      </p>
      <h3>Very large arrays</h3>
      <p>
        Tables with tens of thousands of rows stay responsive because the grid is virtualized — only
        the visible rows are rendered — and columns are inferred from a sample rather than every
        row. For the biggest documents, the <Link to="/workspace">workspace</Link> pairs the grid
        with a tree so you can navigate structure and data side by side.
      </p>

      <h2>What you can do once it's a table</h2>
      <ul>
        <li>
          <strong>Sort</strong> by any column to find the largest values or group similar rows.
        </li>
        <li>
          <strong>Filter</strong> per column to narrow thousands of records down to the ones you
          care about.
        </li>
        <li>
          <strong>Reorder columns</strong> so the fields you're comparing sit next to each other.
        </li>
        <li>
          <strong>Edit inline</strong> to fix a value, then read the updated JSON back out.
        </li>
      </ul>

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

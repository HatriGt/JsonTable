import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/read-large-json-files";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "Why does my browser freeze on large JSON?",
    a: "Most online tools render every node at once and re-parse on the main thread, so a document with tens of thousands of nodes locks up the tab. A virtualized viewer only renders what's on screen, which stays smooth.",
  },
  {
    q: "How big a JSON file can JSON-Table open?",
    a: "The workspace is built for large documents: parsing runs off the main thread and the tree and grid are virtualized, so files in the multi-megabyte range stay responsive.",
  },
  {
    q: "How do I find one value in a huge JSON file?",
    a: "Use search to jump to matches, collapse branches you don't need, and apply per-column filters in the grid to narrow thousands of rows down to the ones you want.",
  },
  {
    q: "Is a large file uploaded to be opened?",
    a: "No. JSON-Table parses and renders locally in your browser, so even large, sensitive files never leave your machine.",
  },
] as const;

export const Route = createFileRoute("/guides/read-large-json-files")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to Read Large JSON Files | JSON‑Table",
      description:
        "Open and explore huge JSON files without your browser locking up. Learn why big JSON is slow and how a virtualized tree, off-thread parsing, and a filterable grid keep it fast.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to Read Large JSON Files", path: PATH },
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
        { label: "How to Read Large JSON Files", href: PATH },
      ]}
      eyebrow="Performance"
      title="How to read large JSON files"
      intro="Big JSON breaks most viewers — the tab hangs, scrolling stutters, or the page crashes. The fix isn't a faster machine; it's a tool that only does the work that's actually on screen. Here's what makes large JSON slow and how to open it anyway."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Virtualized tree plus a filterable grid, built for big JSON.",
        },
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
      ]}
    >
      <h2>Why large JSON is slow to open</h2>
      <p>
        A JSON file that's slow to view is rarely slow because of its size on disk — it's slow
        because of what the viewer <em>does</em> with it. Three things pile up:
      </p>
      <ul>
        <li>
          <strong>Rendering every node.</strong> Drawing tens of thousands of DOM elements at once
          overwhelms the browser, even if you only look at the first screen.
        </li>
        <li>
          <strong>Parsing on the main thread.</strong> If parsing and formatting block the UI
          thread, the tab is frozen until they finish.
        </li>
        <li>
          <strong>Full re-scans.</strong> Building a table by walking every row for every key, or
          re-parsing on each keystroke, turns a large document into a stutter.
        </li>
      </ul>

      <h2>What actually keeps it fast</h2>
      <h3>Virtualization</h3>
      <p>
        A virtualized tree or grid renders only the rows currently visible plus a small buffer, and
        recycles them as you scroll. Whether the document has 1,000 or 100,000 nodes, the browser is
        only ever drawing a screenful — so scrolling stays smooth.
      </p>
      <h3>Off-thread parsing</h3>
      <p>
        Moving the parse off the main thread keeps the interface responsive while a big document
        loads, instead of freezing the tab until it's done.
      </p>
      <h3>Sampling for columns</h3>
      <p>
        When JSON is shown as a table, inferring columns from a sample of rows rather than scanning
        every single one means the grid appears almost instantly, even for very large arrays.
      </p>

      <h2>How to open a large JSON file</h2>
      <p>
        The <Link to="/workspace">workspace</Link> is built for exactly this:
      </p>
      <ol>
        <li>Open or drop your file (or paste the JSON).</li>
        <li>
          Explore it as a <strong>virtualized tree</strong> — collapse branches you don't need and
          expand only the parts you're investigating.
        </li>
        <li>
          Switch to the <strong>grid</strong> for array-of-object data and use per-column filters
          and sorting to zero in on specific records.
        </li>
        <li>
          <strong>Search</strong> to jump straight to a key or value instead of scrolling.
        </li>
      </ol>

      <h2>Tips for working with big documents</h2>
      <ul>
        <li>
          Collapse the top-level structure first, then drill only into the branch you care about.
        </li>
        <li>
          Filter the grid before scrolling — narrowing 50,000 rows to a handful is faster than
          hunting by eye.
        </li>
        <li>
          If you only need to check validity or reformat, the <Link to="/json-viewer">viewer</Link>{" "}
          is quicker than loading the full workspace.
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

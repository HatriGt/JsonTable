import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/how-to-format-json";
const PUBLISHED = "2026-07-16";

const FAQS = [
  {
    q: "What does it mean to format or beautify JSON?",
    a: "Formatting (or beautifying) JSON re-writes it with consistent indentation and line breaks so the structure is easy to read. It doesn't change the data — only the whitespace.",
  },
  {
    q: "What is the difference between formatting and minifying?",
    a: "Formatting adds whitespace to make JSON readable; minifying removes all optional whitespace to make the payload as small as possible. Both represent identical data.",
  },
  {
    q: "How many spaces should JSON be indented?",
    a: "Two spaces is the most common convention and the default in most tools, including JSON-Table. Four spaces and tabs are also valid — indentation is purely cosmetic.",
  },
  {
    q: "Is it safe to format sensitive JSON online?",
    a: "With JSON-Table, yes: formatting runs entirely in your browser and nothing is uploaded to a server, so private data never leaves your machine.",
  },
] as const;

export const Route = createFileRoute("/guides/how-to-format-json")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to Format (Beautify) JSON | JSON‑Table",
      description:
        "Learn how to format and beautify JSON with proper indentation, minify it back to a compact line, and fix the errors that stop it from formatting. Free, no uploads.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to Format JSON", path: PATH },
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
        { label: "How to Format JSON", href: PATH },
      ]}
      eyebrow="Formatting"
      title="How to format (beautify) JSON"
      intro="Minified JSON is fast to transfer but painful to read. Formatting adds indentation and line breaks so you can actually follow the structure — without changing a single value. Here's how it works and how to do it in seconds."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Beautify, minify, and validate JSON in your browser.",
        },
        {
          href: "/json-diff",
          label: "JSON Diff",
          desc: "Compare two JSON documents and see what changed.",
        },
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Explore large JSON as a tree and a grid.",
        },
      ]}
    >
      <h2>What "formatting" JSON actually does</h2>
      <p>
        JSON is often stored and transmitted <strong>minified</strong> — all optional whitespace
        removed to keep the payload small:
      </p>
      <pre>
        <code>{`{"name":"Ada","roles":["admin","editor"],"active":true}`}</code>
      </pre>
      <p>
        That's efficient for a machine but hard for a human. Formatting (also called{" "}
        <strong>beautifying</strong> or pretty-printing) re-writes the same data with indentation
        and line breaks:
      </p>
      <pre>
        <code>{`{
  "name": "Ada",
  "roles": [
    "admin",
    "editor"
  ],
  "active": true
}`}</code>
      </pre>
      <p>
        Both snippets encode <em>exactly</em> the same object. Formatting only touches whitespace,
        so it is always safe — you never risk changing a value by beautifying it.
      </p>

      <h2>How to format JSON in the browser</h2>
      <p>
        The fastest way is a tool that runs locally so your data never leaves your machine. In the{" "}
        <Link to="/json-viewer">JSON Viewer &amp; Formatter</Link>:
      </p>
      <ol>
        <li>Paste your JSON into the input, or open a file.</li>
        <li>
          Switch the output to <strong>Formatted</strong> to see it pretty-printed with 2-space
          indentation.
        </li>
        <li>
          Use <strong>Copy</strong> to grab the beautified result, or <strong>Minify</strong> to
          collapse it back to a single compact line.
        </li>
      </ol>
      <p>
        Validation runs as you type, so if the JSON can't be formatted you'll see exactly where the
        problem is (more on that below).
      </p>

      <h2>Formatting vs. minifying</h2>
      <p>These are two directions of the same operation. Reach for each when:</p>
      <ul>
        <li>
          <strong>Format</strong> when you're reading, reviewing, or debugging — logs, API
          responses, config files.
        </li>
        <li>
          <strong>Minify</strong> when you're shipping — embedding JSON in a request body, a data
          attribute, or a file where size matters.
        </li>
      </ul>
      <p>
        If you write JSON by hand in a code editor, you can also format programmatically with{" "}
        <code>JSON.stringify(value, null, 2)</code> for pretty output or{" "}
        <code>JSON.stringify(value)</code> to minify.
      </p>

      <h2>Why won't my JSON format?</h2>
      <p>
        A formatter can only pretty-print <em>valid</em> JSON. If nothing happens, the input almost
        always has one of these problems:
      </p>
      <ul>
        <li>
          <strong>Trailing commas</strong> — <code>{`{"a": 1,}`}</code> is invalid; remove the comma
          after the last item.
        </li>
        <li>
          <strong>Single quotes</strong> — JSON strings and keys must use double quotes, not{" "}
          <code>'single'</code> quotes.
        </li>
        <li>
          <strong>Unquoted keys</strong> — <code>{`{name: "Ada"}`}</code> must be{" "}
          <code>{`{"name": "Ada"}`}</code>.
        </li>
        <li>
          <strong>Comments</strong> — standard JSON does not allow <code>//</code> or{" "}
          <code>/* */</code> comments.
        </li>
        <li>
          <strong>Wrapping text</strong> — a leading label like <code>data = {`{ … }`}</code> or a
          trailing semicolon will break parsing.
        </li>
      </ul>
      <p>
        A good formatter points to the exact line and column of the first error so you can fix it
        quickly. For the full rules, see{" "}
        <Link to="/guides/json-syntax-explained">JSON syntax explained</Link>.
      </p>

      <h2>Formatting large JSON files</h2>
      <p>
        Very large documents (tens of thousands of nodes) can be slow to read even when formatted.
        In that case, a tree view is often more useful than a wall of text: you can collapse
        branches and expand only what you need. Open big files in the{" "}
        <Link to="/workspace">workspace</Link> for a virtualized tree plus a filterable grid, or use
        the Tree view in the <Link to="/json-viewer">viewer</Link> for quick inspection.
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

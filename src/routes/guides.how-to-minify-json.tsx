import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/how-to-minify-json";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "What does minifying JSON do?",
    a: "Minifying removes all optional whitespace — indentation, line breaks, and spaces between tokens — so the JSON becomes the smallest valid representation of the same data.",
  },
  {
    q: "Does minifying change the data?",
    a: "No. Minifying only removes whitespace between tokens. The parsed value is identical; only the byte size changes.",
  },
  {
    q: "How much smaller is minified JSON?",
    a: "It depends on how much indentation the source had, but pretty-printed JSON is often 20–50% larger than its minified form. The savings are biggest for deeply nested documents.",
  },
  {
    q: "Can I expand minified JSON again?",
    a: "Yes. Minifying is reversible — a formatter re-adds indentation to make it readable. No information is lost.",
  },
] as const;

export const Route = createFileRoute("/guides/how-to-minify-json")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to Minify JSON — Shrink Payloads | JSON‑Table",
      description:
        "Learn how to minify JSON to the smallest valid payload, when minification is worth it, and how to expand it back. Runs in your browser — no uploads.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to Minify JSON", path: PATH },
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
        { label: "How to Minify JSON", href: PATH },
      ]}
      eyebrow="Formatting"
      title="How to minify JSON"
      intro="Minifying JSON strips every byte that isn't part of the data — the indentation and line breaks that make it readable. The result is identical data in a smaller payload. Here's when it helps and how to do it (and undo it)."
      updated="July 2026"
      readingTime="3 min read"
      related={[
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Minify, beautify, and validate JSON in your browser.",
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
      <h2>What minifying does</h2>
      <p>
        JSON allows whitespace between tokens for readability, but that whitespace carries no data.
        Minifying removes all of it — indentation, line breaks, and the spaces after colons and
        commas:
      </p>
      <pre>
        <code>{`// pretty-printed (readable)
{
  "name": "Ada",
  "roles": ["admin", "editor"]
}

// minified (compact)
{"name":"Ada","roles":["admin","editor"]}`}</code>
      </pre>
      <p>
        Both parse to exactly the same object. Minifying is purely a size optimization — it never
        changes a value.
      </p>

      <h2>How to minify JSON in the browser</h2>
      <p>
        In the <Link to="/json-viewer">JSON Viewer &amp; Formatter</Link>:
      </p>
      <ol>
        <li>Paste your JSON, or open a file.</li>
        <li>
          Click <strong>Minify</strong> to collapse it to a single compact line.
        </li>
        <li>
          <strong>Copy</strong> the result — or click <strong>Format</strong> to expand it back to a
          readable, indented document.
        </li>
      </ol>
      <p>
        In code, the equivalent is <code>JSON.stringify(value)</code> to minify and{" "}
        <code>JSON.stringify(value, null, 2)</code> to pretty-print.
      </p>

      <h2>When minifying is worth it</h2>
      <ul>
        <li>
          <strong>Network payloads</strong> — smaller request and response bodies mean less to
          transfer. (Note: HTTP compression like gzip/brotli already removes most repeated
          whitespace, so the win is smaller when compression is on.)
        </li>
        <li>
          <strong>Embedding JSON</strong> in an HTML data attribute, a URL, or a single-line config
          value where line breaks would be awkward.
        </li>
        <li>
          <strong>Storage limits</strong> — fitting more data into size-capped fields like{" "}
          <code>localStorage</code> or a database column.
        </li>
      </ul>
      <p>
        When you're reading or debugging, do the opposite and{" "}
        <Link to="/guides/how-to-format-json">format (beautify) the JSON</Link> instead — minified
        JSON is hard for humans to scan.
      </p>

      <h2>Minifying vs. compression</h2>
      <p>
        Minifying removes whitespace at the JSON level; gzip/brotli compress the bytes at the
        transport level. They stack, but compression does most of the heavy lifting for repetitive
        text. If your server already compresses responses, minify for the cleaner single-line form
        rather than expecting a dramatic size drop.
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

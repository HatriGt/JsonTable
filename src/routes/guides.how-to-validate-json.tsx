import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/how-to-validate-json";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "How do I check if JSON is valid?",
    a: "Paste it into a JSON validator. Valid JSON parses and renders; invalid JSON is rejected with an error message pointing to the first problem, usually with a line and column.",
  },
  {
    q: "What makes JSON invalid?",
    a: "The most common causes are trailing commas, single quotes instead of double quotes, unquoted keys, comments, and stray text wrapping the JSON. Any one of these stops it from parsing.",
  },
  {
    q: "What does 'Unexpected token' mean?",
    a: "It means the parser reached a character it didn't expect at that position — often a missing comma or bracket just before it, or a value that isn't quoted correctly. Check the reported location and the character right before it.",
  },
  {
    q: "Is online JSON validation private?",
    a: "With JSON-Table, yes. Validation runs entirely in your browser, so the data you paste is never uploaded to a server.",
  },
] as const;

export const Route = createFileRoute("/guides/how-to-validate-json")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "How to Validate JSON — Find & Fix Errors Fast | JSON‑Table",
      description:
        "Learn how to validate JSON, read parser error messages, and fix the most common causes of invalid JSON — trailing commas, single quotes, and more. Free, no uploads.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "How to Validate JSON", path: PATH },
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
        { label: "How to Validate JSON", href: PATH },
      ]}
      eyebrow="Validation"
      title="How to validate JSON"
      intro="A single misplaced comma can make an entire document unparseable. Validating JSON tells you whether it's well-formed and, when it isn't, points to exactly where it broke. Here's how to read those errors and fix them fast."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Validate and beautify JSON with inline error locations.",
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
      <h2>What "valid JSON" means</h2>
      <p>
        JSON is valid when it follows the format's grammar exactly: double-quoted keys and strings,
        commas between items but never after the last one, matching brackets and braces, and a
        single root value. A validator parses the text against those rules — if it parses, it's
        valid; if it doesn't, the parser stops at the first violation and reports it.
      </p>

      <h2>How to validate JSON in the browser</h2>
      <p>
        Using the <Link to="/json-viewer">JSON Viewer &amp; Formatter</Link>:
      </p>
      <ol>
        <li>Paste your JSON, or open a file.</li>
        <li>Valid JSON immediately renders — as a formatted document or a collapsible tree.</li>
        <li>
          Invalid JSON is flagged inline with the error message and the exact{" "}
          <strong>line and column</strong> of the first problem, so you can jump straight to it.
        </li>
      </ol>
      <p>Because it runs locally, you can validate private payloads without uploading anything.</p>

      <h2>The most common reasons JSON is invalid</h2>
      <h3>Trailing commas</h3>
      <p>
        A comma after the last element is the single most common error. <code>{`[1, 2, 3,]`}</code>{" "}
        and <code>{`{"a": 1,}`}</code> are both invalid — remove the final comma.
      </p>
      <h3>Single quotes</h3>
      <p>
        JSON requires double quotes. <code>{`{'name': 'Ada'}`}</code> must be{" "}
        <code>{`{"name": "Ada"}`}</code>.
      </p>
      <h3>Unquoted keys</h3>
      <p>
        Object keys are always quoted strings. <code>{`{name: "Ada"}`}</code> is invalid JSON even
        though it's valid JavaScript.
      </p>
      <h3>Comments</h3>
      <p>
        Standard JSON has no comments. Strip any <code>//</code> or <code>/* … */</code> before
        parsing, or use a format like JSON5/JSONC if you truly need them.
      </p>
      <h3>Wrapping text</h3>
      <p>
        A leading label such as <code>data = </code>, a trailing semicolon, or a JSONP callback
        wrapper will all break parsing. The document must start with a value (<code>{`{`}</code>,{" "}
        <code>[</code>, a string, number, etc.) and end with its close.
      </p>

      <h2>Reading a parser error</h2>
      <p>
        Messages like <code>{`Unexpected token } in JSON at position 42`}</code> or{" "}
        <code>Unexpected end of JSON input</code> sound cryptic but follow a pattern:
      </p>
      <ul>
        <li>
          <strong>"Unexpected token X"</strong> — the parser hit <code>X</code> where it expected
          something else. The real mistake is usually just <em>before</em> that point (a missing
          comma or an unclosed string).
        </li>
        <li>
          <strong>"Unexpected end of input"</strong> — a bracket or brace was never closed, so the
          parser ran out of text while still expecting more.
        </li>
        <li>
          <strong>"Expected property name"</strong> — usually an unquoted key or a trailing comma
          right before a closing <code>{`}`}</code>.
        </li>
      </ul>
      <p>
        A validator that reports the line and column turns this into a quick fix: go to the
        location, look at the character just before it, and correct the nearest structural mistake.
        For the full ruleset, see{" "}
        <Link to="/guides/json-syntax-explained">JSON syntax explained</Link>.
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

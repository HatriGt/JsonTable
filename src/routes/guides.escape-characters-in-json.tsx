import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/escape-characters-in-json";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "Which characters must be escaped in JSON?",
    a: 'Inside a string you must escape the double quote (\\") and the backslash (\\\\), plus control characters like newline (\\n), tab (\\t), and carriage return (\\r). Everything else can appear literally.',
  },
  {
    q: "How do I include a double quote inside a JSON string?",
    a: 'Escape it with a backslash: "She said \\"hi\\"". The backslash tells the parser the quote is part of the string, not the end of it.',
  },
  {
    q: "How are Unicode characters written in JSON?",
    a: "You can include most Unicode characters directly in a UTF-8 document, or escape them as \\uXXXX using the character's four-digit hex code point.",
  },
  {
    q: "Do forward slashes need escaping in JSON?",
    a: "No. A forward slash (/) may optionally be written as \\/, but it is not required. Most tools leave it unescaped.",
  },
] as const;

export const Route = createFileRoute("/guides/escape-characters-in-json")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "Escaping Characters in JSON Strings | JSON‑Table",
      description:
        "Which characters must be escaped in JSON, the complete escape sequence list, and how to handle quotes, backslashes, newlines, and Unicode. With examples.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "Escaping Characters in JSON", path: PATH },
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
        { label: "Escaping Characters in JSON", href: PATH },
      ]}
      eyebrow="Reference"
      title="Escaping characters in JSON strings"
      intro="A stray quote or backslash inside a string is one of the most common ways JSON breaks. Escaping tells the parser which characters are data and which are structure. Here's the complete set of rules, with examples."
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
      <h2>Why escaping exists</h2>
      <p>
        A JSON string is wrapped in double quotes. So how do you put a double quote <em>inside</em>{" "}
        a string without ending it early? You escape it with a backslash. Escaping is how JSON
        distinguishes characters that are part of your data from the characters that mark where a
        string starts and stops.
      </p>
      <pre>
        <code>{`"She said \\"hi\\""`}</code>
      </pre>
      <p>
        Without the backslashes, the parser would read <code>"She said "</code> as a complete string
        and then choke on the rest.
      </p>

      <h2>Characters you must escape</h2>
      <p>Two characters always require a backslash inside a string:</p>
      <ul>
        <li>
          <code>{`\\"`}</code> — a double quote
        </li>
        <li>
          <code>{`\\\\`}</code> — a backslash itself
        </li>
      </ul>
      <p>
        In addition, control characters (code points below U+0020) must be escaped — you can't put a
        raw newline or tab inside a JSON string.
      </p>

      <h2>The full escape list</h2>
      <ul>
        <li>
          <code>{`\\"`}</code> — double quote
        </li>
        <li>
          <code>{`\\\\`}</code> — backslash
        </li>
        <li>
          <code>{`\\/`}</code> — forward slash (optional)
        </li>
        <li>
          <code>{`\\b`}</code> — backspace
        </li>
        <li>
          <code>{`\\f`}</code> — form feed
        </li>
        <li>
          <code>{`\\n`}</code> — newline (line feed)
        </li>
        <li>
          <code>{`\\r`}</code> — carriage return
        </li>
        <li>
          <code>{`\\t`}</code> — tab
        </li>
        <li>
          <code>{`\\uXXXX`}</code> — any Unicode character by its four-digit hex code point
        </li>
      </ul>

      <h2>Unicode and non-ASCII text</h2>
      <p>
        JSON is Unicode. You can write accented and non-Latin characters directly in a UTF-8 file:
      </p>
      <pre>
        <code>{`{ "greeting": "café — 你好" }`}</code>
      </pre>
      <p>
        Or, if you need pure ASCII output, escape them with <code>{`\\u`}</code> sequences —{" "}
        <code>{`"caf\\u00e9"`}</code> is the same string as <code>"café"</code>. Characters outside
        the Basic Multilingual Plane (like many emoji) are written as a{" "}
        <strong>surrogate pair</strong> of two <code>{`\\u`}</code> escapes.
      </p>

      <h2>A common trap: double-encoding</h2>
      <p>
        When you embed JSON <em>inside</em> another JSON string (for example, a payload stored as a
        string field), every backslash and quote gets escaped again, producing thickets like{" "}
        <code>{`"{\\"name\\":\\"Ada\\"}"`}</code>. That's valid — it's a string whose contents
        happen to be JSON — but you must parse it twice. If a document looks like it's drowning in
        backslashes, this is usually why.
      </p>

      <h2>Checking escapes</h2>
      <p>
        The fastest way to confirm your escaping is correct is to parse the document. Paste it into
        the <Link to="/json-viewer">JSON Viewer &amp; Formatter</Link> — if an escape is wrong, it's
        flagged inline with the location; if it's right, the string renders as intended. For the
        broader grammar, see <Link to="/guides/json-syntax-explained">JSON syntax explained</Link>.
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

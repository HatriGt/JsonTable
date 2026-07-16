import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/json-syntax-explained";
const PUBLISHED = "2026-07-16";

const FAQS = [
  {
    q: "What are the data types in JSON?",
    a: "JSON has six types: string, number, boolean (true/false), null, object, and array. There is no date, integer-vs-float distinction, or undefined type.",
  },
  {
    q: "Can JSON have comments?",
    a: "No. Standard JSON does not allow comments. If you need comments in a config file, look at JSON5 or JSONC — but strict JSON parsers will reject them.",
  },
  {
    q: "Are trailing commas allowed in JSON?",
    a: "No. A comma after the last element of an object or array makes the JSON invalid. This is one of the most common syntax errors.",
  },
  {
    q: "Do JSON keys have to be in double quotes?",
    a: "Yes. Object keys must be double-quoted strings. Unquoted keys and single-quoted keys are both invalid JSON.",
  },
] as const;

export const Route = createFileRoute("/guides/json-syntax-explained")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "JSON Syntax Explained — Types, Rules & Common Errors | JSON‑Table",
      description:
        "A clear reference for JSON syntax: the six data types, object and array rules, valid strings and numbers, and the mistakes that make JSON invalid. With examples.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "JSON Syntax Explained", path: PATH },
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
        { label: "JSON Syntax Explained", href: PATH },
      ]}
      eyebrow="Reference"
      title="JSON syntax explained"
      intro="JSON has a small, strict grammar — six data types and a handful of rules. Knowing them makes it obvious why a document is invalid and how to fix it. This is the complete set, with examples."
      updated="July 2026"
      readingTime="5 min read"
      related={[
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Validate and beautify JSON with inline error locations.",
        },
        {
          href: "/json-to-table",
          label: "JSON to Table",
          desc: "Turn an array of objects into a sortable grid.",
        },
        {
          href: "/json-diff",
          label: "JSON Diff",
          desc: "Compare two JSON documents and see what changed.",
        },
      ]}
    >
      <h2>What JSON is</h2>
      <p>
        JSON (JavaScript Object Notation) is a text format for structured data. A JSON document is a
        single <strong>value</strong> — most often an object or an array, but it can also be a bare
        string, number, boolean, or <code>null</code>. Its grammar is deliberately tiny, which is
        why nearly every language can parse it.
      </p>

      <h2>The six data types</h2>
      <h3>String</h3>
      <p>
        Text wrapped in <strong>double quotes</strong>. Single quotes are not allowed. Special
        characters are escaped with a backslash — <code>\n</code>, <code>\t</code>, <code>\"</code>,
        and <code>\\</code>, plus <code>\uXXXX</code> for arbitrary Unicode.
      </p>
      <pre>
        <code>{`"hello"
"line one\\nline two"
"她说 \\"hi\\""`}</code>
      </pre>
      <h3>Number</h3>
      <p>
        A decimal number, optionally negative, with an optional fraction and exponent. There is{" "}
        <strong>no</strong> separate integer type, no leading <code>+</code>, no leading zeros, and
        no <code>NaN</code> or <code>Infinity</code>.
      </p>
      <pre>
        <code>{`42      -3.14      6.022e23      0.5`}</code>
      </pre>
      <h3>Boolean</h3>
      <p>
        Exactly <code>true</code> or <code>false</code>, lowercase and unquoted.
      </p>
      <h3>Null</h3>
      <p>
        The literal <code>null</code>, representing "no value." JSON has no <code>undefined</code>.
      </p>
      <h3>Object</h3>
      <p>
        An unordered set of <strong>key/value pairs</strong> inside <code>{`{ }`}</code>. Keys must
        be double-quoted strings; values can be any JSON type. Pairs are separated by commas and
        keys from values by a colon.
      </p>
      <pre>
        <code>{`{
  "name": "Ada",
  "age": 36,
  "admin": true,
  "team": null
}`}</code>
      </pre>
      <h3>Array</h3>
      <p>
        An ordered list of values inside <code>[ ]</code>, separated by commas. Values can be of
        mixed types, including nested objects and arrays.
      </p>
      <pre>
        <code>{`[1, "two", true, null, { "nested": [] }]`}</code>
      </pre>

      <h2>The rules that trip people up</h2>
      <ul>
        <li>
          <strong>No trailing commas.</strong> <code>{`[1, 2, 3,]`}</code> and{" "}
          <code>{`{"a": 1,}`}</code> are both invalid.
        </li>
        <li>
          <strong>Double quotes only.</strong> Both keys and string values must use <code>"</code>,
          never <code>'</code>.
        </li>
        <li>
          <strong>Keys must be quoted.</strong> <code>{`{name: "Ada"}`}</code> is invalid; it must
          be <code>{`{"name": "Ada"}`}</code>.
        </li>
        <li>
          <strong>No comments.</strong> <code>//</code> and <code>/* */</code> are not part of JSON.
        </li>
        <li>
          <strong>
            No functions, dates, or <code>undefined</code>.
          </strong>{" "}
          Dates are usually stored as ISO strings like <code>"2026-07-16"</code>.
        </li>
        <li>
          <strong>One root value.</strong> A document is a single value; you can't place two objects
          side by side without wrapping them in an array.
        </li>
      </ul>

      <h2>Valid vs. invalid, side by side</h2>
      <pre>
        <code>{`// ❌ invalid
{
  name: 'Ada',      // unquoted key, single quotes
  "roles": ["a",],  // trailing comma
}

// ✅ valid
{
  "name": "Ada",
  "roles": ["a"]
}`}</code>
      </pre>

      <h2>Checking your JSON</h2>
      <p>
        The quickest way to catch a syntax error is to run the document through a validator that
        points to the exact line and column of the first problem. Paste it into the{" "}
        <Link to="/json-viewer">JSON Viewer &amp; Formatter</Link> — valid JSON formats and renders
        as a tree, and invalid JSON is flagged inline with the location so you can fix it fast. To
        understand a specific document's structure, seeing it as a{" "}
        <Link to="/json-to-table">table</Link> or a tree often helps more than reading the raw text.
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

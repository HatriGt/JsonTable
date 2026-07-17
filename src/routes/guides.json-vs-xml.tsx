import { createFileRoute, Link } from "@tanstack/react-router";
import { ArticleShell } from "@/components/content/ArticleShell";
import { seoArticleHead } from "@/lib/seo/article-head";

const PATH = "/guides/json-vs-xml";
const PUBLISHED = "2026-07-17";

const FAQS = [
  {
    q: "What is the main difference between JSON and XML?",
    a: "JSON encodes data as key/value pairs, arrays, and primitives with a lightweight syntax. XML is a markup language that wraps data in named tags and supports attributes, namespaces, and schemas. JSON is more compact; XML is more expressive for documents.",
  },
  {
    q: "Is JSON faster than XML?",
    a: "Generally yes for typical web payloads: JSON is smaller and parses faster in browsers via the native JSON parser. XML parsing is heavier, though the gap depends on the data and tooling.",
  },
  {
    q: "Why did JSON replace XML for most web APIs?",
    a: "JSON maps directly to the data structures of modern languages, is less verbose, and is parsed natively in the browser. That made it the natural fit for JavaScript-driven web APIs.",
  },
  {
    q: "Does JSON support comments and attributes like XML?",
    a: "No. JSON has no comments and no attribute concept — everything is a value. XML supports comments, attributes, namespaces, and schema validation out of the box.",
  },
] as const;

export const Route = createFileRoute("/guides/json-vs-xml")({
  head: () =>
    seoArticleHead({
      path: PATH,
      title: "JSON vs XML: Differences & When to Use Each | JSON‑Table",
      description:
        "Compare JSON and XML on syntax, size, data types, and tooling — and understand why JSON became the default format for web APIs. With side-by-side examples.",
      datePublished: PUBLISHED,
      breadcrumbs: [
        { name: "Guides", path: "/guides" },
        { name: "JSON vs XML", path: PATH },
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
        { label: "JSON vs XML", href: PATH },
      ]}
      eyebrow="Comparison"
      title="JSON vs XML: which should you use?"
      intro="JSON and XML both represent structured data as text, but they come from different worlds — one a lightweight data format, the other a full markup language. Here's how they differ and why JSON won the web API era."
      updated="July 2026"
      readingTime="4 min read"
      related={[
        {
          href: "/json-viewer",
          label: "JSON Viewer & Formatter",
          desc: "Explore, beautify, and validate JSON in your browser.",
        },
        {
          href: "/json-to-table",
          label: "JSON to Table",
          desc: "View an array of JSON objects as a sortable grid.",
        },
        {
          href: "/workspace",
          label: "Open the workspace",
          desc: "Tree plus a fast, filterable grid for large JSON.",
        },
      ]}
    >
      <h2>The same data, two formats</h2>
      <p>Here's a small record in both formats. First XML:</p>
      <pre>
        <code>{`<user>
  <id>1</id>
  <name>Ada</name>
  <roles>
    <role>admin</role>
    <role>editor</role>
  </roles>
</user>`}</code>
      </pre>
      <p>And the same thing in JSON:</p>
      <pre>
        <code>{`{
  "id": 1,
  "name": "Ada",
  "roles": ["admin", "editor"]
}`}</code>
      </pre>
      <p>
        JSON expresses the list and the number directly; XML wraps everything in named tags and
        treats all content as text. That difference drives everything below.
      </p>

      <h2>How they compare</h2>
      <h3>Verbosity and size</h3>
      <p>
        XML repeats each field name in an opening and closing tag, so it's noticeably larger than
        the equivalent JSON. For chatty APIs that adds up.
      </p>
      <h3>Data types</h3>
      <p>
        JSON has native numbers, booleans, null, arrays, and objects. In XML everything is text
        unless a separate schema (XSD) assigns types, so consumers must interpret values themselves.
      </p>
      <h3>Expressiveness</h3>
      <p>
        XML offers features JSON deliberately lacks: attributes, namespaces, comments, mixed
        content, and rich schema validation. For document markup and complex enterprise contracts,
        that power is useful.
      </p>
      <h3>Tooling and parsing</h3>
      <p>
        Browsers parse JSON natively and it maps straight onto language data structures. XML has
        mature tooling too (XPath, XSLT, XSD), but it's heavier to work with in a typical web app.
      </p>

      <h2>When to use each</h2>
      <ul>
        <li>
          <strong>Use JSON</strong> for web and mobile APIs, configuration, and anywhere data maps
          cleanly to objects and arrays.
        </li>
        <li>
          <strong>Use XML</strong> for document-centric formats, systems that require namespaces or
          schema validation, and legacy or enterprise integrations that expect it.
        </li>
      </ul>

      <h2>Why JSON became the default</h2>
      <p>
        As the web shifted to JavaScript-heavy front ends, a format that the browser could parse
        natively and that matched JavaScript's own objects had an obvious edge. JSON was smaller,
        simpler, and required no extra libraries — so it steadily replaced XML for most public APIs.
        If you're working with JSON now, you can <Link to="/json-viewer">view and validate it</Link>
        , turn array data into a <Link to="/json-to-table">table</Link>, or explore large documents
        in the <Link to="/workspace">workspace</Link>.
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

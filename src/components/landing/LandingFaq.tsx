import { FadeIn } from "@/components/motion/FadeIn";

/** Answer-first Q&A. Kept in sync with the FAQPage JSON-LD in routes/index.tsx —
 *  if you edit a question or answer here, update the schema there too. */
export const FAQ_ITEMS = [
  {
    q: "Is my JSON data uploaded anywhere?",
    a: "No. JSON‑Table runs entirely in your browser — files never leave your machine. There are no uploads and no accounts.",
  },
  {
    q: "What is the maximum file size?",
    a: "You can paste, drop, or open JSON files up to 10 MB. Large files are parsed off the main thread so the interface stays responsive.",
  },
  {
    q: "Is JSON‑Table free?",
    a: "Yes, it is completely free to use and requires no sign-up.",
  },
  {
    q: "Can I edit JSON, not just view it?",
    a: "Yes. Edit values inline in the grid or directly in the source editor, and changes stay in sync across the tree, grid, and source views.",
  },
  {
    q: "Which browsers are supported?",
    a: "Any modern browser — Chrome, Edge, Firefox, or Safari. It is a client-side web app with nothing to install.",
  },
  {
    q: "How do I view JSON as a tree?",
    a: "Open the JSON Viewer & Formatter, paste your JSON, and it renders as a collapsible, color-coded tree. Expand and collapse nodes to explore deeply nested objects and arrays, or open it in the workspace for a virtualized tree plus a filterable grid built for very large documents.",
  },
  {
    q: "How do I format, beautify, or minify JSON?",
    a: "The JSON Formatter beautifies your JSON with clean 2-space indentation and color-coded syntax highlighting, or minifies it to a single compact line. Invalid JSON is flagged inline with the exact line and column so you can fix it fast.",
  },
  {
    q: "How do I convert JSON to a table?",
    a: "Paste an array of objects into JSON to Table and the keys become sortable columns automatically. Filter per column, reorder columns by dragging, and edit cells inline — no conversion step and no upload.",
  },
  {
    q: "How do I compare two JSON files?",
    a: "Use JSON Diff to compare two documents side by side. It highlights exactly what was added, removed, or changed by path, so you can spot differences between API responses, config files, or versions at a glance.",
  },
] as const;

export function LandingFaq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="border-t border-border/60 bg-card/30"
    >
      <div className="mx-auto max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
        <FadeIn inView>
          <h2
            id="faq-heading"
            className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Frequently asked questions
          </h2>
        </FadeIn>

        <FadeIn inView>
          <div className="mt-8 divide-y divide-border/70 overflow-hidden rounded-xl border border-border/70 sm:mt-10">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group bg-card">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium text-foreground transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--grid-row-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50 sm:px-6">
                  <h3 className="text-[15px] font-medium">{item.q}</h3>
                  <span
                    aria-hidden="true"
                    className="text-muted-foreground transition-transform duration-[var(--motion-duration-fast)] group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

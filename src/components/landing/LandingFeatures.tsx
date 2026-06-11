import { FadeIn } from "@/components/motion/FadeIn";

const CAPABILITIES = [
  {
    label: "tree",
    title: "Navigate nested keys",
    body: "Search the document tree and jump to any node without losing context.",
  },
  {
    label: "grid",
    title: "Filter like a spreadsheet",
    body: "Per-column filters, sort, and inline edit on tabular views of arrays and objects.",
  },
  {
    label: "search",
    title: "Find anything fast",
    body: "Global search across keys and values with keyboard shortcuts built for flow.",
  },
  {
    label: "local",
    title: "Stays on your machine",
    body: "Paste, drop, or open files up to 10 MB. No uploads, no accounts.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="features" className="border-t border-border/60 bg-card/30">
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-16">
        <FadeIn inView>
          <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Built for inspection, not pretty-printing
          </h2>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            The same workspace you see in the demo — tree on the left, grid on the right, shortcuts
            everywhere.
          </p>
        </FadeIn>

        <dl className="mt-10 divide-y divide-border/70">
          {CAPABILITIES.map((item, index) => (
            <FadeIn key={item.label} inView delay={index * 0.04}>
              <div className="grid gap-2 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6 sm:py-6">
                <dt className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-brand">
                  {item.label}
                </dt>
                <dd>
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </dd>
              </div>
            </FadeIn>
          ))}
        </dl>
      </div>
    </section>
  );
}

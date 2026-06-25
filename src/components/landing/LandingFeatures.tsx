import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

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
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <FadeIn inView>
          <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Built for inspection, not pretty-printing
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            The same workspace you see in the demo: a tree on the left, a grid on the right, and
            shortcuts everywhere.
          </p>
        </FadeIn>

        <Stagger
          inView
          className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border/70 bg-border/60 sm:mt-12 sm:grid-cols-2"
        >
          {CAPABILITIES.map((item) => (
            <StaggerItem key={item.label} className="bg-card">
              <div className="h-full p-6 transition-colors duration-[var(--motion-duration-fast)] hover:bg-[var(--grid-row-hover)] sm:p-8">
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
                  {item.label}
                </span>
                <h3 className="mt-4 text-base font-medium text-foreground">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

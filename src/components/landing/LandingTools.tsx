import { ArrowRight, GitCompare, ListTree, Table2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const TOOLS = [
  {
    href: "/json-viewer",
    icon: ListTree,
    title: "JSON Viewer & Formatter",
    body: "Explore JSON as a collapsible tree, or beautify, minify, and validate it.",
    badge: null,
  },
  {
    href: "/json-to-table",
    icon: Table2,
    title: "JSON to Table",
    body: "Turn arrays of objects into a sortable, filterable spreadsheet grid.",
    badge: null,
  },
  {
    href: "/json-diff",
    icon: GitCompare,
    title: "JSON Diff",
    body: "Compare two documents and see exactly what was added, removed, or changed.",
    badge: "New",
  },
] as const;

export function LandingTools() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="glass-panel mx-auto max-w-6xl rounded-3xl px-6 py-12 sm:px-10 sm:py-14">
        <FadeIn inView>
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-brand">
            toolkit
          </span>
          <h2
            id="tools-heading"
            className="mt-4 max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            Pick a tool, paste your JSON
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Focused tools that share one local-first engine — nothing is uploaded, no account
            needed.
          </p>
        </FadeIn>

        <Stagger
          inView
          className="mt-10 divide-y divide-border/60 border-y border-border/60 sm:mt-12"
        >
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <StaggerItem key={tool.href}>
                <a
                  href={tool.href}
                  className="group flex items-center gap-4 py-5 transition-colors duration-[var(--motion-duration-fast)] sm:gap-6 sm:py-6"
                >
                  <Icon
                    className="h-5 w-5 shrink-0 text-muted-foreground transition-colors duration-[var(--motion-duration-fast)] group-hover:text-brand"
                    strokeWidth={1.75}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <h3 className="text-[15px] font-medium text-foreground sm:text-base">
                        {tool.title}
                      </h3>
                      {tool.badge && (
                        <span className="rounded-full bg-brand/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-brand">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {tool.body}
                    </p>
                  </div>

                  <span className="hidden shrink-0 font-mono text-xs text-muted-foreground/50 transition-colors duration-[var(--motion-duration-fast)] group-hover:text-muted-foreground md:block">
                    {tool.href}
                  </span>

                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5 group-hover:text-brand" />
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

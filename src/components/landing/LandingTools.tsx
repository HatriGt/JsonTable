import { ArrowUpRight, GitCompare, ListTree, Table2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const TOOLS = [
  {
    href: "/json-viewer",
    icon: ListTree,
    title: "JSON Viewer & Formatter",
    body: "Tree view, beautify, minify, validate.",
    badge: null,
  },
  {
    href: "/json-to-table",
    icon: Table2,
    title: "JSON to Table",
    body: "Arrays of objects into a grid.",
    badge: null,
  },
  {
    href: "/json-diff",
    icon: GitCompare,
    title: "JSON Diff",
    body: "Compare and see what changed.",
    badge: "New",
  },
] as const;

export function LandingTools() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="relative">
      <div className="mx-auto max-w-6xl px-5 pb-4 pt-2 sm:px-6">
        <FadeIn inView>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              The toolkit
            </span>
            <span className="h-px flex-1 bg-gradient-to-r from-border/70 to-transparent" />
          </div>
          <h2
            id="tools-heading"
            className="mt-3 max-w-xl text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
          >
            Everything you need to work with JSON
          </h2>
        </FadeIn>

        <Stagger inView className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <StaggerItem key={tool.href}>
                <a
                  href={tool.href}
                  className="group relative flex h-full items-center gap-3.5 overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-[border-color,transform,box-shadow] duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-landing-demo"
                >
                  <Icon className="h-6 w-6 shrink-0 text-brand" strokeWidth={1.75} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[15px] font-semibold text-foreground">
                        {tool.title}
                      </span>
                      {tool.badge && (
                        <span className="rounded-full bg-brand/12 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand">
                          {tool.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">
                      {tool.body}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand" />
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

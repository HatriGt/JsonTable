import { AlignLeft, ArrowRight, GitCompare, ListTree, Table2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const TOOLS = [
  {
    href: "/json-viewer",
    icon: ListTree,
    title: "JSON Viewer",
    body: "Explore JSON as a collapsible tree and a filterable grid.",
    badge: null,
  },
  {
    href: "/json-formatter",
    icon: AlignLeft,
    title: "JSON Formatter",
    body: "Beautify, minify, and validate JSON with inline error locations.",
    badge: null,
  },
  {
    href: "/json-to-table",
    icon: Table2,
    title: "JSON to Table",
    body: "Turn arrays of objects into a sortable, filterable spreadsheet.",
    badge: null,
  },
  {
    href: "/json-diff",
    icon: GitCompare,
    title: "JSON Diff",
    body: "Compare two documents and see what changed, added, or removed by path.",
    badge: "New",
  },
] as const;

export function LandingTools() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
        <FadeIn inView>
          <h2
            id="tools-heading"
            className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            One workspace, a full JSON toolkit
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            View, format, convert, and compare — all local-first, all in your browser.
          </p>
        </FadeIn>

        <Stagger inView className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <StaggerItem key={tool.href}>
                <a
                  href={tool.href}
                  className="group flex h-full flex-col rounded-xl border border-border/70 bg-card p-5 transition-[border-color,transform,box-shadow] duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-landing-demo"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    {tool.badge && (
                      <span className="rounded-full bg-brand/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-foreground">{tool.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {tool.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand">
                    Open
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5" />
                  </span>
                </a>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

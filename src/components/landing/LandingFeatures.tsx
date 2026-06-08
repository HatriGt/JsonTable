import { ClipboardPaste, Filter, Search, Table2 } from "lucide-react";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

const FEATURES = [
  {
    icon: Table2,
    title: "Navigable tree",
    body: "Browse nested keys and values with search — jump to any node instantly.",
  },
  {
    icon: Filter,
    title: "Filterable grid",
    body: "Per-column filters, sort, and inline edit on nested spreadsheet tables.",
  },
  {
    icon: Search,
    title: "Global search",
    body: "Find any key or value across the document with ⌘F.",
  },
  {
    icon: ClipboardPaste,
    title: "Local-first",
    body: "Paste, drop, or open files — your data never leaves the browser.",
  },
] as const;

export function LandingFeatures() {
  return (
    <section id="features" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <FadeIn inView>
              <div className="h-full rounded-xl border border-border/80 bg-card/40 p-5 transition-[border-color,box-shadow] duration-[var(--motion-duration-normal)] hover:border-brand/25 hover:shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-sm font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </FadeIn>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

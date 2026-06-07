import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  Braces,
  ClipboardPaste,
  Code2,
  Filter,
  Github,
  Lock,
  Shield,
  Sparkles,
  Table2,
  Upload,
  Zap,
} from "lucide-react";
import { PreviewMock } from "./PreviewMock";
import { PasteDialog } from "@/components/input/PasteDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Landing() {
  const navigate = useNavigate();
  const [pasteOpen, setPasteOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main id="main-content">
        <Hero onOpenPaste={() => setPasteOpen(true)} />
        <TrustStrip />
        <FeatureGrid />
        <WorkflowSection />
        <CtaSection />
      </main>
      <Footer />
      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onLoaded={() => navigate({ to: "/workspace" })}
      />
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-[var(--motion-duration-normal)] ${
        scrolled
          ? "border-border bg-background/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-background/70 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex cursor-pointer items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/12 text-brand transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="cursor-pointer transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#workflow" className="cursor-pointer transition-colors hover:text-foreground">
            Workflow
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer noopener"
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </nav>
        <Button asChild size="sm" className="cursor-pointer gap-1.5">
          <Link to="/workspace">
            Open workspace
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}

function Hero({ onOpenPaste }: { onOpenPaste: () => void }) {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);

  async function loadSample() {
    await loadJson("sample.json", SAMPLE_JSON);
    navigate({ to: "/workspace" });
  }

  useEffect(() => {
    async function onKey(e: KeyboardEvent) {
      const isPaste = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p";
      if (!isPaste) return;
      e.preventDefault();
      try {
        const text = await navigator.clipboard.readText();
        if (!text?.trim()) {
          toast.message("Clipboard is empty", {
            description: "Copy some JSON and press ⌘P again.",
          });
          onOpenPaste();
          return;
        }
        const ok = await loadJson("clipboard.json", text);
        if (ok) {
          toast.success("JSON loaded from clipboard");
          navigate({ to: "/workspace" });
        } else {
          toast.error("That doesn't look like valid JSON");
          onOpenPaste();
        }
      } catch {
        onOpenPaste();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loadJson, navigate, onOpenPaste]);

  return (
    <section className="relative overflow-hidden border-b border-border/60 hero-mesh">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_top,_black_20%,_transparent_75%)]" />
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-24">
        <FadeIn>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1 bg-brand/10 text-brand hover:bg-brand/10">
              <Shield className="h-3 w-3" />
              Local-first
            </Badge>
            <Badge variant="outline" className="text-muted-foreground">
              No uploads · 10 MB ready
            </Badge>
          </div>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Paste JSON.{" "}
            <span className="text-gradient-brand">Explore it like a spreadsheet.</span>
          </h1>
          <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            A developer-focused viewer with syntax-highlighted source on the left
            and filterable nested tables on the right — find any value in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="cursor-pointer gap-2 glow-brand"
              onClick={onOpenPaste}
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="cursor-pointer gap-2"
              onClick={loadSample}
            >
              <Sparkles className="h-4 w-4 text-brand" />
              Try sample
            </Button>
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Upload className="h-3.5 w-3.5" />
            Drop a file anywhere · or press
            <kbd className="rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono">⌘P</kbd>
            to paste instantly
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="relative">
          <div className="overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-premium ring-1 ring-white/5">
            <PreviewMock compact />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function TrustStrip() {
  const items = ["REST APIs", "GraphQL", "Webhooks", "Logs", "Configs", "Postman"];
  return (
    <section className="border-b border-border/60 bg-muted/20">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-5 sm:px-6">
        <span className="text-xs font-medium text-muted-foreground">Built for</span>
        {items.map((i) => (
          <span key={i} className="text-xs font-medium text-foreground/70 transition-colors hover:text-foreground">
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Code2,
    title: "Syntax-highlighted source",
    body: "Foldable JSON with line numbers. Format or minify in one click.",
  },
  {
    icon: Table2,
    title: "Nested spreadsheet grid",
    body: "Arrays of objects become real tables with collapsible sections.",
  },
  {
    icon: Filter,
    title: "Column filters & sort",
    body: "Filter by value, condition, or sort in a focused modal dialog.",
  },
  {
    icon: Zap,
    title: "Fast & local",
    body: "Handles large payloads in-browser. Your data never leaves the device.",
  },
  {
    icon: Lock,
    title: "Recents in IndexedDB",
    body: "Pick up where you left off. Nothing syncs to a server.",
  },
  {
    icon: ClipboardPaste,
    title: "Instant paste workflow",
    body: "Drop, paste, or ⌘P from clipboard — straight into the workspace.",
  },
];

function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <FadeIn inView className="max-w-2xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Everything you need to read JSON quickly
        </h2>
        <p className="mt-3 text-muted-foreground">
          Designed for developers who live in API responses, logs, and config files.
        </p>
      </FadeIn>
      <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <div className="group h-full rounded-xl border border-border bg-card/50 p-6 transition-[border-color,box-shadow,transform] duration-[var(--motion-duration-normal)] hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand transition-transform duration-[var(--motion-duration-normal)] group-hover:scale-105">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function WorkflowSection() {
  const steps = [
    {
      n: "01",
      title: "Paste or drop",
      body: "JSON from clipboard, file, or sample — validated instantly.",
    },
    {
      n: "02",
      title: "Browse source & grid",
      body: "Two resizable panes mirror your document. Hide either from the toolbar and restore from the edge rail.",
    },
    {
      n: "03",
      title: "Filter & edit",
      body: "Sort columns, filter values, double-click cells to edit inline.",
    },
  ];

  return (
    <section id="workflow" className="border-y border-border/60 bg-muted/15 py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <FadeIn inView className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps. Zero friction.
          </h2>
          <p className="mt-3 text-muted-foreground">
            From raw JSON to the answer you need — without leaving the browser.
          </p>
        </FadeIn>
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem key={s.n}>
              <div className="rounded-xl surface-panel p-6">
                <span className="font-mono text-xs font-medium text-brand">{s.n}</span>
                <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <FadeIn inView delay={0.08} className="mt-10">
          <Button asChild size="lg" className="cursor-pointer gap-2">
            <Link to="/workspace">
              Launch workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <FadeIn inView>
        <div className="rounded-2xl border border-border bg-card/60 p-10 text-center sm:p-14">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to explore your JSON?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            No sign-up. No upload. Just paste and go.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="cursor-pointer gap-2 glow-brand">
              <Link to="/workspace">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="cursor-pointer">
              <Link to="/workspace">Browse empty workspace</Link>
            </Button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} JSON‑Table · Built for developers
    </footer>
  );
}

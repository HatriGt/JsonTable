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
  KeyRound,
  Lock,
  Search,
  Sparkles,
  Table2,
  Zap,
} from "lucide-react";
import { PreviewMock } from "./PreviewMock";
import { PasteDialog } from "@/components/input/PasteDialog";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function Landing() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Nav />
      <main id="main-content">
        <Hero />
        <LogoStrip />
        <FeatureGrid />
        <PreviewSection />
        <CtaSection />
      </main>
      <Footer />
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
      className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] backdrop-blur-xl ${
        scrolled
          ? "border-border/80 bg-background/85 shadow-sm shadow-black/5"
          : "border-transparent bg-background/60"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <Link to="/" className="group flex cursor-pointer items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/15 text-brand transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        <nav className="hidden items-center gap-7 text-[13px] text-muted-foreground md:flex">
          <a href="#features" className="cursor-pointer transition-colors duration-[var(--motion-duration-fast)] hover:text-foreground">
            Features
          </a>
          <a href="#preview" className="cursor-pointer transition-colors duration-[var(--motion-duration-fast)] hover:text-foreground">
            Preview
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex cursor-pointer items-center gap-1.5 transition-colors duration-[var(--motion-duration-fast)] hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" /> GitHub
          </a>
        </nav>
        <Link
          to="/app"
          className="group inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-[13px] font-medium text-background transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-foreground/90 active:scale-[0.98]"
        >
          Open app
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5" />
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);
  const [pasteOpen, setPasteOpen] = useState(false);

  async function loadSample() {
    await loadJson("sample.json", SAMPLE_JSON);
    navigate({ to: "/app" });
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
          setPasteOpen(true);
          return;
        }
        const ok = await loadJson("clipboard.json", text);
        if (ok) {
          toast.success("JSON loaded from clipboard");
          navigate({ to: "/app" });
        } else {
          toast.error("That doesn't look like valid JSON");
          setPasteOpen(true);
        }
      } catch {
        setPasteOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loadJson, navigate]);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_top,_black_30%,_transparent_70%)]" />
      <div className="absolute left-1/2 top-[-20%] -z-10 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px] animate-pulse-soft" />
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 md:pt-28">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-[11px] text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-brand" />
            Local‑first · 10 MB ready · Zero uploads
          </div>
          <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight md:text-7xl">
            Read JSON like a{" "}
            <span className="text-gradient-brand">spreadsheet</span>.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-base text-muted-foreground md:text-lg">
            JSON‑Table pairs a syntax‑highlighted source view with nested,
            filterable tables — so you can find the value you need in seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setPasteOpen(true)}
              className="group inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-primary-foreground glow-brand transition-[filter,transform] duration-[var(--motion-duration-normal)] hover:brightness-110 active:scale-[0.98]"
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
              <ArrowRight className="h-4 w-4 transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5" />
            </button>
            <button
              onClick={loadSample}
              className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-card active:scale-[0.98]"
            >
              <Sparkles className="h-4 w-4 text-brand" />
              Try sample
            </button>
            <Link
              to="/app"
              className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors duration-[var(--motion-duration-fast)] hover:text-foreground"
            >
              Open workspace →
            </Link>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[11px] text-muted-foreground">
            <span>Tip — press</span>
            <kbd className="rounded border border-border bg-card/60 px-1.5 py-0.5">⌘</kbd>
            <kbd className="rounded border border-border bg-card/60 px-1.5 py-0.5">P</kbd>
            <span>to paste &amp; open instantly</span>
          </div>
        </FadeIn>

        <FadeIn delay={0.12} className="relative mx-auto mt-16 max-w-6xl">
          <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-tr from-brand/30 via-transparent to-brand-2/30 blur-2xl" />
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/20 transition-shadow duration-[var(--motion-duration-slow)] hover:shadow-brand/10">
            <PreviewMock />
          </div>
        </FadeIn>
        <PasteDialog
          open={pasteOpen}
          onOpenChange={setPasteOpen}
          onLoaded={() => navigate({ to: "/app" })}
        />
      </div>
    </section>
  );
}

function LogoStrip() {
  const items = ["REST APIs", "GraphQL", "Webhooks", "Logs", "Configs", "Postman"];
  return (
    <section className="border-y border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-5 py-6 text-[12px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="text-foreground/60">Works great with</span>
        {items.map((i) => (
          <span key={i} className="transition-colors duration-[var(--motion-duration-fast)] hover:text-foreground">
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
    title: "JSON source view",
    body: "Syntax‑highlighted, foldable source with line numbers. Format or minify in one click.",
  },
  {
    icon: Table2,
    title: "Nested spreadsheet grid",
    body: "Arrays of objects become real tables with collapsible sections and column controls.",
  },
  {
    icon: Filter,
    title: "Per‑column filters",
    body: "Filter rows by any column — include/exclude, conditions, and sort in one popover.",
  },
  {
    icon: Search,
    title: "Instant paste",
    body: "Drop a file, paste JSON, or press ⌘P to load from clipboard and jump to the workspace.",
  },
  {
    icon: Zap,
    title: "Built for speed",
    body: "Handles large payloads locally without uploads. Your data never leaves the browser.",
  },
  {
    icon: Lock,
    title: "100% local",
    body: "Recents stay in IndexedDB on your device. Nothing is sent to a server, ever.",
  },
];

function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-24">
      <FadeIn inView className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Everything you wished JSON viewers had.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Designed for developers who live in API responses, logs and configs.
        </p>
      </FadeIn>
      <Stagger className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <StaggerItem key={f.title}>
            <div className="group relative h-full bg-card/60 p-7 transition-[background-color,transform] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] hover:-translate-y-0.5 hover:bg-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand transition-transform duration-[var(--motion-duration-normal)] group-hover:scale-110">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold tracking-tight">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function PreviewSection() {
  return (
    <section id="preview" className="relative border-t border-border/60 bg-card/20 py-24">
      <div className="mx-auto max-w-7xl px-5">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <FadeIn inView>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-muted-foreground">
              <KeyRound className="h-3 w-3" /> Live preview
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              Two panes.{" "}
              <span className="text-gradient-brand">Zero friction.</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              Formatted JSON on the left mirrors your document. The grid on the
              right renders nested arrays as real tables — filterable,
              collapsible, and fast.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm">
              {[
                "Collapse either pane to focus on what matters",
                "Drag the divider to resize, use rail buttons to restore",
                "Filter any column with sort, conditions, and value pickers",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2 text-foreground/90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              to="/app"
              className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-[background-color,transform] duration-[var(--motion-duration-normal)] hover:bg-foreground/90 active:scale-[0.98]"
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
          </FadeIn>
          <FadeIn inView delay={0.08}>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-br from-brand-2/25 via-brand/20 to-transparent blur-2xl" />
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl transition-shadow duration-[var(--motion-duration-slow)] hover:shadow-brand/10">
                <PreviewMock compact />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24">
      <FadeIn inView>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card/60 p-12 text-center">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-brand/15 via-transparent to-brand-2/15" />
          <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
            Ready to read JSON, fast?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            No sign‑up. No upload. Just paste your JSON and go.
          </p>
          <Link
            to="/app"
            className="mt-7 inline-flex cursor-pointer items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-primary-foreground glow-brand transition-[filter,transform] duration-[var(--motion-duration-normal)] hover:brightness-110 active:scale-[0.98]"
          >
            Launch workspace <ArrowRight className="h-4 w-4" />
          </Link>
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

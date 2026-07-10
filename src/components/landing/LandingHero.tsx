import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { ArrowRight, ChevronDown, ClipboardPaste, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";
import { useOpenSampleWorkspace } from "@/lib/workspace/use-open-sample";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

type Props = {
  onOpenPasteDialog: () => void;
};

export function LandingHero({ onOpenPasteDialog }: Props) {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);

  const pasteAndOpen = useCallback(() => {
    void pasteFromClipboard({
      loadJson,
      onOpenDialog: onOpenPasteDialog,
      onStart: () => navigate({ to: "/workspace" }),
    });
  }, [loadJson, navigate, onOpenPasteDialog]);

  // Loads the sample into the store first, then navigates, so the workspace
  // mounts with the document already present (no empty-state flash).
  const openSample = useOpenSampleWorkspace();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const key = e.key.toLowerCase();
      const isPasteShortcut = (e.metaKey || e.ctrlKey) && (key === "v" || key === "p");
      if (!isPasteShortcut) return;
      e.preventDefault();
      pasteAndOpen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pasteAndOpen]);

  return (
    <section className="relative flex min-h-[82vh] flex-col items-center px-5 pt-[15vh] text-center sm:px-6">
      {/* Soft glow lifts the headline off the busy sky without a hard box. */}
      <div
        className="hero-glow pointer-events-none absolute inset-x-0 top-0 h-[62%]"
        aria-hidden="true"
      />

      <Stagger className="relative max-w-3xl">
        <StaggerItem>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand [text-shadow:0_1px_10px_rgb(255_255_255/0.8)] dark:[text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">
            Local-first JSON viewer
          </p>
        </StaggerItem>

        <StaggerItem>
          <h1 className="mt-6 text-balance text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.03em] text-foreground [text-shadow:0_2px_24px_rgb(255_255_255/0.75)] sm:text-6xl lg:text-7xl dark:[text-shadow:0_2px_28px_rgb(0_0_0/0.6)]">
            Read JSON like a <span className="text-brand">spreadsheet</span>
          </h1>
        </StaggerItem>

        <StaggerItem>
          <p className="mx-auto mt-6 max-w-[36rem] text-pretty text-base leading-relaxed text-foreground/80 [text-shadow:0_1px_14px_rgb(255_255_255/0.85)] sm:text-lg dark:text-foreground/75 dark:[text-shadow:0_1px_16px_rgb(0_0_0/0.7)]">
            Nested payloads become a navigable tree and a filterable grid. Find any value in
            seconds, not scroll-minutes.
          </p>
        </StaggerItem>

        <StaggerItem>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              size="lg"
              className="h-12 cursor-pointer gap-2 px-6 text-[15px] shadow-lg shadow-brand/20 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              onClick={pasteAndOpen}
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 cursor-pointer gap-2 border-white/60 bg-white/70 px-6 text-[15px] backdrop-blur-sm transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] dark:border-white/15 dark:bg-white/10"
              onClick={() => void openSample()}
            >
              <Sparkles className="h-4 w-4 text-brand" />
              Try a sample
            </Button>
          </div>
        </StaggerItem>
      </Stagger>

      <a
        href="#demo-heading"
        aria-label="See the workspace"
        className="group absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-foreground/60 transition-colors hover:text-foreground sm:flex"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.18em]">Scroll</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { ArrowRight, ClipboardPaste, Sparkles } from "lucide-react";
import { PreviewMock } from "./PreviewMock";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";
import { FadeIn } from "@/components/motion/FadeIn";

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
    <section className="relative overflow-hidden">
      <div
        className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 pb-4 pt-12 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 lg:pb-8 lg:pt-20">
        {/* Left: copy */}
        <FadeIn className="text-center lg:text-left">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Local-first JSON viewer
          </p>

          <h1 className="mt-5 text-balance text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.5rem]">
            Read JSON like a <span className="font-mono font-medium text-brand">spreadsheet</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[34rem] text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base lg:mx-0">
            Nested payloads become a navigable tree and a filterable grid. Find any value in
            seconds, not scroll-minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
            <Button size="lg" className="h-11 cursor-pointer gap-2 px-5" onClick={pasteAndOpen}>
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 cursor-pointer gap-2 px-5">
              <Link
                to="/workspace"
                onClick={() => sessionStorage.setItem("json-table:pending-sample", "1")}
              >
                <Sparkles className="h-4 w-4 text-brand" />
                Try a sample
              </Link>
            </Button>
          </div>
        </FadeIn>

        {/* Right: real component preview */}
        <FadeIn delay={0.1} className="relative w-full">
          <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-landing-demo">
            <PreviewMock />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

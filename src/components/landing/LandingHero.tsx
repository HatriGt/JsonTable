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
      <div className="landing-grid-layer-headline pointer-events-none absolute inset-x-0 top-0 h-[420px]" aria-hidden="true" />
      <div className="relative mx-auto flex max-w-[920px] flex-col items-center px-5 pb-0 pt-10 text-center sm:px-6 sm:pt-12 lg:pt-14">
        <FadeIn>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Local-first · nothing leaves your browser
          </p>

          <h1 className="mt-6 max-w-[720px] text-balance text-[2.5rem] font-semibold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.25rem]">
            Read JSON like a{" "}
            <span className="font-mono font-medium text-brand">spreadsheet</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[540px] text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Nested payloads become a tree and a filterable grid — find the value you need in
            seconds, not scroll-minutes.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
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
                Try sample
              </Link>
            </Button>
            <Link
              to="/workspace"
              className="inline-flex cursor-pointer items-center gap-1 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Open workspace
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
              ⌘V
            </kbd>{" "}
            from anywhere to paste and open
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="relative mt-10 w-full max-w-[880px] sm:mt-12">
          <div className="overflow-hidden rounded-xl bg-card shadow-landing-demo">
            <PreviewMock />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

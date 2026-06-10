import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect } from "react";
import { ArrowRight, ClipboardPaste, LayoutGrid, Sparkles } from "lucide-react";
import { PreviewMock } from "./PreviewMock";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/store/workspace";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";
import { SAMPLE_JSON } from "@/lib/json/sample";
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

  async function loadSample() {
    navigate({ to: "/workspace" });
    await loadJson("sample.json", SAMPLE_JSON);
  }

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
      <div className="relative mx-auto flex max-w-[920px] flex-col items-center px-5 pb-0 pt-14 text-center sm:px-6 sm:pt-16 lg:pt-20">
        <FadeIn>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/90 px-3.5 py-1.5 text-xs text-muted-foreground shadow-sm">
            <LayoutGrid className="h-3.5 w-3.5 text-info" />
            Local-first · 10 MB ready · Zero uploads
          </div>

          <h1 className="mt-7 max-w-[720px] text-balance text-[2.5rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-5xl lg:text-[3.25rem]">
            Read JSON like a <span className="text-gradient-spreadsheet">spreadsheet.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-[540px] text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            JSON-Table turns nested payloads into a navigable tree and a fast, filterable grid — so
            you can find the value you need in seconds.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            <Button
              size="lg"
              className="h-11 cursor-pointer gap-2 rounded-lg border-0 bg-[oklch(0.55_0.19_258)] px-5 text-white shadow-[0_1px_2px_oklch(0.55_0.19_258/0.4)] hover:bg-[oklch(0.5_0.19_258)]"
              onClick={pasteAndOpen}
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 cursor-pointer gap-2 rounded-lg border-border bg-background px-5 shadow-sm hover:bg-background"
              onClick={loadSample}
            >
              <Sparkles className="h-4 w-4 text-info" />
              Try sample
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
            Tip — press{" "}
            <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              ⌘
            </kbd>{" "}
            <kbd className="inline-flex min-w-[22px] items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              V
            </kbd>{" "}
            to paste &amp; open instantly
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="relative mt-10 w-full max-w-[880px] sm:mt-12">
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-landing-demo">
            <PreviewMock />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

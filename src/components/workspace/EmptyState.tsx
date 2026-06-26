import { useCallback, useEffect, useState } from "react";
import { m, useReducedMotion } from "@/lib/motion/framer";
import { AlertCircle, ArrowRight, ClipboardPaste, Sparkles, Upload } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasteDialog } from "@/components/input/PasteDialog";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { FadeIn } from "@/components/motion/FadeIn";
import { motionTransition } from "@/lib/motion/presets";
import { useModKey } from "@/lib/platform";
import { cn } from "@/lib/utils";

const FILE_INPUT_ID = "empty-state-file-input";

export function EmptyState() {
  const loadJson = useWorkspace((s) => s.loadJson);
  const error = useWorkspace((s) => s.error);
  const reducedMotion = useReducedMotion();
  const modKey = useModKey();
  const [over, setOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);

  const onDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) {
        const text = await file.text();
        await loadJson(file.name, text);
        return;
      }
      const txt = e.dataTransfer.getData("text");
      if (txt) await loadJson("dropped.json", txt);
    },
    [loadJson],
  );

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
      const t = e.clipboardData?.getData("text");
      if (t && (t.trim().startsWith("{") || t.trim().startsWith("["))) {
        await loadJson("pasted.json", t);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadJson]);

  return (
    <div
      className="relative flex flex-1 flex-col items-center justify-center overflow-auto px-4 py-12 sm:px-6 sm:py-16"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
      role="region"
      aria-label="Get started with JSON"
    >
      <FadeIn className="empty-state-shell relative w-full">
        <div className="flex flex-col items-center text-center">
          <div className="empty-state-mark" aria-hidden="true">
            <BrandLogo className="h-8 w-8" />
          </div>

          <h2
            id="empty-state-heading"
            className="mt-6 max-w-sm text-balance text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:text-2xl"
          >
            Open a <span className="font-mono font-medium text-brand">JSON</span> file
          </h2>
          <p className="mt-3 max-w-sm text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Drop a file, paste from clipboard, or load sample data to start exploring.
          </p>

          <m.div
            className="mt-8 w-full"
            animate={reducedMotion ? undefined : over ? { scale: 1.008 } : { scale: 1 }}
            transition={motionTransition.fast}
          >
            <div
              data-active={over}
              className={cn(
                "empty-state-drop-zone flex flex-col items-center gap-4 px-6 py-10 sm:px-8 sm:py-11",
                error && "empty-state-drop-zone-error",
              )}
              aria-hidden="true"
            >
              <div className="empty-state-icon" aria-hidden="true">
                {over ? <Upload className="h-5 w-5" /> : <Upload className="h-5 w-5 opacity-60" />}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {over ? "Release to open" : "Drop your file here"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">.json, .txt, or raw JSON text</p>
              </div>
            </div>
          </m.div>

          <div className="mt-6 flex w-full flex-col gap-4">
            <Button
              size="lg"
              onClick={() =>
                void pasteFromClipboard({
                  loadJson,
                  onOpenDialog: () => setPasteOpen(true),
                })
              }
              className="h-11 w-full cursor-pointer gap-2 rounded-lg bg-brand text-white shadow-sm hover:bg-brand/90"
              aria-label="Paste JSON from clipboard"
            >
              <ClipboardPaste className="h-4 w-4" aria-hidden="true" />
              Paste JSON
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-11 min-h-11 min-w-11 cursor-pointer gap-1.5 px-4 text-muted-foreground hover:text-foreground"
                onClick={() => document.getElementById(FILE_INPUT_ID)?.click()}
                aria-label="Open JSON file from disk"
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Open file
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-11 min-h-11 min-w-11 cursor-pointer gap-1.5 px-4 text-muted-foreground hover:text-foreground"
                onClick={() => loadJson("sample.json", SAMPLE_JSON)}
                aria-label="Load sample JSON document"
              >
                <Sparkles className="h-3.5 w-3.5 text-info" aria-hidden="true" />
                Try sample
              </Button>
            </div>

            <input
              id={FILE_INPUT_ID}
              type="file"
              accept=".json,application/json,.txt"
              className="hidden"
              aria-label="Open JSON file"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                await loadJson(f.name, await f.text());
                e.target.value = "";
              }}
            />
          </div>

          {error && (
            <Alert variant="destructive" className="mt-6 w-full text-left" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <AlertTitle>Invalid JSON</AlertTitle>
              <AlertDescription className="font-mono text-xs">
                {error.message} (line {error.line}, col {error.column})
              </AlertDescription>
            </Alert>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Tip: paste JSON anywhere with{" "}
            <kbd className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              {modKey}
            </kbd>{" "}
            <kbd className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm">
              V
            </kbd>
          </p>

          <p className="mt-3 text-[11px] text-muted-foreground/80">
            Files stay in your browser. Nothing is ever uploaded.
          </p>
        </div>
      </FadeIn>

      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}

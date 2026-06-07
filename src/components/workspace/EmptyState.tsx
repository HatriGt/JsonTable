import { useCallback, useEffect, useState } from "react";
import { m } from "@/lib/motion/framer";
import {
  Braces,
  ClipboardPaste,
  Upload,
  Sparkles,
  FileJson,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasteDialog } from "@/components/input/PasteDialog";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { formatBytes } from "@/lib/format";
import { FadeIn } from "@/components/motion/FadeIn";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { motionTransition } from "@/lib/motion/presets";
import {
  deleteRecent,
  listRecents,
  loadRecent,
  type RecentMeta,
} from "@/lib/storage/recents";
import { cn } from "@/lib/utils";

export function EmptyState() {
  const loadJson = useWorkspace((s) => s.loadJson);
  const error = useWorkspace((s) => s.error);
  const [over, setOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [recents, setRecents] = useState<RecentMeta[]>([]);

  const refreshRecents = useCallback(() => {
    listRecents().then(setRecents).catch(() => {});
  }, []);

  useEffect(() => {
    refreshRecents();
  }, [refreshRecents]);

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
    [loadJson]
  );

  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA"))
        return;
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
      className="relative flex flex-1 flex-col items-center justify-center overflow-auto p-8"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,_black_30%,_transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-brand/15 blur-[140px] animate-pulse-soft" />

      <FadeIn>
        <m.div
          animate={over ? { scale: 1.01 } : { scale: 1 }}
          transition={motionTransition.fast}
          className={cn(
            "relative mx-auto w-full max-w-2xl rounded-2xl border border-dashed p-10 text-center backdrop-blur transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-normal)]",
            over
              ? "border-brand bg-brand/5 shadow-lg shadow-brand/10"
              : "border-border/80 bg-card/40",
            error && "animate-shake border-destructive/50"
          )}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand transition-transform duration-[var(--motion-duration-normal)]">
            <Braces className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            Open a JSON document
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop a file, paste from clipboard, or start with a sample. Everything
            stays on your device.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button
              onClick={() => setPasteOpen(true)}
              className="cursor-pointer gap-2 transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
            >
              <ClipboardPaste className="h-4 w-4" />
              Paste JSON
            </Button>
            <Button
              variant="secondary"
              className="cursor-pointer gap-2 transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
              onClick={() => document.getElementById("hidden-file-input")?.click()}
            >
              <Upload className="h-4 w-4" />
              Open file
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer gap-2 transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
              onClick={() => loadJson("sample.json", SAMPLE_JSON)}
            >
              <Sparkles className="h-4 w-4" />
              Try sample
            </Button>
            <input
              id="hidden-file-input"
              type="file"
              accept=".json,application/json,.txt"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                await loadJson(f.name, await f.text());
                e.target.value = "";
                refreshRecents();
              }}
            />
          </div>
          {error && (
            <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive">
              {error.message} — line {error.line}, col {error.column}
            </p>
          )}
          <p className="mt-6 text-[11px] text-muted-foreground">
            Files stay in your browser. Nothing is ever uploaded.
          </p>
        </m.div>
      </FadeIn>

      {recents.length > 0 && (
        <div className="relative mt-8 w-full max-w-2xl">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Recent
            </h3>
          </div>
          <Stagger className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {recents.map((r) => (
              <StaggerItem key={r.id}>
                <div className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card/60 p-3 transition-[border-color,background-color,transform] duration-[var(--motion-duration-normal)] hover:-translate-y-0.5 hover:border-brand/40 hover:bg-card">
                  <button
                    type="button"
                    onClick={async () => {
                      const raw = await loadRecent(r.id);
                      if (raw) await loadJson(r.name, raw);
                    }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-left"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-brand/10 text-brand">
                      <FileJson className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{r.name}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatBytes(r.sizeBytes)} ·{" "}
                        {new Date(r.savedAt).toLocaleString()}
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await deleteRecent(r.id);
                      refreshRecents();
                    }}
                    className="cursor-pointer rounded p-1 text-muted-foreground opacity-0 transition-[opacity,background-color,color] duration-[var(--motion-duration-fast)] group-hover:opacity-100 hover:bg-accent hover:text-destructive"
                    title="Remove"
                    aria-label="Remove recent file"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      )}

      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { Braces, Upload, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasteDialog } from "./PasteDialog";
import { motion } from "framer-motion";

export function DropZone() {
  const loadJson = useWorkspace((s) => s.loadJson);
  const error = useWorkspace((s) => s.error);
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
      className="relative flex flex-1 items-center justify-center p-6"
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={onDrop}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`mx-auto w-full max-w-xl rounded-2xl border border-dashed p-12 text-center transition-colors ${
          over ? "border-brand bg-brand/5" : "border-border bg-card/40"
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand">
          <Braces className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">
          Drop JSON here or paste from clipboard
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Explore, search, and filter complex JSON like a spreadsheet.
        </p>
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button onClick={() => setPasteOpen(true)} className="gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Paste JSON
          </Button>
          <Button
            variant="secondary"
            className="gap-2"
            onClick={() => document.getElementById("hidden-file-input")?.click()}
          >
            <Upload className="h-4 w-4" />
            Open file
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
            }}
          />
        </div>
        {error && (
          <p className="mt-5 font-mono text-xs text-destructive">
            {error.message} — line {error.line}, col {error.column}
          </p>
        )}
        <p className="mt-6 text-[11px] text-muted-foreground">
          Files stay in your browser. Nothing is uploaded.
        </p>
      </motion.div>
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}
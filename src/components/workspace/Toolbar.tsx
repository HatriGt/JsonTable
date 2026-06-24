import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { m, AnimatePresence } from "@/lib/motion/framer";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatBytes } from "@/lib/format";
import { motionTransition } from "@/lib/motion/presets";
import { ClipboardPaste, Upload, Sun, Moon, Trash2, Braces } from "lucide-react";
import { PasteDialog } from "@/components/input/PasteDialog";
import { ShareButton } from "./ShareButton";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const doc = useWorkspace((s) => s.doc);
  const loadJson = useWorkspace((s) => s.loadJson);
  const reset = useWorkspace((s) => s.reset);
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const [pasteOpen, setPasteOpen] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await loadJson(file.name, text);
    e.target.value = "";
  }

  const nextTheme = theme === "dark" ? "light" : "dark";
  const ThemeIcon = theme === "dark" ? Moon : Sun;

  return (
    <div className="chrome-elevation relative z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-[var(--pane-header)] px-3">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/" className="group flex cursor-pointer items-center gap-2.5">
          <div className="brand-mark flex h-7 w-7 items-center justify-center rounded-lg ring-1 ring-white/15 transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="hidden text-[13px] font-semibold tracking-tight sm:inline">
            JSON‑Table
          </span>
        </Link>
        <AnimatePresence mode="wait">
          {doc && (
            <m.div
              key={doc.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={motionTransition.fast}
              className="ml-1 flex min-w-0 items-center gap-2"
            >
              <Separator orientation="vertical" className="hidden h-5 sm:block" />
              <span
                title={doc.name}
                className="flex min-w-0 items-center gap-1.5 rounded-md border border-border/60 bg-card/60 py-1 pl-2 pr-2.5"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                <span className="max-w-[160px] truncate font-mono text-[11px] sm:max-w-xs">
                  {doc.name}
                </span>
                <span className="hidden shrink-0 text-[10px] tabular-nums text-muted-foreground sm:inline">
                  {formatBytes(doc.sizeBytes)}
                </span>
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              void pasteFromClipboard({
                loadJson,
                onOpenDialog: () => setPasteOpen(true),
              })
            }
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Paste</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => fileRef.current?.click()}
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Open</span>
          </Button>
        </div>

        <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-background/50 p-0.5 backdrop-blur-sm">
          <ShareButton />
          {doc && (
            <Button
              size="sm"
              variant="ghost"
              onClick={reset}
              className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 cursor-pointer"
            onClick={(e) => setTheme(nextTheme, { x: e.clientX, y: e.clientY })}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,.txt"
        className="hidden"
        aria-label="Open JSON file"
        onChange={onFile}
      />
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}

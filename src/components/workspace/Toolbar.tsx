import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { m, AnimatePresence } from "@/lib/motion/framer";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/format";
import { motionTransition } from "@/lib/motion/presets";
import {
  ClipboardPaste,
  Upload,
  Sun,
  Moon,
  Monitor,
  Trash2,
  Braces,
} from "lucide-react";
import { PasteDialog } from "@/components/input/PasteDialog";

export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);
  const { doc, loadJson, reset } = useWorkspace();
  const { theme, setTheme } = useTheme();
  const [pasteOpen, setPasteOpen] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    await loadJson(file.name, text);
    e.target.value = "";
  }

  const nextTheme: "dark" | "light" | "system" =
    theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/60 px-3 backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to="/"
          className="group flex cursor-pointer items-center gap-2 transition-opacity duration-[var(--motion-duration-fast)] hover:opacity-90"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/15 text-brand transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        <AnimatePresence mode="wait">
          {doc && (
            <m.span
              key={doc.name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={motionTransition.fast}
              className="ml-3 truncate rounded-md border border-border/60 bg-background/50 px-2 py-0.5 font-mono text-xs text-muted-foreground"
            >
              {doc.name} · {formatBytes(doc.sizeBytes)}
            </m.span>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPasteOpen(true)}
          className="h-8 cursor-pointer gap-1.5 text-xs transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          className="h-8 cursor-pointer gap-1.5 text-xs transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
        >
          <Upload className="h-3.5 w-3.5" />
          Open
        </Button>
        {doc && (
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            className="h-8 cursor-pointer gap-1.5 text-xs text-muted-foreground transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 cursor-pointer transition-transform duration-[var(--motion-duration-fast)] active:scale-95"
          onClick={() => setTheme(nextTheme)}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json,.txt"
        className="hidden"
        onChange={onFile}
      />
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}

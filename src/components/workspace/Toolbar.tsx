import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { m, AnimatePresence } from "@/lib/motion/framer";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatBytes } from "@/lib/format";
import { motionTransition } from "@/lib/motion/presets";
import { ClipboardPaste, Upload, Sun, Moon, Monitor, Trash2, Braces } from "lucide-react";
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
    <div className="relative z-10 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border/80 bg-[var(--pane-header)]/90 px-3 shadow-[inset_0_1px_0_color-mix(in_oklab,var(--foreground)_4%,transparent)] backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to="/"
          className="group flex cursor-pointer items-center gap-2 transition-opacity duration-[var(--motion-duration-fast)] hover:opacity-90"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 bg-card text-info transition-transform duration-[var(--motion-duration-fast)] group-hover:scale-105">
            <Braces className="h-4 w-4" />
          </div>
          <span className="hidden text-sm font-semibold tracking-tight sm:inline">JSON‑Table</span>
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
              <Badge
                variant="secondary"
                className="max-w-[200px] truncate font-mono text-[11px] font-normal sm:max-w-xs"
              >
                {doc.name}
              </Badge>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {formatBytes(doc.sizeBytes)}
              </span>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPasteOpen(true)}
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
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 cursor-pointer"
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
        aria-label="Open JSON file"
        onChange={onFile}
      />
      <PasteDialog open={pasteOpen} onOpenChange={setPasteOpen} />
    </div>
  );
}

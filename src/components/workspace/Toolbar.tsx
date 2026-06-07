import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/store/theme";
import { Button } from "@/components/ui/button";
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
    <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-card/60 px-3 backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/15 text-brand">
            <Braces className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">JSON‑Table</span>
        </Link>
        {doc && (
          <span className="ml-3 truncate text-xs text-muted-foreground">
            {doc.name} · {formatBytes(doc.sizeBytes)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPasteOpen(true)}
          className="h-8 gap-1.5 text-xs"
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileRef.current?.click()}
          className="h-8 gap-1.5 text-xs"
        >
          <Upload className="h-3.5 w-3.5" />
          Open
        </Button>
        {doc && (
          <Button
            size="sm"
            variant="ghost"
            onClick={reset}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
        <div className="mx-1 h-5 w-px bg-border" />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
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

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
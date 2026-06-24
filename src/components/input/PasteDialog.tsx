import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/store/workspace";
import { Loader2 } from "lucide-react";

export function PasteDialog({
  open,
  onOpenChange,
  onBeforeLoad,
  onLoaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called before parsing begins (e.g. navigate away immediately). */
  onBeforeLoad?: () => void;
  onLoaded?: () => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const loadJson = useWorkspace((s) => s.loadJson);
  const clearError = useWorkspace((s) => s.clearError);
  const error = useWorkspace((s) => s.error);

  function handleOpenChange(next: boolean) {
    if (!next) {
      // reset the dialog when it closes
      setText("");
      setLoading(false);
    }
    onOpenChange(next);
  }

  async function handleLoad() {
    onBeforeLoad?.();
    setLoading(true);
    clearError();
    const ok = await loadJson("pasted.json", text);
    setLoading(false);
    if (ok) {
      setText("");
      onOpenChange(false);
      onLoaded?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Paste JSON</DialogTitle>
          <DialogDescription>
            Paste raw JSON below. It will be parsed locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 py-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='{ "hello": "world" }'
            className="h-72 resize-none border-border/80 bg-[var(--source-bg)] font-mono text-xs transition-[border-color,box-shadow] duration-[var(--motion-duration-fast)] focus-visible:ring-brand/30"
            autoFocus
            aria-invalid={!!error && !!text.trim()}
            aria-describedby={error ? "paste-error" : undefined}
          />
          {error && text.trim() && (
            <p
              id="paste-error"
              className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
              role="alert"
            >
              {error.message} — line {error.line}, col {error.column}
            </p>
          )}
        </div>
        <DialogFooter className="border-t border-border bg-muted/20 px-6 py-4">
          <Button
            variant="ghost"
            className="cursor-pointer"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLoad}
            disabled={!text.trim() || loading}
            className="cursor-pointer gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Load JSON
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

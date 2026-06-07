import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useWorkspace } from "@/store/workspace";

export function PasteDialog({
  open,
  onOpenChange,
  onLoaded,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onLoaded?: () => void;
}) {
  const [text, setText] = useState("");
  const loadJson = useWorkspace((s) => s.loadJson);

  async function handleLoad() {
    const ok = await loadJson("pasted.json", text);
    if (ok) {
      setText("");
      onOpenChange(false);
      onLoaded?.();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Paste JSON</DialogTitle>
        </DialogHeader>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='{ "hello": "world" }'
          className="h-72 resize-none font-mono text-xs"
          autoFocus
        />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleLoad} disabled={!text.trim()}>
            Load
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
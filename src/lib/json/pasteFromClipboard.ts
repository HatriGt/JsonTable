import { toast } from "sonner";

type PasteFromClipboardOptions = {
  loadJson: (name: string, text: string) => Promise<boolean>;
  onOpenDialog?: () => void;
  /** Called after clipboard read, before parsing begins (e.g. navigate away immediately). */
  onStart?: () => void;
  onSuccess?: () => void;
  fileName?: string;
};

export async function pasteFromClipboard({
  loadJson,
  onOpenDialog,
  onStart,
  onSuccess,
  fileName = "clipboard.json",
}: PasteFromClipboardOptions): Promise<void> {
  try {
    const text = await navigator.clipboard.readText();
    if (!text?.trim()) {
      toast.message("Clipboard is empty", {
        description: "Copy some JSON and try again.",
      });
      return;
    }
    onStart?.();
    const ok = await loadJson(fileName, text);
    if (ok) {
      toast.success("JSON loaded from clipboard");
      onSuccess?.();
    } else {
      toast.error("That doesn't look like valid JSON");
    }
  } catch {
    toast.error("Couldn't read clipboard", {
      description: "Allow clipboard access or paste manually.",
    });
    onOpenDialog?.();
  }
}

import { useCallback, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ClipboardPaste, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PasteDialog } from "@/components/input/PasteDialog";
import { useWorkspace } from "@/store/workspace";
import { SAMPLE_JSON } from "@/lib/json/sample";
import { pasteFromClipboard } from "@/lib/json/pasteFromClipboard";

/**
 * The primary "paste / try a sample" calls-to-action used on the SEO landing
 * pages. Mirrors the homepage hero: load into the store first, then navigate,
 * so the workspace mounts with the document already present.
 */
export function OpenWorkspaceButtons({ className }: { className?: string }) {
  const navigate = useNavigate();
  const loadJson = useWorkspace((s) => s.loadJson);
  const [pasteOpen, setPasteOpen] = useState(false);

  const pasteAndOpen = useCallback(() => {
    void pasteFromClipboard({
      loadJson,
      onOpenDialog: () => setPasteOpen(true),
      onStart: () => navigate({ to: "/workspace" }),
    });
  }, [loadJson, navigate]);

  const openSample = useCallback(async () => {
    await loadJson("sample.json", SAMPLE_JSON);
    navigate({ to: "/workspace" });
  }, [loadJson, navigate]);

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button
          size="lg"
          className="h-11 cursor-pointer gap-2 px-5 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          onClick={pasteAndOpen}
        >
          <ClipboardPaste className="h-4 w-4" />
          Paste JSON
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="h-11 cursor-pointer gap-2 px-5 transition-transform duration-[var(--motion-duration-fast)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          onClick={() => void openSample()}
        >
          <Sparkles className="h-4 w-4 text-brand" />
          Try a sample
        </Button>
      </div>
      <PasteDialog
        open={pasteOpen}
        onOpenChange={setPasteOpen}
        onBeforeLoad={() => navigate({ to: "/workspace" })}
      />
    </div>
  );
}

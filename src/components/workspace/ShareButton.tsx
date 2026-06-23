import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkspace } from "@/store/workspace";
import { buildShareUrl, SHARE_URL_WARN_BYTES } from "@/lib/share/share";

export function ShareButton() {
  const doc = useWorkspace((s) => s.doc);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Regenerate whenever the popover opens or the document changes underneath it.
  useEffect(() => {
    if (!open || !doc) return;
    let cancelled = false;
    setGenerating(true);
    setCopied(false);
    buildShareUrl(doc.name, doc.raw)
      .then((next) => {
        if (cancelled) return;
        setUrl(next);
        if (next.length > SHARE_URL_WARN_BYTES) {
          toast.warning("Large link", {
            description: "This JSON makes a very long URL that some apps may truncate.",
          });
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not create share link");
      })
      .finally(() => {
        if (!cancelled) setGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, doc]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — select the text so the user can copy manually.
      inputRef.current?.select();
      toast.error("Copy failed — select the link and copy manually");
    }
  }

  if (!doc) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 cursor-pointer gap-1.5 text-xs">
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-sm font-semibold">Share this JSON</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              The link contains the data itself — nothing is uploaded to a server.
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              readOnly
              value={generating ? "Generating link…" : url}
              onFocus={(e) => e.currentTarget.select()}
              className="h-8 font-mono text-xs"
              aria-label="Shareable link"
            />
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 shrink-0"
              onClick={copy}
              disabled={generating || !url}
              title="Copy link"
              aria-label="Copy link"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

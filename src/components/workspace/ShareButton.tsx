import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useWorkspace } from "@/store/workspace";
import {
  buildShareUrl,
  buildShortLinkUrl,
  downloadJson,
  exceedsServerLimit,
  needsServerShare,
  SHARE_URL_WARN_BYTES,
} from "@/lib/share/share";
import { createShortLink } from "@/lib/share/share.functions";

export function ShareButton() {
  const doc = useWorkspace((s) => s.doc);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isLarge = doc ? needsServerShare(doc.raw) : false;
  const tooLarge = doc ? exceedsServerLimit(doc.raw) : false;

  // Inline path only: auto-generate the in-URL link when the popover opens or
  // the document changes. The large path never uploads without an explicit click.
  useEffect(() => {
    if (!open || !doc) return;
    setCopied(false);
    setUrl("");
    if (isLarge) return;
    let cancelled = false;
    setGenerating(true);
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
  }, [open, doc, isLarge]);

  async function createLink() {
    if (!doc) return;
    setCreating(true);
    setCopied(false);
    try {
      const { id } = await createShortLink({ data: { name: doc.name, raw: doc.raw } });
      setUrl(buildShortLinkUrl(id));
    } catch {
      toast.error("Could not create short link");
    } finally {
      setCreating(false);
    }
  }

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

  function download() {
    if (!doc) return;
    downloadJson(doc.name, doc.raw);
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
              {isLarge
                ? tooLarge
                  ? "This file is too large to share as a link. Download it and send the file instead."
                  : "This file is too large for an inline link. Create a short link (uploads the JSON to a temporary store, expires in 30 days) or download it."
                : "The link contains the data itself — nothing is uploaded to a server."}
            </p>
          </div>

          {/* Inline link, or the short link once created */}
          {(!isLarge || url) && (
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
          )}

          {/* Create short link button (large, within cap, not yet created) */}
          {isLarge && !tooLarge && !url && (
            <Button
              size="sm"
              className="h-8 cursor-pointer gap-1.5 text-xs"
              onClick={createLink}
              disabled={creating}
            >
              <Link2 className="h-3.5 w-3.5" />
              {creating ? "Creating link…" : "Create short link"}
            </Button>
          )}

          {/* Download fallback, always available */}
          <Button
            size="sm"
            variant="outline"
            className="h-8 cursor-pointer gap-1.5 text-xs"
            onClick={download}
          >
            <Download className="h-3.5 w-3.5" />
            Download .json
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

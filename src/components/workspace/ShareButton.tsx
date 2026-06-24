import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Loader2, Share2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { m, AnimatePresence } from "@/lib/motion/framer";
import { motionTransition } from "@/lib/motion/presets";
import { useWorkspace } from "@/store/workspace";
import { loadPrefs, savePrefs } from "@/lib/storage/prefs";
import {
  buildShareUrl,
  buildShortLinkUrl,
  downloadJson,
  exceedsServerLimit,
  needsServerShare,
  SHARE_URL_WARN_BYTES,
} from "@/lib/share/share";
import { createShortLink } from "@/lib/share/share.functions";

const panelMotion = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: motionTransition.fast,
};

export function ShareButton() {
  const doc = useWorkspace((s) => s.doc);
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [generating, setGenerating] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [consent, setConsent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // The document a short link was last created for, so reopening the popover
  // doesn't upload a duplicate. Reset whenever the document changes.
  const linkedDoc = useRef<typeof doc>(null);

  const isLarge = doc ? needsServerShare(doc.raw) : false;
  const tooLarge = doc ? exceedsServerLimit(doc.raw) : false;

  // Seed consent from persisted prefs once on mount.
  useEffect(() => {
    setConsent(loadPrefs().shareUploadConsent);
  }, []);

  // A new/edited document invalidates any previously created short link.
  useEffect(() => {
    if (linkedDoc.current !== doc) {
      linkedDoc.current = null;
      setUrl("");
    }
  }, [doc]);

  async function createLink() {
    if (!doc) return;
    setCreating(true);
    setCopied(false);
    try {
      const { id } = await createShortLink({ data: { name: doc.name, raw: doc.raw } });
      linkedDoc.current = doc;
      setUrl(buildShortLinkUrl(id));
    } catch {
      toast.error("Could not create short link");
    } finally {
      setCreating(false);
    }
  }

  // Inline path: auto-generate the in-URL link when the popover opens.
  // Large path: auto-create the short link too, but only once consent is given
  // and only once per document (the linkedDoc guard prevents re-uploads).
  useEffect(() => {
    if (!open || !doc) return;
    setCopied(false);

    if (isLarge) {
      if (tooLarge || !consent) return;
      if (linkedDoc.current === doc) return; // already created for this doc
      void createLink();
      return;
    }

    setUrl("");
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
    // createLink is stable enough for this effect's intent; deps mirror the
    // inputs that should re-trigger link generation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, doc, isLarge, tooLarge, consent]);

  function giveConsent() {
    savePrefs({ shareUploadConsent: true });
    setConsent(true);
    void createLink();
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

  // Which view to show: the one-time consent gate, or the link/share content.
  const showConsentGate = isLarge && !tooLarge && !consent;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 cursor-pointer gap-1.5 text-xs">
          <Share2 className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Share</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {showConsentGate ? (
            <m.div key="consent" className="flex flex-col gap-3" {...panelMotion}>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Store this JSON to share it?</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This file is too large for an inline link. To share it, JSON&#8209;Table will
                    store the JSON on its server and give you a private link that expires in 30
                    days. We&apos;ll only ask this once.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="h-8 flex-1 cursor-pointer gap-1.5 text-xs"
                  onClick={giveConsent}
                >
                  Store &amp; create link
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 cursor-pointer gap-1.5 text-xs"
                  onClick={download}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
              </div>
            </m.div>
          ) : (
            <m.div key="share" className="flex flex-col gap-2" {...panelMotion}>
              <div>
                <p className="text-sm font-semibold">Share this JSON</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isLarge
                    ? tooLarge
                      ? "This file is too large to share as a link. Download it and send the file instead."
                      : "Stored on the server as a private link that expires in 30 days."
                    : "The link contains the data itself — nothing is uploaded to a server."}
                </p>
              </div>

              {/* Inline link, the short link, or a loading state while creating one */}
              {!tooLarge && (!isLarge || url || creating) && (
                <div className="flex items-center gap-1.5">
                  <Input
                    ref={inputRef}
                    readOnly
                    value={generating || creating ? "Generating link…" : url}
                    onFocus={(e) => e.currentTarget.select()}
                    className="h-8 font-mono text-xs"
                    aria-label="Shareable link"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 shrink-0"
                    onClick={copy}
                    disabled={generating || creating || !url}
                    title="Copy link"
                    aria-label="Copy link"
                  >
                    {creating ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : copied ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
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
            </m.div>
          )}
        </AnimatePresence>
      </PopoverContent>
    </Popover>
  );
}

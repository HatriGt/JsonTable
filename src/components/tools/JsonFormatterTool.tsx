import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlignLeft, Check, Copy, Minimize2, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseJson } from "@/lib/json/parse";
import { prettyPrint } from "@/lib/json/highlight";
import { cn } from "@/lib/utils";

const EXAMPLE =
  '{"name":"Acme","version":"2.0.0","tags":["api","json"],"limits":{"rps":500,"burst":50},"enabled":true}';

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const parsed = useMemo(() => parseJson(input), [input]);

  const output = useMemo(() => {
    if (!input.trim() || !parsed.ok) return "";
    return prettyPrint(parsed.value, 2);
  }, [input, parsed]);

  function format() {
    if (!parsed.ok) return;
    setInput(prettyPrint(parsed.value, 2));
  }
  function minify() {
    if (!parsed.ok) return;
    setInput(JSON.stringify(parsed.value));
  }
  function copy() {
    const text = output || input;
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        toast.success("Copied to clipboard");
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => toast.error("Copy failed"));
  }

  const showError = input.trim() !== "" && !parsed.ok;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-9 cursor-pointer gap-1.5 text-xs"
          onClick={format}
          disabled={!parsed.ok}
        >
          <AlignLeft className="h-3.5 w-3.5" />
          Format
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 cursor-pointer gap-1.5 text-xs"
          onClick={minify}
          disabled={!parsed.ok}
        >
          <Minimize2 className="h-3.5 w-3.5" />
          Minify
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 cursor-pointer gap-1.5 text-xs"
          onClick={copy}
          disabled={!input.trim()}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          Copy
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9 cursor-pointer gap-1.5 text-xs"
          onClick={() => setInput(EXAMPLE)}
        >
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          Load example
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-9 cursor-pointer gap-1.5 text-xs text-muted-foreground"
          onClick={() => setInput("")}
          disabled={!input.trim()}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Input</span>
            {showError && (
              <span className="text-[11px] font-medium text-destructive">
                {parsed.error.message} (line {parsed.error.line}, col {parsed.error.column})
              </span>
            )}
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste JSON here…"
            className={cn(
              "h-[420px] resize-y font-mono text-xs leading-relaxed",
              showError && "border-destructive/60",
            )}
            aria-label="JSON input"
          />
        </div>

        <div className="flex flex-col">
          <span className="mb-1.5 text-xs font-medium text-muted-foreground">
            {parsed.ok && input.trim() ? "Formatted output" : "Output"}
          </span>
          <div className="h-[420px] overflow-auto rounded-md border border-border bg-[var(--source-bg,var(--card))] p-3">
            {output ? (
              <pre className="font-mono text-xs leading-relaxed text-foreground">{output}</pre>
            ) : (
              <p className="px-1 py-2 text-xs text-muted-foreground">
                {showError
                  ? "Fix the error to see formatted output."
                  : "Formatted JSON will appear here."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseJson } from "@/lib/json/parse";
import { useOpenSampleWorkspace } from "@/lib/workspace/use-open-sample";
import { JsonTreeView } from "./JsonTreeView";
import { cn } from "@/lib/utils";

const EXAMPLE = JSON.stringify(
  {
    id: "usr_94821",
    active: true,
    profile: { firstName: "Alex", roles: ["admin", "editor"] },
    orders: [
      { id: "ord_001", total: 89.99, status: "shipped" },
      { id: "ord_002", total: 14.5, status: "processing" },
    ],
  },
  null,
  2,
);

export function JsonViewerTool() {
  const [input, setInput] = useState("");
  const parsed = useMemo(() => parseJson(input), [input]);
  const openSample = useOpenSampleWorkspace();
  const showError = input.trim() !== "" && !parsed.ok;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-center gap-2">
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
          variant="outline"
          className="h-9 cursor-pointer gap-1.5 text-xs"
          onClick={() => void openSample()}
        >
          Open in workspace
          <ArrowRight className="h-3.5 w-3.5" />
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
              "h-[440px] resize-y font-mono text-xs leading-relaxed",
              showError && "border-destructive/60",
            )}
            aria-label="JSON input"
          />
        </div>

        <div className="flex flex-col">
          <span className="mb-1.5 text-xs font-medium text-muted-foreground">Tree</span>
          <div className="h-[440px] overflow-auto rounded-md border border-border bg-card p-2">
            {input.trim() && parsed.ok ? (
              <JsonTreeView value={parsed.value} />
            ) : (
              <p className="px-2 py-2 text-xs text-muted-foreground">
                {showError
                  ? "Fix the error to see the tree."
                  : "An interactive tree will appear here."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

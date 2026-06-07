import { useMemo, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { prettyPrint, tokenizeLine, type Token } from "@/lib/json/highlight";
import { Copy, Minimize2, Maximize2, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function JsonSource() {
  const doc = useWorkspace((s) => s.doc);
  const [compact, setCompact] = useState(false);

  const text = useMemo(() => {
    if (!doc) return "";
    return compact ? JSON.stringify(doc.value) : prettyPrint(doc.value, 2);
  }, [doc, compact]);

  const lines = useMemo(() => text.split("\n"), [text]);

  // Compute fold ranges: for each opener line, the matching closer line.
  const folds = useMemo(() => computeFolds(text), [text]);
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

  // Lines hidden because they're inside a collapsed block.
  const hidden = useMemo(() => {
    const h = new Set<number>();
    for (const i of collapsed) {
      const end = folds.get(i);
      if (end === undefined) continue;
      for (let k = i + 1; k <= end; k++) h.add(k);
    }
    return h;
  }, [collapsed, folds]);

  function toggleFold(i: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  if (!doc) return null;

  return (
    <div className="flex h-full flex-col bg-[var(--source-bg)]">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="font-bold text-foreground">JSON</span>
          <span className="text-muted-foreground/70">·</span>
          <span className="inline-flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3 w-3" /> valid
          </span>
          <span className="text-muted-foreground/70">·</span>
          <span>{lines.length.toLocaleString()} lines</span>
        </div>
        <div className="flex items-center gap-0.5">
          <IconBtn
            title={compact ? "Format" : "Minify"}
            onClick={() => setCompact((c) => !c)}
          >
            {compact ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </IconBtn>
          <IconBtn
            title="Copy JSON"
            onClick={() => {
              navigator.clipboard.writeText(text);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
      <div className="relative flex-1 overflow-auto font-mono text-[12.5px] leading-[1.65]">
        <div className="py-3">
          {lines.map((line, i) => {
            if (hidden.has(i)) return null;
            const foldable = folds.has(i);
            const isCollapsed = collapsed.has(i);
            return (
              <div
                key={i}
                className="group flex min-h-[1.65em] items-start hover:bg-accent/20"
              >
                <div className="sticky left-0 z-10 flex shrink-0 select-none items-start gap-0.5 bg-[var(--source-bg)] pl-3 pr-1 text-right text-muted-foreground/60 tabular-nums group-hover:bg-accent/20">
                  <span className="inline-block w-7">{i + 1}</span>
                  <button
                    type="button"
                    onClick={foldable ? () => toggleFold(i) : undefined}
                    className={cn(
                      "inline-flex h-[1.65em] w-3 items-center justify-center text-muted-foreground/70 transition-opacity",
                      foldable
                        ? "cursor-pointer opacity-70 hover:text-foreground"
                        : "pointer-events-none opacity-0"
                    )}
                    aria-label={isCollapsed ? "Expand" : "Collapse"}
                  >
                    {foldable &&
                      (isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </div>
                <pre className="m-0 flex-1 whitespace-pre pl-3 pr-6 text-foreground">
                  {tokenizeLine(line).map((tok, j) => (
                    <TokenSpan key={j} tok={tok} />
                  ))}
                  {isCollapsed && foldable && (
                    <span className="ml-1 rounded bg-muted/60 px-1.5 text-[10px] text-muted-foreground">
                      … {closerFor(line)}
                    </span>
                  )}
                </pre>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Scan text and return Map<openLine, closeLine> for { and [ blocks. */
function computeFolds(text: string): Map<number, number> {
  const map = new Map<number, number>();
  const stack: number[] = [];
  let line = 0;
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      if (c === "\n") line++;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{" || c === "[") stack.push(line);
    else if (c === "}" || c === "]") {
      const open = stack.pop();
      if (open !== undefined && open !== line) map.set(open, line);
    } else if (c === "\n") line++;
  }
  return map;
}

function closerFor(openerLine: string): string {
  const trimmed = openerLine.trimEnd();
  const last = trimmed[trimmed.length - 1];
  if (last === "{") return "}";
  if (last === "[") return "]";
  return "";
}

function TokenSpan({ tok }: { tok: Token }) {
  switch (tok.t) {
    case "key":
      return <span className="text-json-key">{tok.v}</span>;
    case "string":
      return <span className="text-json-string">{tok.v}</span>;
    case "number":
      return <span className="text-json-number">{tok.v}</span>;
    case "bool":
      return <span className="text-json-bool">{tok.v}</span>;
    case "null":
      return <span className="italic text-json-null">{tok.v}</span>;
    case "punct":
      return <span className="text-muted-foreground">{tok.v}</span>;
    default:
      return <span>{tok.v}</span>;
  }
}

function IconBtn({
  children,
  onClick,
  title,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
  active?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground",
        active && "bg-accent text-foreground"
      )}
    >
      {children}
    </button>
  );
}
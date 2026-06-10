import { useDeferredValue, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useWorkspace } from "@/store/workspace";
import { prettyPrint, tokenizeLine, type Token } from "@/lib/json/highlight";
import {
  AlignLeft,
  Code2,
  Copy,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { PaneHeader } from "@/components/layout/PaneHeader";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

export function JsonSource({
  onHide,
  embedded = false,
}: {
  onHide?: () => void;
  embedded?: boolean;
}) {
  const doc = useWorkspace((s) => s.doc);
  const editRaw = useWorkspace((s) => s.editRaw);
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

  function formatJson() {
    if (!doc) return;
    const formatted = prettyPrint(doc.value, 2);
    setCompact(false);
    editRaw(formatted);
  }

  const sourceBody = (
    <div className="relative flex-1 overflow-auto font-mono text-[12.5px] leading-[1.7]">
      <div className="py-2">
        {lines.map((line, i) => {
          if (hidden.has(i)) return null;
          const foldable = folds.has(i);
          const isCollapsed = collapsed.has(i);
          return (
            <div
              key={i}
              className="group flex min-h-[1.7em] items-start hover:bg-[color-mix(in_oklab,var(--brand)_6%,transparent)]"
            >
              <div className="sticky left-0 z-10 flex shrink-0 select-none items-start gap-0.5 border-r border-[var(--gutter-border)] bg-[var(--source-bg)] pl-3 pr-2 text-right tabular-nums group-hover:bg-[color-mix(in_oklab,var(--brand)_6%,transparent)]">
                <span className="inline-block w-8 text-[11px] text-muted-foreground/50">
                  {i + 1}
                </span>
                <button
                  type="button"
                  onClick={foldable ? () => toggleFold(i) : undefined}
                  className={cn(
                    "inline-flex h-[1.65em] w-3 items-center justify-center text-muted-foreground/70",
                    foldable
                      ? "cursor-pointer opacity-70 hover:text-foreground"
                      : "pointer-events-none opacity-0",
                    isCollapsed && "rotate-0",
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
  );

  if (embedded) {
    return <EmbeddedSourceEditor />;
  }

  return (
    <div className="flex h-full flex-col bg-[var(--source-bg)]">
      <PaneHeader
        title="Source"
        icon={<Code2 className="h-3.5 w-3.5" />}
        meta={`${lines.length.toLocaleString()} lines · valid`}
        actions={
          <>
            <IconButton title={compact ? "Format" : "Minify"} onClick={() => setCompact((c) => !c)}>
              {compact ? (
                <Maximize2 className="h-3.5 w-3.5" />
              ) : (
                <Minimize2 className="h-3.5 w-3.5" />
              )}
            </IconButton>
            <IconButton title="Format JSON" onClick={formatJson}>
              <AlignLeft className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              title="Copy JSON"
              onClick={() => {
                navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
            </IconButton>
          </>
        }
        hideSide="left"
        onHide={onHide}
      />
      {sourceBody}
    </div>
  );
}

const SOURCE_LINE_HEIGHT = 21;
const SOURCE_VIRTUAL_THRESHOLD = 80;
/** Above this size, skip syntax highlight / fold scanning to keep paste responsive. */
const LARGE_SOURCE_BYTES = 200_000;
const LARGE_EDIT_DEBOUNCE_MS = 700;
const EDIT_DEBOUNCE_MS = 400;

function EmbeddedSourceEditor() {
  const doc = useWorkspace((s) => s.doc);
  const error = useWorkspace((s) => s.error);
  const parsing = useWorkspace((s) => s.parsing);
  const editRaw = useWorkspace((s) => s.editRaw);
  const [compact, setCompact] = useState(false);
  const [draft, setDraft] = useState(doc?.raw ?? "");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  useEffect(() => {
    if (doc?.raw === draftRef.current) return;
    setDraft(doc?.raw ?? "");
    setCollapsed(new Set());
  }, [doc?.raw]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const isLargeSource = draft.length >= LARGE_SOURCE_BYTES;
  const deferredDraft = useDeferredValue(draft);

  function onDraftChange(value: string) {
    setDraft(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const debounceMs =
      value.length >= LARGE_SOURCE_BYTES ? LARGE_EDIT_DEBOUNCE_MS : EDIT_DEBOUNCE_MS;
    debounceRef.current = setTimeout(() => {
      editRaw(value);
    }, debounceMs);
  }

  function toggleCompact() {
    if (!doc) return;
    const next = !compact;
    const formatted = next ? JSON.stringify(doc.value) : prettyPrint(doc.value, 2);
    setCompact(next);
    setDraft(formatted);
    setCollapsed(new Set());
    editRaw(formatted);
  }

  function formatJson() {
    try {
      const formatted = prettyPrint(JSON.parse(draft), 2);
      setCompact(false);
      setDraft(formatted);
      setCollapsed(new Set());
      if (!editRaw(formatted)) {
        toast.error("Invalid JSON");
      }
    } catch {
      toast.error("Invalid JSON");
    }
  }

  function toggleFold(lineIndex: number) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(lineIndex)) next.delete(lineIndex);
      else next.add(lineIndex);
      return next;
    });
  }

  function expandAllFolds() {
    setCollapsed(new Set());
  }

  const lines = useMemo(
    () => (isLargeSource ? [] : deferredDraft.split("\n")),
    [deferredDraft, isLargeSource],
  );
  const folds = useMemo(
    () => (isLargeSource ? new Map<number, number>() : computeFolds(deferredDraft)),
    [deferredDraft, isLargeSource],
  );

  const hidden = useMemo(() => {
    const h = new Set<number>();
    for (const i of collapsed) {
      const end = folds.get(i);
      if (end === undefined) continue;
      for (let k = i + 1; k <= end; k++) h.add(k);
    }
    return h;
  }, [collapsed, folds]);

  const visibleLineIndices = useMemo(() => {
    const indices: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      if (!hidden.has(i)) indices.push(i);
    }
    return indices;
  }, [lines.length, hidden]);

  const isFoldedView = collapsed.size > 0;
  const displayIndices = isFoldedView ? visibleLineIndices : lines.map((_, i) => i);
  const useVirtual = displayIndices.length > SOURCE_VIRTUAL_THRESHOLD;
  const contentHeight = displayIndices.length * SOURCE_LINE_HEIGHT;

  const virtualizer = useVirtualizer({
    count: useVirtual ? displayIndices.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => SOURCE_LINE_HEIGHT,
    overscan: 30,
  });

  const virtualItems = useVirtual ? virtualizer.getVirtualItems() : [];

  function renderGutterRow(lineIndex: number, style?: CSSProperties) {
    const foldable = folds.has(lineIndex);
    const isLineCollapsed = collapsed.has(lineIndex);
    return (
      <div key={lineIndex} className="flex items-start gap-0.5" style={style}>
        <span className="inline-block w-8 text-[11px] leading-[1.7] text-muted-foreground/50">
          {lineIndex + 1}
        </span>
        <button
          type="button"
          onClick={
            foldable
              ? (e) => {
                  e.stopPropagation();
                  toggleFold(lineIndex);
                }
              : undefined
          }
          className={cn(
            "relative z-20 inline-flex h-[1.65em] w-3 shrink-0 items-center justify-center text-muted-foreground/70",
            foldable
              ? "pointer-events-auto cursor-pointer opacity-70 hover:text-foreground"
              : "pointer-events-none opacity-0",
          )}
          aria-label={isLineCollapsed ? "Expand" : "Collapse"}
        >
          {foldable &&
            (isLineCollapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            ))}
        </button>
      </div>
    );
  }

  function renderHighlightedLine(lineIndex: number, style?: CSSProperties) {
    const line = lines[lineIndex];
    const foldable = folds.has(lineIndex);
    const isLineCollapsed = collapsed.has(lineIndex);
    return (
      <span
        key={lineIndex}
        className={cn("block whitespace-pre", !useVirtual && "min-h-[1.7em]")}
        style={style}
      >
        {tokenizeLine(line).map((tok, j) => (
          <TokenSpan key={j} tok={tok} />
        ))}
        {isLineCollapsed && foldable && (
          <span className="ml-1 rounded bg-muted/60 px-1.5 text-[10px] text-muted-foreground">
            … {closerFor(line)}
          </span>
        )}
      </span>
    );
  }

  if (isLargeSource) {
    return (
      <div className="flex h-full flex-col bg-[var(--source-bg)]">
        <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-border/60 px-2 py-1">
          <IconButton title={compact ? "Format" : "Minify"} onClick={toggleCompact}>
            {compact ? (
              <Maximize2 className="h-3.5 w-3.5" />
            ) : (
              <Minimize2 className="h-3.5 w-3.5" />
            )}
          </IconButton>
          <IconButton title="Format JSON" onClick={formatJson}>
            <AlignLeft className="h-3.5 w-3.5" />
          </IconButton>
          <IconButton
            title="Copy JSON"
            onClick={() => {
              navigator.clipboard.writeText(draft);
              toast.success("Copied to clipboard");
            }}
          >
            <Copy className="h-3.5 w-3.5" />
          </IconButton>
        </div>
        <div
          className={cn(
            "relative min-h-0 flex-1 overflow-auto",
            error && "ring-1 ring-inset ring-destructive/40",
          )}
        >
          {parsing && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 border-b border-border/60 bg-[var(--source-bg)]/90 px-3 py-1.5 text-[11px] text-muted-foreground">
              Parsing JSON…
            </div>
          )}
          <textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            spellCheck={false}
            className="h-full min-h-full w-full resize-none border-0 bg-transparent px-3 py-2 font-mono text-[12.5px] leading-[1.7] text-foreground shadow-none focus-visible:ring-0"
            aria-label="Edit JSON source"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-[var(--source-bg)]">
      <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-border/60 px-2 py-1">
        <IconButton title={compact ? "Format" : "Minify"} onClick={toggleCompact}>
          {compact ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
        </IconButton>
        <IconButton title="Format JSON" onClick={formatJson}>
          <AlignLeft className="h-3.5 w-3.5" />
        </IconButton>
        <IconButton
          title="Copy JSON"
          onClick={() => {
            navigator.clipboard.writeText(draft);
            toast.success("Copied to clipboard");
          }}
        >
          <Copy className="h-3.5 w-3.5" />
        </IconButton>
      </div>
      <div
        ref={scrollRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto",
          error && "ring-1 ring-inset ring-destructive/40",
        )}
      >
        {parsing && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 border-b border-border/60 bg-[var(--source-bg)]/90 px-3 py-1.5 text-[11px] text-muted-foreground">
            Parsing JSON…
          </div>
        )}
        <div
          className="flex py-2"
          style={useVirtual ? { minHeight: contentHeight + 16 } : { minHeight: "100%" }}
        >
          <div
            className={cn(
              "sticky left-0 z-20 shrink-0 select-none border-r border-[var(--gutter-border)] bg-[var(--source-bg)] pl-3 pr-2 tabular-nums",
              useVirtual && "relative",
            )}
            style={useVirtual ? { height: contentHeight } : undefined}
          >
            {useVirtual
              ? virtualItems.map((vi) => {
                  const lineIndex = displayIndices[vi.index];
                  return renderGutterRow(lineIndex, {
                    position: "absolute",
                    top: vi.start,
                    left: 12,
                    right: 8,
                    height: vi.size,
                  });
                })
              : displayIndices.map((lineIndex) => renderGutterRow(lineIndex))}
          </div>
          <div
            className="source-editor-stack min-w-0 flex-1"
            style={useVirtual ? { minHeight: contentHeight } : { minHeight: "100%" }}
          >
            <pre
              aria-hidden={!isFoldedView}
              className={cn(useVirtual && "relative", isFoldedView && "pointer-events-auto")}
              style={useVirtual ? { minHeight: contentHeight } : undefined}
              onClick={isFoldedView ? expandAllFolds : undefined}
              title={isFoldedView ? "Click to expand all and edit" : undefined}
            >
              {useVirtual
                ? virtualItems.map((vi) => {
                    const lineIndex = displayIndices[vi.index];
                    return renderHighlightedLine(lineIndex, {
                      position: "absolute",
                      top: vi.start,
                      left: 0,
                      right: 0,
                      height: vi.size,
                      lineHeight: `${SOURCE_LINE_HEIGHT}px`,
                    });
                  })
                : displayIndices.map((lineIndex) => renderHighlightedLine(lineIndex))}
            </pre>
            <textarea
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              spellCheck={false}
              tabIndex={isFoldedView ? -1 : 0}
              className={cn(
                "w-full shadow-none focus-visible:ring-0",
                isFoldedView && "pointer-events-none",
              )}
              style={
                useVirtual
                  ? { minHeight: contentHeight, height: contentHeight, overflow: "hidden" }
                  : { minHeight: "100%" }
              }
              aria-label="Edit JSON source"
              aria-hidden={isFoldedView}
            />
          </div>
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

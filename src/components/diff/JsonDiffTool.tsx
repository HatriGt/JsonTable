import { useMemo, useState } from "react";
import { ArrowLeftRight, Sparkles } from "lucide-react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { parseJson } from "@/lib/json/parse";
import { diffJson, summarize } from "@/lib/json/diff";
import { JsonDiffView } from "./JsonDiffView";
import { cn } from "@/lib/utils";

const EXAMPLE_LEFT = JSON.stringify(
  {
    name: "Acme API",
    version: "1.4.0",
    enabled: true,
    limits: { requests: 1000, burst: 50 },
    regions: ["us-east", "eu-west"],
  },
  null,
  2,
);

const EXAMPLE_RIGHT = JSON.stringify(
  {
    name: "Acme API",
    version: "2.0.0",
    enabled: false,
    limits: { requests: 5000, burst: 50, window: "1m" },
    regions: ["us-east", "ap-south"],
  },
  null,
  2,
);

function Panel({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        {error && value.trim() && (
          <span className="text-[11px] font-medium text-destructive">{error}</span>
        )}
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        placeholder="Paste JSON…"
        className={cn(
          "h-64 resize-y font-mono text-xs leading-relaxed",
          error && value.trim() && "border-destructive/60",
        )}
        aria-label={label}
      />
    </div>
  );
}

export function JsonDiffTool() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const leftParsed = useMemo(() => parseJson(left), [left]);
  const rightParsed = useMemo(() => parseJson(right), [right]);

  const bothValid = leftParsed.ok && rightParsed.ok;
  const diff = useMemo(
    () => (bothValid ? diffJson(leftParsed.value, rightParsed.value) : null),
    [bothValid, leftParsed, rightParsed],
  );
  const summary = useMemo(() => (diff ? summarize(diff) : null), [diff]);
  const [hideUnchanged, setHideUnchanged] = useState(true);

  function loadExample() {
    setLeft(EXAMPLE_LEFT);
    setRight(EXAMPLE_RIGHT);
  }

  function swap() {
    setLeft(right);
    setRight(left);
  }

  const hasInput = left.trim() !== "" || right.trim() !== "";

  return (
    <div className="landing-page relative flex min-h-dvh flex-col text-foreground">
      <div className="landing-grid-layer pointer-events-none absolute inset-0" aria-hidden="true" />
      <LandingNav />

      <main id="main-content" className="relative flex-1">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-6">
          <div className="text-center">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              JSON diff checker
            </p>
            <h1 className="mt-3 text-balance text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl">
              Compare two JSON files
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
              Paste an original and a changed document to see exactly what was added, removed, and
              updated — by path. Runs entirely in your browser; nothing is uploaded.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="h-9 cursor-pointer gap-1.5 text-xs"
              onClick={loadExample}
            >
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              Load example
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-9 cursor-pointer gap-1.5 text-xs"
              onClick={swap}
              disabled={!hasInput}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Swap sides
            </Button>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <Panel
              label="Original"
              value={left}
              onChange={setLeft}
              error={leftParsed.ok ? null : "Invalid JSON"}
            />
            <Panel
              label="Changed"
              value={right}
              onChange={setRight}
              error={rightParsed.ok ? null : "Invalid JSON"}
            />
          </div>

          {/* Result */}
          <section className="mt-8" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-foreground">Differences</h2>
              {summary && (
                <div className="flex items-center gap-3 text-xs">
                  <span className="diff-row-added rounded px-2 py-0.5 font-medium">
                    +{summary.added} added
                  </span>
                  <span className="diff-row-removed rounded px-2 py-0.5 font-medium">
                    −{summary.removed} removed
                  </span>
                  <span className="diff-row-updated rounded px-2 py-0.5 font-medium">
                    ~{summary.changed} changed
                  </span>
                  <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={hideUnchanged}
                      onChange={(e) => setHideUnchanged(e.target.checked)}
                      className="h-3.5 w-3.5 cursor-pointer accent-brand"
                    />
                    Hide unchanged
                  </label>
                </div>
              )}
            </div>

            <div className="mt-3 overflow-x-auto rounded-xl border border-border/70 bg-card">
              {!hasInput ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Paste JSON in both panels (or load the example) to see the diff.
                </p>
              ) : !bothValid ? (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Waiting for valid JSON in both panels…
                </p>
              ) : (
                diff && <JsonDiffView diff={diff} hideUnchanged={hideUnchanged} />
              )}
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

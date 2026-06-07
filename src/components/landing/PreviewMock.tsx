import { m, useReducedMotion } from "@/lib/motion/framer";
import {
  ChevronDown,
  Filter,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { motionTransition } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

type Props = { compact?: boolean };

export function PreviewMock({ compact = false }: Props) {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();
  const animateRows = mounted && !reduced;

  return (
    <div className={cn("flex flex-col", compact ? "h-[380px]" : "h-[560px]")}>
      <div className="flex h-9 items-center gap-2 border-b border-border bg-background/70 px-3 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          <span className="text-brand">●</span> users.json · 4.2 KB
        </div>
        <div className="hidden items-center gap-1 rounded-md border border-border bg-card/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:flex">
          <kbd className="rounded bg-muted px-1">⌘</kbd>
          <kbd className="rounded bg-muted px-1">P</kbd>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[240px_1fr] overflow-hidden">
        <div className="border-r border-border bg-[var(--source-bg)]">
          <div className="flex h-10 items-center gap-2 border-b border-border bg-[var(--pane-header)] px-3">
            <span className="text-sm font-medium">Source</span>
            <span className="text-xs text-muted-foreground">· 12 lines</span>
          </div>
          <div className="p-2 font-mono text-[11px] leading-5">
          <SourceLine n={1} indent={0} tokens={[{ t: "punct", v: "{" }]} />
          <SourceLine n={2} indent={1} tokens={[{ t: "key", v: '"users"' }, { t: "punct", v: ": [" }]} open />
          <SourceLine n={3} indent={2} tokens={[{ t: "punct", v: "{" }]} />
          <SourceLine n={4} indent={3} tokens={[{ t: "key", v: '"id"' }, { t: "punct", v: ": " }, { t: "string", v: '"usr_94821"' }]} />
          <SourceLine n={5} indent={3} tokens={[{ t: "key", v: '"name"' }, { t: "punct", v: ": " }, { t: "string", v: '"Alex Rivera"' }]} />
          <SourceLine n={6} indent={2} tokens={[{ t: "punct", v: "}," }]} />
          <SourceLine n={7} indent={2} tokens={[{ t: "punct", v: "…" }]} muted />
          <SourceLine n={8} indent={1} tokens={[{ t: "punct", v: "]," }]} />
          <SourceLine n={9} indent={1} tokens={[{ t: "key", v: '"meta"' }, { t: "punct", v: ": {" }]} />
          <SourceLine n={10} indent={2} tokens={[{ t: "key", v: '"version"' }, { t: "punct", v: ": " }, { t: "string", v: '"2.4"' }]} />
          <SourceLine n={11} indent={1} tokens={[{ t: "punct", v: "}" }]} />
          <SourceLine n={12} indent={0} tokens={[{ t: "punct", v: "}" }]} />
          </div>
        </div>

        <div className="flex flex-col overflow-hidden">
          <div className="flex h-10 items-center justify-between border-b border-border bg-[var(--pane-header)] px-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Grid</span>
              <span className="rounded-md bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
                users · 3 rows
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-card/60 px-1.5 py-0.5">
                <Filter className="h-2.5 w-2.5 text-brand" /> 1 filter
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full border-separate border-spacing-0 font-mono text-[11px]">
              <thead>
                <tr>
                  <th className="w-10 border-b border-r border-border bg-card/80 px-2 py-1.5 text-right text-[10px] font-normal text-muted-foreground">
                    #
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c.k}
                      className="border-b border-r border-border bg-card/80 px-2.5 py-1.5 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs font-medium">{c.k}</span>
                        <span className="rounded bg-muted/80 px-1 text-[9px] text-muted-foreground">
                          {c.t}
                        </span>
                        <div className="ml-auto flex items-center gap-0.5">
                          <Filter
                            className={cn(
                              "h-3 w-3",
                              c.k === "role"
                                ? "fill-brand/20 text-brand"
                                : "text-muted-foreground/60"
                            )}
                          />
                          <MoreVertical className="h-3 w-3 text-muted-foreground/60" />
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => {
                  const Row = animateRows ? m.tr : "tr";
                  const rowProps = animateRows
                    ? {
                        initial: { opacity: 0, y: 4 },
                        animate: { opacity: 1, y: 0 },
                        transition: {
                          ...motionTransition.normal,
                          delay: 0.08 + i * 0.06,
                        },
                      }
                    : {};
                  return (
                    <Row
                      key={i}
                      {...rowProps}
                      className={cn("group/row transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent/30", i === 0 && "bg-brand/8")}
                    >
                      <td className="w-10 border-b border-r border-border bg-card/40 px-2 py-1 text-right text-[10px] text-muted-foreground">
                        {i + 1}
                      </td>
                      <td className="border-b border-r border-border px-2.5 py-1 text-json-string">
                        "{r.id}"
                      </td>
                      <td className="border-b border-r border-border px-2.5 py-1 text-json-string">
                        "{r.name}"
                      </td>
                      <td className="border-b border-r border-border px-2.5 py-1">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px]",
                            r.role === "admin"
                              ? "bg-brand/15 text-brand"
                              : r.role === "developer"
                                ? "bg-success/15 text-success"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {r.role}
                        </span>
                      </td>
                      <td className="border-b border-r border-border px-2.5 py-1 text-json-bool">
                        {String(r.active)}
                      </td>
                    </Row>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLS = [
  { k: "id", t: "str" },
  { k: "name", t: "str" },
  { k: "role", t: "str" },
  { k: "active", t: "bool" },
];

const ROWS = [
  { id: "usr_94821", name: "Alex Rivera", role: "admin", active: true },
  { id: "usr_12830", name: "Sam Patel", role: "developer", active: true },
  { id: "usr_77105", name: "Jamie Liu", role: "viewer", active: false },
];

const INDENT_CLASS = ["pl-1", "pl-4", "pl-7", "pl-10", "pl-[52px]"] as const;

function SourceLine({
  n,
  indent,
  tokens,
  open,
  muted,
}: {
  n: number;
  indent: number;
  tokens: { t: string; v: string }[];
  open?: boolean;
  muted?: boolean;
}) {
  const pad = INDENT_CLASS[indent] ?? INDENT_CLASS[INDENT_CLASS.length - 1];
  return (
    <div
      className={cn(
        "flex items-start gap-1 rounded py-px transition-colors duration-[var(--motion-duration-fast)] hover:bg-accent/30",
        pad,
        muted && "text-muted-foreground/60"
      )}
    >
      <span className="w-5 shrink-0 text-right text-[10px] text-muted-foreground/50 tabular-nums">
        {n}
      </span>
      {open ? (
        <ChevronDown className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
      ) : (
        <span className="w-3 shrink-0" />
      )}
      <span>
        {tokens.map((tok, j) => (
          <span
            key={j}
            className={cn(
              tok.t === "key" && "text-json-key",
              tok.t === "string" && "text-json-string",
              tok.t === "punct" && "text-muted-foreground"
            )}
          >
            {tok.v}
          </span>
        ))}
      </span>
    </div>
  );
}

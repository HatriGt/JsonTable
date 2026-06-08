import { m, useReducedMotion } from "@/lib/motion/framer";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  GripVertical,
  MoreVertical,
  Search,
} from "lucide-react";
import { useMountAnimation } from "@/hooks/use-mount-animation";
import { motionTransition } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";

export function PreviewMock() {
  const reduced = useReducedMotion();
  const mounted = useMountAnimation();
  const animateRows = mounted && !reduced;

  return (
    <div className="flex h-[480px] flex-col sm:h-[520px]">
      {/* Window chrome */}
      <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border bg-[var(--pane-header)] px-4">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1 font-mono text-[11px] text-muted-foreground">
          <span className="text-info">●</span>
          users.json · 4.2 KB
        </div>
        <div className="flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          <kbd className="rounded bg-muted px-1">⌘</kbd>
          <kbd className="rounded bg-muted px-1">P</kbd>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr]">
        {/* Tree sidebar */}
        <div className="flex flex-col border-r border-border bg-[var(--source-bg)]">
          <div className="flex items-center gap-2 border-b border-border/80 px-3 py-2.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">Search keys &amp; values…</span>
          </div>
          <div className="flex-1 overflow-hidden p-2 font-mono text-[11px] leading-[1.6]">
            <TreeNode label="root" open />
            <TreeNode label="users" selected indent={1} badge="[3]" open />
            <TreeNode label="0" suffix="{…}" indent={2} />
            <TreeNode label="1" suffix="{…}" indent={2} />
            <TreeNode label="2" suffix="{…}" indent={2} />
            <TreeNode label="meta" indent={1} />
          </div>
        </div>

        {/* Grid */}
        <div className="flex min-w-0 flex-col overflow-hidden bg-card">
          <div className="flex h-10 shrink-0 items-center justify-between border-b border-border/80 bg-[var(--pane-header)] px-3">
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>root</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-foreground">users</span>
              <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                array · 3
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono">#</span>
              <span>1 filter</span>
              <span>3 rows</span>
              <span>4 cols</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-hidden">
            <table className="grid-table w-full font-mono text-[11px]">
              <thead>
                <tr>
                  <th className="grid-header-cell grid-row-index w-9 border-r border-border/60 px-2 py-2 text-right">
                    #
                  </th>
                  {COLS.map((c) => (
                    <th
                      key={c.k}
                      className="grid-header-cell min-w-0 border-r border-border/60 px-2.5 py-2 text-left"
                    >
                      <div className="flex items-center gap-1.5">
                        <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                        <span className="text-[11px] font-medium text-foreground">{c.k}</span>
                        <span className="rounded bg-muted px-1 text-[9px] text-muted-foreground">
                          {c.t}
                        </span>
                        <div className="ml-auto flex items-center gap-0.5">
                          <Filter
                            className={cn(
                              "h-3 w-3",
                              c.k === "role"
                                ? "fill-info/15 text-info"
                                : "text-muted-foreground/45",
                            )}
                          />
                          <MoreVertical className="h-3 w-3 text-muted-foreground/45" />
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
                      className={cn(
                        "transition-colors duration-[var(--motion-duration-fast)]",
                        i === 0 && "bg-[var(--grid-row-hover)]",
                      )}
                    >
                      <td className="grid-row-index grid-body-cell w-9 border-r border-border/60 px-2 py-1.5 text-right">
                        {i + 1}
                      </td>
                      <td className="grid-body-cell border-r border-border/60 px-2.5 py-1.5 text-json-string">
                        &quot;{r.id}&quot;
                      </td>
                      <td className="grid-body-cell border-r border-border/60 px-2.5 py-1.5 text-json-string">
                        &quot;{r.name}&quot;
                      </td>
                      <td className="grid-body-cell border-r border-border/60 px-2.5 py-1.5">
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 text-[10px] font-medium",
                            r.role === "admin"
                              ? "bg-brand/12 text-brand"
                              : r.role === "developer"
                                ? "bg-success/12 text-success"
                                : "bg-muted text-muted-foreground",
                          )}
                        >
                          {r.role}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "grid-body-cell border-r border-border/60 px-2.5 py-1.5 text-[11px] font-medium",
                          r.active ? "text-json-bool" : "text-destructive",
                        )}
                      >
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
] as const;

const ROWS = [
  { id: "usr_94821", name: "Alex Rivera", role: "admin", active: true },
  { id: "usr_12830", name: "Sam Patel", role: "developer", active: true },
  { id: "usr_77105", name: "Jamie Liu", role: "viewer", active: false },
] as const;

const INDENT_CLASS = ["pl-0.5", "pl-4", "pl-8", "pl-12"] as const;

function TreeNode({
  label,
  indent = 0,
  open,
  selected,
  badge,
  suffix,
}: {
  label: string;
  indent?: number;
  open?: boolean;
  selected?: boolean;
  badge?: string;
  suffix?: string;
}) {
  const pad = INDENT_CLASS[indent] ?? INDENT_CLASS[INDENT_CLASS.length - 1];
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md py-0.5 pr-1",
        pad,
        selected ? "bg-brand/15 text-foreground" : "text-muted-foreground",
      )}
    >
      {open ? (
        <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
      ) : (
        <span className="w-3 shrink-0" />
      )}
      <span className={cn("truncate", selected && "font-medium")}>
        <span className={selected ? "text-foreground" : "text-json-key"}>{label}</span>
        {badge && <span className="ml-1 text-muted-foreground">{badge}</span>}
        {suffix && <span className="ml-1 text-muted-foreground">{suffix}</span>}
      </span>
    </div>
  );
}

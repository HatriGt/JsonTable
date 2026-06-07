import { motion } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  Filter,
  GripVertical,
  MoreVertical,
  Search,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = { compact?: boolean };

export function PreviewMock({ compact = false }: Props) {
  return (
    <div className={cn("flex flex-col", compact ? "h-[380px]" : "h-[560px]")}>
      {/* Window chrome */}
      <div className="flex h-9 items-center gap-2 border-b border-border bg-background/70 px-3 backdrop-blur">
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
        {/* Tree */}
        <div className="border-r border-border bg-card/40 p-2 font-mono text-[11px] leading-5">
          <div className="mb-1 flex items-center gap-1.5 rounded border border-border/60 bg-background/60 px-1.5 py-1 text-muted-foreground">
            <Search className="h-3 w-3" />
            <span className="opacity-60">Search keys & values…</span>
          </div>
          <Node label="root" open>
            <Node label="users" open badge="3" kind="array" selected>
              <Leaf k="0" v="{…}" />
              <Leaf k="1" v="{…}" />
              <Leaf k="2" v="{…}" />
            </Node>
            <Node label="meta" open kind="object" badge="3">
              <Leaf k="version" v='"2.4"' kind="string" />
              <Leaf k="total" v="3" kind="number" />
              <Leaf k="active" v="true" kind="bool" />
            </Node>
          </Node>
        </div>

        {/* Grid */}
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-background/40 px-3 py-1.5">
            <div className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <span>root</span>
              <ChevronRight className="h-3 w-3 opacity-50" />
              <span className="rounded bg-brand/10 px-1.5 py-0.5 text-brand">
                users
              </span>
              <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                array · 3
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded border border-border bg-card/60 px-1.5 py-0.5">
                <Sparkles className="h-2.5 w-2.5 text-brand" /> 1 filter
              </span>
              <span>3 rows · 4 cols</span>
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
                        <span className="underline decoration-dotted decoration-muted-foreground/40 underline-offset-[3px]">
                          {c.k}
                        </span>
                        <span className="rounded bg-muted px-1 text-[9px] text-muted-foreground">
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
                {ROWS.map((r, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.35 }}
                    className={cn(
                      "group/row",
                      i === 0 && "bg-brand/8"
                    )}
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
                  </motion.tr>
                ))}
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

function Node({
  label,
  badge,
  open,
  children,
  selected,
  kind,
}: {
  label: string;
  badge?: string;
  open?: boolean;
  selected?: boolean;
  kind?: "object" | "array";
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors",
          selected ? "bg-brand/15 text-foreground" : "hover:bg-accent/40"
        )}
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="text-json-key">{label}</span>
        {badge && (
          <span
            className={cn(
              "ml-1 rounded px-1 py-px text-[9px] tabular-nums",
              kind === "array"
                ? "bg-brand/15 text-brand"
                : "bg-muted text-muted-foreground"
            )}
          >
            {kind === "array" ? `[${badge}]` : `{${badge}}`}
          </span>
        )}
      </div>
      {open && <div className="ml-3 border-l border-border/60 pl-2">{children}</div>}
    </div>
  );
}

function Leaf({
  k,
  v,
  kind,
}: {
  k: string;
  v: string;
  kind?: "string" | "number" | "bool";
}) {
  const cls =
    kind === "string"
      ? "text-json-string"
      : kind === "number"
        ? "text-json-number"
        : kind === "bool"
          ? "text-json-bool"
          : "text-muted-foreground";
  return (
    <div className="flex items-center gap-1.5 px-1.5 py-0.5">
      <span className="text-json-key">{k}</span>
      <span className="text-muted-foreground">:</span>
      <span className={cls}>{v}</span>
    </div>
  );
}
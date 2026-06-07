import { useEffect, useRef, useState } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type ImperativePanelHandle,
} from "react-resizable-panels";
import { useWorkspace } from "@/store/workspace";
import { useTheme } from "@/store/theme";
import { Toolbar } from "./Toolbar";
import { StatusBar } from "./StatusBar";
import { EmptyState } from "./EmptyState";
import { JsonSource } from "@/components/source/JsonSource";
import { NestedGrid } from "@/components/grid/NestedGrid";
import { loadPrefs, savePrefs } from "@/lib/storage/prefs";
import { Toaster } from "@/components/ui/sonner";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Workspace() {
  const doc = useWorkspace((s) => s.doc);
  const loadJson = useWorkspace((s) => s.loadJson);
  const initTheme = useTheme((s) => s.init);
  const prefs = loadPrefs();

  const sourceRef = useRef<ImperativePanelHandle>(null);
  const gridRef = useRef<ImperativePanelHandle>(null);
  const [sourceCollapsed, setSourceCollapsed] = useState(false);
  const [gridCollapsed, setGridCollapsed] = useState(false);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    function onDragOver(e: DragEvent) {
      e.preventDefault();
    }
    async function onDrop(e: DragEvent) {
      e.preventDefault();
      const f = e.dataTransfer?.files?.[0];
      if (f) await loadJson(f.name, await f.text());
    }
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, [loadJson]);

  const collapseSource = () => sourceRef.current?.collapse();
  const expandSource = () => sourceRef.current?.expand();
  const collapseGrid = () => gridRef.current?.collapse();
  const expandGrid = () => gridRef.current?.expand();

  // Two-pane sizes; fall back from legacy [a,b,c]
  const [sourceSize, gridSize] = (() => {
    const p = prefs.panels;
    if (p.length === 3) return [p[0], p[1] + p[2]];
    return [p[0] ?? 38, p[1] ?? 62];
  })();

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <h1 className="sr-only">JSON to Table Workspace</h1>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        {!doc ? (
          <EmptyState />
        ) : (
          <PanelGroup
            direction="horizontal"
            onLayout={(sizes: number[]) => {
              if (sizes.length === 2)
                savePrefs({
                  panels: [sizes[0], sizes[1], 0] as [number, number, number],
                });
            }}
          >
            <Panel
              ref={sourceRef}
              defaultSize={sourceSize}
              minSize={18}
              collapsible
              collapsedSize={0}
              order={1}
              id="source"
              onCollapse={() => setSourceCollapsed(true)}
              onExpand={() => setSourceCollapsed(false)}
              className="relative border-r border-border"
            >
              <JsonSource />
              <PaneFooter side="left" onCollapse={collapseSource} />
            </Panel>
            <PanelResizeHandle
              className={cn(
                "group relative w-px bg-border transition-colors hover:bg-brand/60",
                "data-[resize-handle-state=drag]:bg-brand"
              )}
            >
              <CollapsedRail
                onExpandSource={expandSource}
                onExpandGrid={expandGrid}
                sourceCollapsed={sourceCollapsed}
                gridCollapsed={gridCollapsed}
              />
            </PanelResizeHandle>
            <Panel
              ref={gridRef}
              defaultSize={gridSize}
              minSize={25}
              collapsible
              collapsedSize={0}
              order={2}
              id="grid"
              onCollapse={() => setGridCollapsed(true)}
              onExpand={() => setGridCollapsed(false)}
              className="relative"
            >
              <GridPane />
              <PaneFooter side="right" onCollapse={collapseGrid} />
            </Panel>
          </PanelGroup>
        )}
      </div>
      <StatusBar />
      <Toaster />
    </div>
  );
}

function GridPane() {
  const doc = useWorkspace((s) => s.doc);
  if (!doc) return null;
  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-9 shrink-0 items-center justify-between border-b border-border/70 bg-card/60 px-3">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="font-bold text-foreground">GRID</span>
          <span className="text-muted-foreground/70">·</span>
          <span className="inline-flex items-center gap-1">
            <Table2 className="h-3 w-3" /> nested tables
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <IconBtn title="Search rows">
            <Search className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-3">
        <div className="inline-block min-w-full align-top">
          <NestedGrid value={doc.value} />
        </div>
      </div>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}

function PaneFooter({
  onCollapse,
  side,
}: {
  onCollapse: () => void;
  side: "left" | "right";
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <div className="absolute bottom-2 right-2 z-20">
      <button
        onClick={onCollapse}
        title="Collapse pane"
        aria-label="Collapse pane"
        className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground shadow-sm backdrop-blur hover:bg-accent hover:text-foreground"
      >
        <Icon className="h-3 w-3" />
      </button>
    </div>
  );
}

function CollapsedRail({
  sourceCollapsed,
  gridCollapsed,
  onExpandSource,
  onExpandGrid,
}: {
  sourceCollapsed: boolean;
  gridCollapsed: boolean;
  onExpandSource: () => void;
  onExpandGrid: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center justify-center gap-1.5">
      {sourceCollapsed && (
        <button
          onClick={onExpandSource}
          className="pointer-events-auto rounded-md border border-border bg-card p-1 text-muted-foreground shadow hover:bg-accent hover:text-foreground"
          title="Expand JSON pane"
          aria-label="Expand JSON pane"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
      {gridCollapsed && (
        <button
          onClick={onExpandGrid}
          className="pointer-events-auto rounded-md border border-border bg-card p-1 text-muted-foreground shadow hover:bg-accent hover:text-foreground"
          title="Expand grid pane"
          aria-label="Expand grid pane"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
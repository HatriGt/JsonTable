import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "@/lib/motion/framer";
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
import { PaneHeader } from "@/components/layout/PaneHeader";
import { IconButton } from "@/components/ui/icon-button";
import { motionTransition } from "@/lib/motion/presets";
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

  const [sourceSize, gridSize] = (() => {
    const p = prefs.panels;
    if (p.length === 3) return [p[0], p[1] + p[2]];
    return [p[0] ?? 38, p[1] ?? 62];
  })();

  return (
    <div className="flex h-dvh w-screen flex-col bg-background text-foreground">
      <h1 className="sr-only">JSON to Table Workspace</h1>
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!doc ? (
            <m.div
              key="empty"
              className="flex flex-1"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransition.normal}
            >
              <EmptyState />
            </m.div>
          ) : (
            <m.div
              key="workspace"
              className="flex flex-1 min-w-0"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransition.normal}
            >
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
                    "group relative w-1 bg-transparent transition-colors duration-[var(--motion-duration-fast)]",
                    "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border before:transition-[width,background-color] before:duration-[var(--motion-duration-fast)]",
                    "hover:before:w-0.5 hover:before:bg-brand/60",
                    "data-[resize-handle-state=drag]:before:w-0.5 data-[resize-handle-state=drag]:before:bg-brand"
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
            </m.div>
          )}
        </AnimatePresence>
      </div>
      <StatusBar />
    </div>
  );
}

function GridPane() {
  const doc = useWorkspace((s) => s.doc);
  if (!doc) return null;
  return (
    <div className="flex h-full flex-col bg-background">
      <PaneHeader
        title="GRID"
        meta={
          <>
            <Table2 className="h-3 w-3" /> nested tables
          </>
        }
        actions={
          <IconButton title="Search rows">
            <Search className="h-3.5 w-3.5" />
          </IconButton>
        }
      />
      <div className="flex-1 overflow-auto p-3">
        <div className="inline-block min-w-full align-top">
          <NestedGrid value={doc.value} />
        </div>
      </div>
    </div>
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
        type="button"
        onClick={onCollapse}
        title="Collapse pane"
        aria-label="Collapse pane"
        className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-border bg-card/80 text-muted-foreground shadow-sm backdrop-blur transition-[background-color,color,transform] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground active:scale-95"
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
          type="button"
          onClick={onExpandSource}
          className="pointer-events-auto cursor-pointer rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow transition-[background-color,color,transform] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground active:scale-95"
          title="Expand JSON pane"
          aria-label="Expand JSON pane"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      )}
      {gridCollapsed && (
        <button
          type="button"
          onClick={onExpandGrid}
          className="pointer-events-auto cursor-pointer rounded-md border border-border bg-card p-1.5 text-muted-foreground shadow transition-[background-color,color,transform] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground active:scale-95"
          title="Expand grid pane"
          aria-label="Expand grid pane"
        >
          <Minimize2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

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
import { motionTransition } from "@/lib/motion/presets";
import { Code2, PanelLeftOpen, PanelRightOpen, Search, Table2 } from "lucide-react";
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

  const toggleSource = () => (sourceCollapsed ? expandSource() : collapseSource());
  const toggleGrid = () => (gridCollapsed ? expandGrid() : collapseGrid());

  const [sourceSize, gridSize] = (() => {
    const p = prefs.panels;
    if (p.length === 3) return [p[0], p[1] + p[2]];
    return [p[0] ?? 38, p[1] ?? 62];
  })();

  return (
    <div className="flex h-dvh w-screen flex-col bg-[var(--shell)] text-foreground">
      <h1 className="sr-only">JSON to Table Workspace</h1>
      <Toolbar
        paneControls={
          doc
            ? {
                sourceCollapsed,
                gridCollapsed,
                onToggleSource: toggleSource,
                onToggleGrid: toggleGrid,
              }
            : undefined
        }
      />
      <div className="relative flex flex-1 overflow-hidden shell-workspace">
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
              className="relative flex min-w-0 flex-1"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransition.normal}
            >
              {sourceCollapsed && (
                <CollapsedEdgeRail
                  side="left"
                  label="Source"
                  icon={<Code2 className="h-4 w-4" />}
                  onExpand={expandSource}
                />
              )}
              {gridCollapsed && (
                <CollapsedEdgeRail
                  side="right"
                  label="Grid"
                  icon={<Table2 className="h-4 w-4" />}
                  onExpand={expandGrid}
                />
              )}

              <PanelGroup
                direction="horizontal"
                className="flex-1"
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
                  className="relative border-r border-border/80 shell-pane"
                >
                  <JsonSource onHide={collapseSource} />
                </Panel>
                <PanelResizeHandle
                  className={cn(
                    "relative bg-transparent transition-[width,background-color] duration-[var(--motion-duration-fast)]",
                    sourceCollapsed || gridCollapsed ? "w-2 bg-border/40" : "w-1",
                    "before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border",
                    "hover:bg-brand/10 hover:before:w-0.5 hover:before:bg-brand/60",
                    "data-[resize-handle-state=drag]:bg-brand/15 data-[resize-handle-state=drag]:before:w-0.5 data-[resize-handle-state=drag]:before:bg-brand"
                  )}
                />
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
                  className="relative shell-pane"
                >
                  <GridPane onHide={collapseGrid} />
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

function GridPane({ onHide }: { onHide: () => void }) {
  const doc = useWorkspace((s) => s.doc);
  if (!doc) return null;
  return (
    <div className="flex h-full flex-col bg-[var(--shell)]">
      <PaneHeader
        title="Grid"
        icon={<Table2 className="h-3.5 w-3.5" />}
        meta="Nested tables · filter · sort · inline edit"
        hideSide="right"
        onHide={onHide}
        actions={
          <button
            type="button"
            title="Search rows (coming soon)"
            aria-label="Search rows"
            className="inline-flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md text-muted-foreground/35"
            disabled
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        }
      />
      <div className="flex-1 overflow-auto bg-[var(--shell)] p-3 sm:p-4">
        <div className="inline-block min-w-full align-top">
          <NestedGrid value={doc.value} />
        </div>
      </div>
    </div>
  );
}

function CollapsedEdgeRail({
  side,
  label,
  icon,
  onExpand,
}: {
  side: "left" | "right";
  label: string;
  icon: React.ReactNode;
  onExpand: () => void;
}) {
  const OpenIcon = side === "left" ? PanelLeftOpen : PanelRightOpen;

  return (
    <button
      type="button"
      onClick={onExpand}
      title={`Show ${label.toLowerCase()} pane`}
      aria-label={`Show ${label.toLowerCase()} pane`}
      className={cn(
        "absolute top-0 z-30 flex h-full w-11 cursor-pointer flex-col items-center justify-center gap-2 border-border bg-[var(--pane-header)] text-muted-foreground shadow-md transition-[background-color,color] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground",
        side === "left"
          ? "left-0 border-r"
          : "right-0 border-l"
      )}
    >
      <OpenIcon className="h-4 w-4 shrink-0 text-brand" />
      <span className="text-[10px] font-semibold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
      <span className="text-brand">{icon}</span>
    </button>
  );
}

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
import { LeftPane } from "./LeftPane";
import { GridPane } from "./GridPane";
import { loadPrefs, savePrefs, type LeftPaneTab } from "@/lib/storage/prefs";
import { motionTransition } from "@/lib/motion/presets";
import {
  Code2,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightOpen,
  Table2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function ParsingShell() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-card px-6 text-center">
      <span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden="true" />
      <p className="font-mono text-sm text-foreground">Parsing JSON…</p>
      <p className="max-w-sm text-xs text-muted-foreground">
        Large files are parsed off the main thread. The grid will appear when ready.
      </p>
    </div>
  );
}

export function Workspace() {
  const doc = useWorkspace((s) => s.doc);
  const parsing = useWorkspace((s) => s.parsing);
  const loadJson = useWorkspace((s) => s.loadJson);
  const initTheme = useTheme((s) => s.init);
  const prefs = loadPrefs();

  const leftRef = useRef<ImperativePanelHandle>(null);
  const gridRef = useRef<ImperativePanelHandle>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [gridCollapsed, setGridCollapsed] = useState(false);
  const [leftPaneTab, setLeftPaneTab] = useState<LeftPaneTab>(prefs.leftPaneTab);

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

  const collapseLeft = () => leftRef.current?.collapse();
  const expandLeft = () => leftRef.current?.expand();
  const toggleLeft = () => (leftCollapsed ? expandLeft() : collapseLeft());
  const collapseGrid = () => gridRef.current?.collapse();
  const expandGrid = () => gridRef.current?.expand();

  const [leftSize, gridSize] = prefs.panels;

  return (
    <div className="workspace-page relative flex h-dvh w-screen flex-col text-foreground">
      <div
        className="workspace-grid-layer pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <h1 className="sr-only">JSON to Table Workspace</h1>
      <Toolbar />
      <div className="relative z-10 flex flex-1 overflow-hidden shell-workspace">
        <AnimatePresence mode="wait">
          {parsing && !doc ? (
            <m.div
              key="parsing"
              className="flex flex-1"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={motionTransition.normal}
            >
              <ParsingShell />
            </m.div>
          ) : !doc ? (
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
              {leftCollapsed && (
                <CollapsedEdgeRail
                  side="left"
                  label={leftPaneTab === "tree" ? "Tree" : "Source"}
                  icon={
                    leftPaneTab === "tree" ? (
                      <GitBranch className="h-4 w-4" />
                    ) : (
                      <Code2 className="h-4 w-4" />
                    )
                  }
                  onExpand={expandLeft}
                />
              )}
              {gridCollapsed && (
                <CollapsedEdgeRail
                  side="left"
                  label="Grid"
                  icon={<Table2 className="h-4 w-4" />}
                  onExpand={expandGrid}
                />
              )}

              <PanelGroup
                direction="horizontal"
                className="min-w-0 flex-1"
                onLayout={(sizes: number[]) => {
                  if (sizes.length === 2) {
                    savePrefs({
                      panels: [sizes[0], sizes[1]] as [number, number],
                    });
                  }
                }}
              >
                <Panel
                  ref={leftRef}
                  defaultSize={leftSize}
                  minSize={16}
                  collapsible
                  collapsedSize={0}
                  order={1}
                  id="left"
                  onCollapse={() => setLeftCollapsed(true)}
                  onExpand={() => setLeftCollapsed(false)}
                  className="relative border-r border-border/80 shell-pane"
                >
                  <LeftPane tab={leftPaneTab} onTabChange={setLeftPaneTab} />
                </Panel>
                <LeftPaneResizeHandle
                  collapsed={leftCollapsed}
                  onToggle={toggleLeft}
                  paneLabel={leftPaneTab === "tree" ? "tree" : "source"}
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
      <StatusBar className="relative z-10" />
    </div>
  );
}

function LeftPaneResizeHandle({
  collapsed,
  onToggle,
  paneLabel,
}: {
  collapsed: boolean;
  onToggle: () => void;
  paneLabel: string;
}) {
  const label = `Collapse ${paneLabel} pane`;

  return (
    <PanelResizeHandle
      className={cn(
        "group relative bg-transparent transition-[width,background-color] duration-[var(--motion-duration-fast)]",
        "w-1 before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:bg-border",
        "hover:bg-brand/10 hover:before:w-0.5 hover:before:bg-brand/60",
        "data-[resize-handle-state=drag]:bg-brand/15 data-[resize-handle-state=drag]:before:w-0.5 data-[resize-handle-state=drag]:before:bg-brand",
      )}
    >
      {!collapsed && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          title={label}
          aria-label={label}
          aria-expanded
          className={cn(
            "absolute left-1/2 top-1/2 z-20 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto items-center justify-center rounded-full",
            "border border-info/40 bg-[var(--pane-header)]/95 text-info shadow-md backdrop-blur-md",
            "transition-[background-color,color,box-shadow,border-color,transform] duration-[var(--motion-duration-fast)]",
            "hover:border-info/60 hover:bg-info/10 hover:text-info hover:shadow-lg",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "active:scale-95",
          )}
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      )}
    </PanelResizeHandle>
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
        "z-30 flex h-full w-11 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 border-border bg-[var(--pane-header)]/95 text-muted-foreground shadow-md backdrop-blur-md transition-[background-color,color] duration-[var(--motion-duration-fast)] hover:bg-accent hover:text-foreground",
        side === "left" ? "border-r" : "border-l",
      )}
    >
      <OpenIcon className="h-4 w-4 shrink-0 text-info" />
      <span className="text-[10px] font-semibold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
      <span className="text-info">{icon}</span>
    </button>
  );
}

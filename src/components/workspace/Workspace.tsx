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
  GripVertical,
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
    <div className="workspace-page relative flex h-dvh w-full flex-col text-foreground">
      <div
        className="workspace-grid-layer pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div
        className="workspace-top-glow pointer-events-none absolute inset-x-0 top-0 h-64"
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
    <PanelResizeHandle className="pane-resize-handle">
      <div className="pane-divider-control pointer-events-none">
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
            className="pane-divider-control__collapse pointer-events-auto"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        )}
        <span className="pane-divider-control__grip" aria-hidden="true">
          <GripVertical className="h-3.5 w-3.5" />
        </span>
      </div>
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
        "group/rail z-30 flex h-full w-10 shrink-0 cursor-pointer flex-col items-center justify-center gap-2.5 border-border bg-[var(--pane-header)] text-muted-foreground transition-[background-color,color] duration-[var(--motion-duration-fast)] hover:bg-brand/10 hover:text-brand",
        side === "left" ? "border-r" : "border-l",
      )}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md text-info transition-colors duration-[var(--motion-duration-fast)] group-hover/rail:bg-brand/15 group-hover/rail:text-brand">
        <OpenIcon className="h-4 w-4 shrink-0" />
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wider [writing-mode:vertical-rl] rotate-180">
        {label}
      </span>
      <span className="text-info transition-colors duration-[var(--motion-duration-fast)] group-hover/rail:text-brand">
        {icon}
      </span>
    </button>
  );
}

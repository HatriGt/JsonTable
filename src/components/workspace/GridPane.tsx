import {
  memo,
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { RotateCcw, Table2, ZoomIn, ZoomOut } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { NestedGrid } from "@/components/grid/NestedGrid";
import { GridSearch, GridSearchButton } from "@/components/grid/GridSearch";
import { PaneHeader } from "@/components/layout/PaneHeader";
import { IconButton } from "@/components/ui/icon-button";
import {
  GRID_ZOOM_DEFAULT,
  GRID_ZOOM_MAX,
  GRID_ZOOM_MIN,
  GRID_ZOOM_STEP,
  loadPrefs,
  savePrefs,
} from "@/lib/storage/prefs";

type Props = {
  onHide: () => void;
};

const MemoizedNestedGrid = memo(NestedGrid);

function GridContent({
  value,
  scrollElementRef,
}: {
  value: unknown;
  scrollElementRef: RefObject<HTMLDivElement | null>;
}) {
  const deferredValue = useDeferredValue(value);
  const isStale = deferredValue !== value;

  return (
    <div className="relative">
      {isStale && (
        <div className="pointer-events-none absolute inset-0 z-10 bg-card/40" aria-hidden="true" />
      )}
      <MemoizedNestedGrid value={deferredValue} scrollElementRef={scrollElementRef} />
    </div>
  );
}

export function GridPane({ onHide }: Props) {
  const doc = useWorkspace((s) => s.doc);
  const [searchOpen, setSearchOpen] = useState(false);
  const [gridZoom, setGridZoom] = useState(() => loadPrefs().gridZoom);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const zoomRafRef = useRef<number | null>(null);

  const scale = gridZoom / 100;

  const setZoomTransition = useCallback((updater: (z: number) => number) => {
    if (zoomRafRef.current !== null) {
      cancelAnimationFrame(zoomRafRef.current);
    }
    zoomRafRef.current = requestAnimationFrame(() => {
      startTransition(() => {
        setGridZoom(updater);
      });
      zoomRafRef.current = null;
    });
  }, []);

  const zoomIn = useCallback(() => {
    setZoomTransition((z) => Math.min(GRID_ZOOM_MAX, z + GRID_ZOOM_STEP));
  }, [setZoomTransition]);

  const zoomOut = useCallback(() => {
    setZoomTransition((z) => Math.max(GRID_ZOOM_MIN, z - GRID_ZOOM_STEP));
  }, [setZoomTransition]);

  const resetZoom = useCallback(() => {
    setZoomTransition(() => GRID_ZOOM_DEFAULT);
  }, [setZoomTransition]);

  useEffect(() => {
    const timer = window.setTimeout(() => savePrefs({ gridZoom }), 300);
    return () => window.clearTimeout(timer);
  }, [gridZoom]);

  useEffect(() => {
    return () => {
      if (zoomRafRef.current !== null) {
        cancelAnimationFrame(zoomRafRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      const width = box?.inlineSize ?? entry.contentRect.width;
      const height = box?.blockSize ?? entry.contentRect.height;
      setNaturalSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc?.value]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      const key = e.key.toLowerCase();
      if (key === "f") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (key === "=" || key === "+") {
        e.preventDefault();
        zoomIn();
        return;
      }

      if (key === "-") {
        e.preventDefault();
        zoomOut();
        return;
      }

      if (key === "0") {
        e.preventDefault();
        resetZoom();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomIn, zoomOut, resetZoom]);

  if (!doc) return null;

  const atMin = gridZoom <= GRID_ZOOM_MIN;
  const atMax = gridZoom >= GRID_ZOOM_MAX;
  const atDefault = gridZoom === GRID_ZOOM_DEFAULT;

  const scalerStyle: CSSProperties = {
    width: naturalSize.w > 0 ? naturalSize.w * scale : undefined,
    minWidth: "100%",
    minHeight: naturalSize.h > 0 ? naturalSize.h * scale : undefined,
  };

  const contentStyle: CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    willChange: "transform",
  };

  return (
    <div className="flex h-full min-w-0 flex-col bg-card">
      <PaneHeader
        title="Grid"
        icon={<Table2 className="h-3.5 w-3.5" />}
        meta="Nested tables · filter · sort · inline edit"
        hideSide="right"
        onHide={onHide}
        actions={
          <>
            <IconButton
              title={`Zoom out (${gridZoom}%, ⌘−)`}
              onClick={zoomOut}
              disabled={atMin}
              className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-7 sm:min-h-0 sm:w-7 sm:min-w-0"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </IconButton>
            <span
              className="hidden min-w-[2.75rem] px-1 text-center text-[11px] tabular-nums text-muted-foreground sm:inline"
              aria-live="polite"
              aria-label={`Grid zoom ${gridZoom} percent`}
            >
              {gridZoom}%
            </span>
            <IconButton
              title={`Zoom in (${gridZoom}%, ⌘+)`}
              onClick={zoomIn}
              disabled={atMax}
              className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-7 sm:min-h-0 sm:w-7 sm:min-w-0"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </IconButton>
            <IconButton
              title={`Reset zoom (${GRID_ZOOM_DEFAULT}%, ⌘0)`}
              onClick={resetZoom}
              disabled={atDefault}
              className="h-9 w-9 min-h-[44px] min-w-[44px] sm:h-7 sm:min-h-0 sm:w-7 sm:min-w-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </IconButton>
            <GridSearchButton onClick={() => setSearchOpen(true)} />
          </>
        }
      />
      <div ref={scrollRef} className="min-h-0 min-w-0 flex-1 overflow-auto bg-card p-3 sm:p-4">
        <div style={scalerStyle}>
          <div ref={contentRef} className="w-max min-w-full" style={contentStyle}>
            <GridContent value={doc.value} scrollElementRef={scrollRef} />
          </div>
        </div>
      </div>
      <GridSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

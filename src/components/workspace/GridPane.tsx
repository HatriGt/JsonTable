import { useEffect, useRef, useState } from "react";
import { Table2 } from "lucide-react";
import { useWorkspace } from "@/store/workspace";
import { NestedGrid } from "@/components/grid/NestedGrid";
import { GridSearch, GridSearchButton } from "@/components/grid/GridSearch";
import { PaneHeader } from "@/components/layout/PaneHeader";

type Props = {
  onHide: () => void;
};

export function GridPane({ onHide }: Props) {
  const doc = useWorkspace((s) => s.doc);
  const [searchOpen, setSearchOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isFind = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f";
      if (!isFind) return;
      e.preventDefault();
      setSearchOpen(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!doc) return null;

  return (
    <div className="flex h-full flex-col bg-card">
      <PaneHeader
        title="Grid"
        icon={<Table2 className="h-3.5 w-3.5" />}
        meta="Nested tables · filter · sort · inline edit"
        hideSide="right"
        onHide={onHide}
        actions={<GridSearchButton onClick={() => setSearchOpen(true)} />}
      />
      <div ref={scrollRef} className="flex-1 overflow-auto bg-card p-3 sm:p-4">
        <div className="inline-block min-w-full align-top">
          <NestedGrid value={doc.value} scrollElementRef={scrollRef} />
        </div>
      </div>
      <GridSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

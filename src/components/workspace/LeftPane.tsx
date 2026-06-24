import { Code2, GitBranch } from "lucide-react";
import { JsonTree } from "@/components/tree/JsonTree";
import { JsonSource } from "@/components/source/JsonSource";
import { PaneHeader } from "@/components/layout/PaneHeader";
import { savePrefs, type LeftPaneTab } from "@/lib/storage/prefs";
import { cn } from "@/lib/utils";

type Props = {
  tab: LeftPaneTab;
  onTabChange: (tab: LeftPaneTab) => void;
};

export function LeftPane({ tab, onTabChange }: Props) {
  function switchTab(next: LeftPaneTab) {
    onTabChange(next);
    savePrefs({ leftPaneTab: next });
  }

  return (
    <div className="flex h-full flex-col bg-[var(--source-bg)]">
      <PaneHeader
        title={tab === "tree" ? "Tree" : "Source"}
        icon={
          tab === "tree" ? <GitBranch className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />
        }
        meta={tab === "tree" ? "Navigate · search keys & values" : "Edit JSON · format · copy"}
        actions={
          <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted/30 p-0.5">
            <TabButton
              active={tab === "source"}
              onClick={() => switchTab("source")}
              label="Source"
            />
            <TabButton active={tab === "tree"} onClick={() => switchTab("tree")} label="Tree" />
          </div>
        }
      />
      <div className="flex-1 overflow-hidden">
        {tab === "tree" ? <JsonTree /> : <JsonSource embedded />}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "cursor-pointer rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

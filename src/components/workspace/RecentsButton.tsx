import { useState } from "react";
import { ArrowRight, FileJson, History, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useWorkspace } from "@/store/workspace";
import { formatBytes } from "@/lib/format";
import { deleteRecent, listRecents, loadRecent, type RecentMeta } from "@/lib/storage/recents";

type RecentRow = RecentMeta & { savedAtLabel: string };

/** Toolbar button that opens a modal listing recently opened files. Replaces
 *  the old inline recents list on the empty state, so recents stay reachable
 *  whether or not a document is currently open. */
export function RecentsButton() {
  const [open, setOpen] = useState(false);
  const [recents, setRecents] = useState<RecentRow[]>([]);
  const loadJson = useWorkspace((s) => s.loadJson);

  function refresh() {
    listRecents()
      // Format the locale/timezone-dependent timestamp here (post-mount async
      // callback), not during render, so it never causes a hydration mismatch.
      .then((rows) =>
        setRecents(rows.map((r) => ({ ...r, savedAtLabel: new Date(r.savedAt).toLocaleString() }))),
      )
      .catch(() => {});
  }

  function onOpenChange(next: boolean) {
    if (next) refresh();
    setOpen(next);
  }

  async function openRecent(r: RecentMeta) {
    const raw = await loadRecent(r.id);
    if (raw) {
      await loadJson(r.name, raw);
      setOpen(false);
    } else {
      // The index entry outlived its blob — drop the stale row.
      await deleteRecent(r.id);
      refresh();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 cursor-pointer gap-1.5 text-xs"
          aria-label="Recent files"
        >
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Recents</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[min(460px,calc(100vw-2rem))] gap-0 overflow-hidden p-0 sm:max-w-[460px]">
        <DialogHeader className="border-b border-border px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4 text-brand" aria-hidden="true" />
            Recent files
          </DialogTitle>
        </DialogHeader>

        {recents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <FileJson className="h-7 w-7 text-muted-foreground/50" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">No recent files yet</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Files you open are saved here, in your browser, so you can jump back to them.
            </p>
          </div>
        ) : (
          <ul
            className="max-h-[60vh] overflow-y-auto p-1.5"
            role="list"
            aria-label="Recent JSON files"
          >
            {recents.map((r) => (
              <li key={r.id} className="group flex items-center rounded-md hover:bg-accent/60">
                <button
                  type="button"
                  onClick={() => void openRecent(r)}
                  className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
                  aria-label={`Open recent file ${r.name}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <FileJson className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {r.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {formatBytes(r.sizeBytes)} · {r.savedAtLabel}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-muted-foreground/0 transition-colors duration-[var(--motion-duration-fast)] group-hover:text-muted-foreground/60"
                    aria-hidden="true"
                  />
                </button>
                <IconButton
                  title="Remove from recents"
                  aria-label={`Remove ${r.name} from recent files`}
                  onClick={async () => {
                    await deleteRecent(r.id);
                    refresh();
                  }}
                  className="mr-1.5 h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}

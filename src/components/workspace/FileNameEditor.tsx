import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { formatBytes } from "@/lib/format";

/** The document name badge in the workspace toolbar. Click (or press Enter /
 *  Space) to rename inline: Enter or blur commits, Escape cancels. The commit
 *  is delegated to the store via `onRename`, which trims and ignores no-ops. */
export function FileNameEditor({
  name,
  sizeBytes,
  onRename,
}: {
  name: string;
  sizeBytes: number;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEditing() {
    setDraft(name);
    setEditing(true);
  }

  function commit() {
    setEditing(false);
    onRename(draft);
  }

  function cancel() {
    setEditing(false);
    setDraft(name);
  }

  // Focus and select the file's base name (excluding extension) on open, so a
  // quick retype doesn't clobber the ".json" the user usually wants to keep.
  // Runs only when entering edit mode — not on every keystroke, which would
  // re-select and clobber what the user is typing.
  useEffect(() => {
    if (!editing) return;
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    const val = input.value;
    const dot = val.lastIndexOf(".");
    input.setSelectionRange(0, dot > 0 ? dot : val.length);
  }, [editing]);

  if (editing) {
    return (
      <span className="flex min-w-0 items-center gap-1.5 rounded-md border border-brand/60 bg-card py-1 pl-2 pr-1.5 ring-1 ring-brand/30">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            } else if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
          spellCheck={false}
          aria-label="File name"
          className="w-[clamp(6rem,32vw,18rem)] min-w-0 bg-transparent font-mono text-[11px] text-foreground outline-none placeholder:text-muted-foreground"
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      title={`${name} — click to rename`}
      aria-label={`File name: ${name}. Click to rename.`}
      className="group/name flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md border border-border/60 bg-card/60 py-1 pl-2 pr-2.5 text-left transition-colors hover:border-border hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand/50"
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
      <span className="max-w-[160px] truncate font-mono text-[11px] sm:max-w-xs">{name}</span>
      <Pencil
        className="hidden h-3 w-3 shrink-0 text-muted-foreground/60 group-hover/name:inline sm:inline"
        aria-hidden="true"
      />
      <span className="hidden shrink-0 text-[10px] tabular-nums text-muted-foreground sm:inline">
        {formatBytes(sizeBytes)}
      </span>
    </button>
  );
}

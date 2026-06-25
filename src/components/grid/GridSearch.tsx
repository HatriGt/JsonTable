import { useMemo, useState } from "react";
import { useWorkspace } from "@/store/workspace";
import { searchJson, type SearchMatch } from "@/lib/json/search";
import { formatPath } from "@/lib/json/path";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Search } from "lucide-react";
import { useModKey } from "@/lib/platform";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GridSearch({ open, onOpenChange }: Props) {
  const doc = useWorkspace((s) => s.doc);
  const setSelection = useWorkspace((s) => s.setSelection);
  const [query, setQuery] = useState("");

  function handleOpenChange(next: boolean) {
    if (!next) setQuery(""); // clear the search when the dialog closes
    onOpenChange(next);
  }

  const results = useMemo(() => {
    if (!doc || !query.trim()) return [] as SearchMatch[];
    return searchJson(doc.value, query);
  }, [doc, query]);

  function selectMatch(match: SearchMatch) {
    setSelection(match.path, "grid");
    handleOpenChange(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={handleOpenChange}>
      <CommandInput placeholder="Search keys and values…" value={query} onValueChange={setQuery} />
      <CommandList>
        <CommandEmpty>
          {query.trim() ? "No matches found." : "Type to search the document."}
        </CommandEmpty>
        {results.length > 0 && (
          <CommandGroup heading={`${results.length} result${results.length === 1 ? "" : "s"}`}>
            {results.map((m, i) => (
              <CommandItem
                key={`${formatPath(m.path)}-${m.matchType}-${i}`}
                value={`${formatPath(m.path)} ${m.preview}`}
                onSelect={() => selectMatch(m)}
                className="cursor-pointer"
              >
                <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-mono text-xs">{formatPath(m.path)}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {m.matchType === "key" ? `key · ${m.preview}` : m.preview}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

export function GridSearchButton({ onClick }: { onClick: () => void }) {
  const mod = useModKey();
  return (
    <button
      type="button"
      title={`Search document (${mod}F)`}
      aria-label="Search document"
      onClick={onClick}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <Search className="h-3.5 w-3.5" />
    </button>
  );
}

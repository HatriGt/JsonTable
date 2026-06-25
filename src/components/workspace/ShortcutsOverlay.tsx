import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModKey } from "@/lib/platform";

type Shortcut = { keys: string[]; label: string };

function useShortcutGroups(mod: string): { title: string; items: Shortcut[] }[] {
  return [
    {
      title: "Document",
      items: [
        { keys: [mod, "V"], label: "Paste JSON from clipboard" },
        { keys: [mod, "P"], label: "Paste JSON into a dialog" },
      ],
    },
    {
      title: "Navigate & search",
      items: [
        { keys: [mod, "F"], label: "Search the document" },
        { keys: ["Enter"], label: "Edit the selected value" },
        { keys: ["Esc"], label: "Cancel an inline edit" },
      ],
    },
    {
      title: "Grid zoom",
      items: [
        { keys: [mod, "+"], label: "Zoom in" },
        { keys: [mod, "−"], label: "Zoom out" },
        { keys: [mod, "0"], label: "Reset zoom" },
      ],
    },
    {
      title: "Help",
      items: [{ keys: ["?"], label: "Show this shortcuts reference" }],
    },
  ];
}

function Keys({ keys }: { keys: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.map((k) => (
        <kbd
          key={k}
          className="inline-flex min-h-[22px] min-w-[22px] items-center justify-center rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] shadow-sm"
        >
          {k}
        </kbd>
      ))}
    </span>
  );
}

export function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);
  const mod = useModKey();
  const groups = useShortcutGroups(mod);

  // Open with "?" (Shift+/) when the user isn't typing into a field.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "?") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
          target.closest(".cm-editor"))
      ) {
        return;
      }
      e.preventDefault();
      setOpen((o) => !o);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 cursor-pointer"
        onClick={() => setOpen(true)}
        title="Keyboard shortcuts (?)"
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[min(440px,calc(100vw-2rem))] sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Keyboard className="h-4 w-4 text-brand" aria-hidden="true" />
              Keyboard shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <ul className="space-y-1">
                  {group.items.map((s) => (
                    <li
                      key={s.label}
                      className="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-sm hover:bg-accent/50"
                    >
                      <span className="min-w-0 text-foreground">{s.label}</span>
                      <Keys keys={s.keys} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

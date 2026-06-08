import { NestedGrid } from "@/components/grid/NestedGrid";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPath, slashPathToSegments } from "@/lib/json/path";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: string;
  path: string;
  value: unknown[];
};

function ModalGridBody({ value, path }: { value: unknown[]; path: string }) {
  return (
    <div className="min-h-0 flex-1 overflow-auto bg-card p-3 sm:p-4">
      <div className="inline-block min-w-full align-top">
        <NestedGrid value={value} path={path} />
      </div>
    </div>
  );
}

export function ArrayTableModal({ open, onOpenChange, label, path, value }: Props) {
  const isMobile = useIsMobile();
  const pathLabel = path ? formatPath(slashPathToSegments(path)) : "root";
  const rowCount = value.length;

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="flex h-[92vh] w-full flex-col gap-0 rounded-t-xl border-t p-0 sm:max-w-none"
        >
          <SheetHeader className="shrink-0 space-y-1 border-b border-border px-4 py-3 text-left">
            <SheetTitle className="font-mono text-base">{label}</SheetTitle>
            <SheetDescription className="font-mono text-xs">
              {rowCount} rows · {pathLabel}
            </SheetDescription>
          </SheetHeader>
          <ModalGridBody value={value} path={path} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] w-[calc(100%-2rem)] max-w-5xl flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-mono text-base">{label}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {rowCount} rows · {pathLabel}
          </DialogDescription>
        </DialogHeader>
        <ModalGridBody value={value} path={path} />
      </DialogContent>
    </Dialog>
  );
}

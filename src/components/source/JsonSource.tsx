import { useRef } from "react";
import { AlignLeft, Code2, Copy, Minimize2 } from "lucide-react";
import { PaneHeader } from "@/components/layout/PaneHeader";
import { IconButton } from "@/components/ui/icon-button";
import { useWorkspace } from "@/store/workspace";
import { JsonCodeEditor, type JsonCodeEditorHandle } from "./JsonCodeEditor";

export function JsonSource({
  onHide,
  embedded = false,
}: {
  onHide?: () => void;
  embedded?: boolean;
}) {
  const doc = useWorkspace((s) => s.doc);
  const editorRef = useRef<JsonCodeEditorHandle>(null);

  if (!doc) return null;

  const actions = (
    <>
      <IconButton title="Minify" onClick={() => editorRef.current?.minify()}>
        <Minimize2 className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton title="Format JSON" onClick={() => editorRef.current?.format()}>
        <AlignLeft className="h-3.5 w-3.5" />
      </IconButton>
      <IconButton title="Copy JSON" onClick={() => editorRef.current?.copy()}>
        <Copy className="h-3.5 w-3.5" />
      </IconButton>
    </>
  );

  if (embedded) {
    return (
      <div className="flex h-full flex-col bg-[var(--source-bg)]">
        <div className="flex shrink-0 items-center justify-end gap-0.5 border-b border-border/60 px-2 py-1">
          {actions}
        </div>
        <JsonCodeEditor ref={editorRef} />
      </div>
    );
  }

  const lineCount = doc.raw ? doc.raw.split("\n").length : 0;

  return (
    <div className="flex h-full flex-col bg-[var(--source-bg)]">
      <PaneHeader
        title="Source"
        icon={<Code2 className="h-3.5 w-3.5" />}
        meta={`${lineCount.toLocaleString()} lines · valid`}
        actions={actions}
        hideSide="left"
        onHide={onHide}
      />
      <JsonCodeEditor ref={editorRef} />
    </div>
  );
}

import { useWorkspace } from "@/store/workspace";
import { formatPath, getAtPath, toJsonPointer, valueType } from "@/lib/json/path";
import { Button } from "@/components/ui/button";
import { Copy, Hash } from "lucide-react";
import { toast } from "sonner";

export function Inspector() {
  const { doc, selection } = useWorkspace();
  if (!doc) return null;
  const value = getAtPath(doc.value, selection);
  const type = valueType(value);
  const parent = selection.slice(0, -1);

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`Copied ${label}`);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-3">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Inspector</div>
        <div className="mt-1 break-all font-mono text-[12px] text-foreground">
          {formatPath(selection)}
        </div>
      </div>
      <div className="flex-1 space-y-4 overflow-auto p-4 text-sm">
        <Field label="Type">
          <TypeBadge type={type} />
        </Field>
        {(type === "string" || type === "number" || type === "boolean" || type === "null") && (
          <Field label="Value">
            <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md border border-border bg-muted/30 p-2 font-mono text-[12px]">
              {value === null ? "null" : String(value)}
            </pre>
          </Field>
        )}
        {type === "string" && (
          <Field label="Length">
            <span className="font-mono text-[12px]">{(value as string).length}</span>
          </Field>
        )}
        {type === "array" && (
          <Field label="Items">
            <span className="font-mono text-[12px]">{(value as unknown[]).length}</span>
          </Field>
        )}
        {type === "object" && (
          <Field label="Keys">
            <span className="font-mono text-[12px]">{Object.keys(value as object).length}</span>
          </Field>
        )}
        {(type === "object" || type === "array") && (
          <Field label="Preview">
            <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted/30 p-2 font-mono text-[11px] leading-5">
              {safeStringify(value)}
            </pre>
          </Field>
        )}
        {selection.length > 0 && (
          <Field label="Parent">
            <span className="font-mono text-[12px] text-muted-foreground">
              {formatPath(parent)}
            </span>
          </Field>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => copy(formatPath(selection), "path")}
            className="h-8 justify-start gap-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy path
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => copy(toJsonPointer(selection), "JSON pointer")}
            className="h-8 justify-start gap-2 text-xs"
          >
            <Hash className="h-3.5 w-3.5" />
            JSON pointer
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              copy(
                value === undefined ? "" : typeof value === "string" ? value : safeStringify(value),
                "value",
              )
            }
            className="col-span-2 h-8 justify-start gap-2 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy value
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const color: Record<string, string> = {
    string: "bg-json-string/15 text-json-string",
    number: "bg-json-number/15 text-json-number",
    boolean: "bg-json-bool/15 text-json-bool",
    null: "bg-json-null/15 text-json-null",
    array: "bg-brand/15 text-brand",
    object: "bg-brand/15 text-brand",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 font-mono text-[11px] ${
        color[type] ?? "bg-muted text-muted-foreground"
      }`}
    >
      {type}
    </span>
  );
}

function safeStringify(v: unknown) {
  try {
    const s = JSON.stringify(v, null, 2);
    return s.length > 4000 ? s.slice(0, 4000) + "\n… truncated" : s;
  } catch {
    return String(v);
  }
}

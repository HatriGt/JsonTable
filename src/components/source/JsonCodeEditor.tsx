import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { Annotation, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter } from "@codemirror/lint";
import { openSearchPanel } from "@codemirror/search";
import { toast } from "sonner";
import { appEditorTheme, appHighlighting } from "./codemirror-theme";
import { useWorkspace } from "@/store/workspace";
import { parseJson } from "@/lib/json/parse";
import { prettyPrint } from "@/lib/json/highlight";
import { cn } from "@/lib/utils";

const EDIT_DEBOUNCE_MS = 400;
const LARGE_EDIT_DEBOUNCE_MS = 700;
const LARGE_SOURCE_CHARS = 500_000;

// Marks transactions we dispatch programmatically (external sync, format,
// paste-reformat) so the update listener doesn't echo them back to the store.
const Programmatic = Annotation.define<boolean>();

export type JsonCodeEditorHandle = {
  /** Pretty-print the whole document. Returns false if it isn't valid JSON. */
  format: () => boolean;
  /** Minify the whole document. Returns false if it isn't valid JSON. */
  minify: () => boolean;
  /** Copy the current document text to the clipboard. */
  copy: () => void;
  /** Open CodeMirror's find/replace panel and focus the editor. */
  openSearch: () => void;
};

export const JsonCodeEditor = forwardRef<JsonCodeEditorHandle, { className?: string }>(
  function JsonCodeEditor({ className }, ref) {
    const hostRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Stable store accessors (zustand actions never change identity).
    const editRaw = useWorkspace((s) => s.editRaw);
    const doc = useWorkspace((s) => s.doc);
    const docRaw = doc?.raw ?? "";
    const docId = doc?.loadedAt ?? 0;

    // Keep the latest editRaw reachable from editor callbacks without
    // recreating the view.
    const editRawRef = useRef(editRaw);
    editRawRef.current = editRaw;

    const scheduleEdit = (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      const ms = value.length >= LARGE_SOURCE_CHARS ? LARGE_EDIT_DEBOUNCE_MS : EDIT_DEBOUNCE_MS;
      debounceRef.current = setTimeout(() => editRawRef.current(value), ms);
    };

    const replaceDoc = (view: EditorView, text: string) => {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        annotations: Programmatic.of(true),
      });
    };

    // Reformat the whole document when a paste leaves it as valid JSON.
    const formatOnPaste = (view: EditorView) => {
      const current = view.state.doc.toString();
      const result = parseJson(current);
      if (!result.ok) return; // leave as-is; the linter surfaces the error
      const formatted = prettyPrint(result.value, 2);
      if (formatted === current) {
        editRawRef.current(current);
        return;
      }
      replaceDoc(view, formatted);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      editRawRef.current(formatted);
    };

    // Create the editor once on mount.
    useEffect(() => {
      if (!hostRef.current) return;

      const view = new EditorView({
        parent: hostRef.current,
        state: EditorState.create({
          doc: useWorkspace.getState().doc?.raw ?? "",
          extensions: [
            basicSetup,
            json(),
            linter(jsonParseLinter()),
            appHighlighting,
            appEditorTheme,
            EditorView.lineWrapping,
            EditorView.updateListener.of((update) => {
              if (!update.docChanged) return;
              if (update.transactions.some((tr) => tr.annotation(Programmatic))) return;
              scheduleEdit(update.state.doc.toString());
            }),
            EditorView.domEventHandlers({
              paste: (_event, view) => {
                // Let CodeMirror apply the paste first, then reformat.
                queueMicrotask(() => formatOnPaste(view));
                return false;
              },
            }),
          ],
        }),
      });
      viewRef.current = view;

      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        view.destroy();
        viewRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // A new document loaded (different identity) — reset the editor content.
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      if (docRaw === view.state.doc.toString()) return;
      replaceDoc(view, docRaw);
      view.dispatch({ selection: { anchor: 0 }, annotations: Programmatic.of(true) });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [docId]);

    // External edits to the same document (e.g. grid edits, format/minify
    // elsewhere): sync in, but never while the user is actively typing here.
    useEffect(() => {
      const view = viewRef.current;
      if (!view) return;
      if (docRaw === view.state.doc.toString()) return;
      if (view.hasFocus) return;
      replaceDoc(view, docRaw);
    }, [docRaw]);

    useImperativeHandle(ref, () => ({
      format: () => {
        const view = viewRef.current;
        if (!view) return false;
        const result = parseJson(view.state.doc.toString());
        if (!result.ok) {
          toast.error("Invalid JSON");
          return false;
        }
        const formatted = prettyPrint(result.value, 2);
        replaceDoc(view, formatted);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        editRawRef.current(formatted);
        return true;
      },
      minify: () => {
        const view = viewRef.current;
        if (!view) return false;
        const result = parseJson(view.state.doc.toString());
        if (!result.ok) {
          toast.error("Invalid JSON");
          return false;
        }
        const minified = JSON.stringify(result.value);
        replaceDoc(view, minified);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        editRawRef.current(minified);
        return true;
      },
      copy: () => {
        const view = viewRef.current;
        if (!view) return;
        navigator.clipboard
          .writeText(view.state.doc.toString())
          .then(() => toast.success("Copied to clipboard"))
          .catch(() => toast.error("Copy failed"));
      },
      openSearch: () => {
        const view = viewRef.current;
        if (!view) return;
        view.focus();
        openSearchPanel(view);
      },
    }));

    return <div ref={hostRef} className={cn("min-h-0 flex-1 overflow-hidden", className)} />;
  },
);

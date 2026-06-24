import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// CodeMirror theme + JSON syntax highlighting wired to the app's existing CSS
// variables, so it matches the rest of the UI and follows dark/light mode
// automatically (the vars flip under `.dark`).

const SOURCE_LINE_HEIGHT = "21px";

export const appEditorTheme = EditorView.theme({
  "&": {
    color: "var(--foreground)",
    backgroundColor: "var(--source-bg)",
    fontSize: "12.5px",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: SOURCE_LINE_HEIGHT,
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
    paddingBlock: "0.5rem",
    paddingLeft: "0.75rem",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--foreground)",
  },
  "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
    {
      backgroundColor: "color-mix(in oklab, var(--brand) 26%, transparent)",
    },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklab, var(--brand) 6%, transparent)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--source-bg)",
    color: "color-mix(in oklab, var(--muted-foreground) 60%, transparent)",
    borderRight: "1px solid var(--gutter-border)",
    paddingRight: "0.25rem",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklab, var(--brand) 6%, transparent)",
    color: "var(--foreground)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 0.5rem 0 0.875rem",
    minWidth: "2.25rem",
    textAlign: "right",
  },
  ".cm-foldGutter .cm-gutterElement": {
    color: "color-mix(in oklab, var(--muted-foreground) 70%, transparent)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.1rem",
    padding: "0",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "color-mix(in oklab, var(--muted-foreground) 18%, transparent)",
    border: "none",
    color: "var(--muted-foreground)",
    borderRadius: "3px",
    padding: "0 4px",
    margin: "0 2px",
  },
  ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
    backgroundColor: "color-mix(in oklab, var(--brand) 22%, transparent)",
    outline: "none",
  },
  ".cm-selectionMatch": {
    backgroundColor: "color-mix(in oklab, var(--brand) 14%, transparent)",
  },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in oklab, var(--brand) 22%, transparent)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "color-mix(in oklab, var(--brand) 40%, transparent)",
  },
  ".cm-panels": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
  },
});

const appHighlightStyle = HighlightStyle.define([
  { tag: [t.propertyName], color: "var(--json-key)" },
  { tag: [t.string], color: "var(--json-string)" },
  { tag: [t.number], color: "var(--json-number)" },
  { tag: [t.bool, t.keyword], color: "var(--json-bool)" },
  { tag: [t.null], color: "var(--json-null)", fontStyle: "italic" },
  {
    tag: [t.punctuation, t.separator, t.bracket, t.brace, t.squareBracket],
    color: "var(--muted-foreground)",
  },
  { tag: [t.invalid], color: "var(--destructive)" },
]);

export const appHighlighting = syntaxHighlighting(appHighlightStyle);

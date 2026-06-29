import { Fragment, type ReactNode } from "react";

// Tokenize a pretty-printed JSON string and color each token with the same
// palette used by the tree/grid (text-json-* classes). Strings followed by a
// colon are object keys; everything else is a value.
const TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export function highlightJson(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(TOKEN_RE);
  let m: RegExpExecArray | null;

  // Keys are the token's character offset in the source, prefixed by kind. They
  // are unique within a render and stable across renders for the same input, so
  // React reuses nodes instead of rebuilding them every keystroke.
  while ((m = re.exec(code)) !== null) {
    if (m.index > last) {
      nodes.push(<Fragment key={`g${last}`}>{code.slice(last, m.index)}</Fragment>);
    }

    const [, str, colon, keyword, num] = m;
    const at = m.index;
    if (str !== undefined) {
      if (colon !== undefined) {
        nodes.push(
          <span key={`k${at}`} className="text-json-key">
            {str}
          </span>,
        );
        nodes.push(<Fragment key={`c${at}`}>{colon}</Fragment>);
      } else {
        nodes.push(
          <span key={`s${at}`} className="text-json-string">
            {str}
          </span>,
        );
      }
    } else if (keyword !== undefined) {
      nodes.push(
        <span
          key={`w${at}`}
          className={keyword === "null" ? "text-json-null italic" : "text-json-bool"}
        >
          {keyword}
        </span>,
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={`n${at}`} className="text-json-number">
          {num}
        </span>,
      );
    }

    last = m.index + m[0].length;
  }

  if (last < code.length) {
    nodes.push(<Fragment key={`g${last}`}>{code.slice(last)}</Fragment>);
  }

  return nodes;
}

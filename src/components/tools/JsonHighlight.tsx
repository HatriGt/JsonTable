import { Fragment, type ReactNode } from "react";

// Tokenize a pretty-printed JSON string and color each token with the same
// palette used by the tree/grid (text-json-* classes). Strings followed by a
// colon are object keys; everything else is a value.
const TOKEN_RE =
  /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

export function highlightJson(code: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  const re = new RegExp(TOKEN_RE);
  let m: RegExpExecArray | null;

  while ((m = re.exec(code)) !== null) {
    if (m.index > last) {
      nodes.push(<Fragment key={key++}>{code.slice(last, m.index)}</Fragment>);
    }

    const [, str, colon, keyword, num] = m;
    if (str !== undefined) {
      if (colon !== undefined) {
        nodes.push(
          <span key={key++} className="text-json-key">
            {str}
          </span>,
        );
        nodes.push(<Fragment key={key++}>{colon}</Fragment>);
      } else {
        nodes.push(
          <span key={key++} className="text-json-string">
            {str}
          </span>,
        );
      }
    } else if (keyword !== undefined) {
      nodes.push(
        <span
          key={key++}
          className={keyword === "null" ? "text-json-null italic" : "text-json-bool"}
        >
          {keyword}
        </span>,
      );
    } else if (num !== undefined) {
      nodes.push(
        <span key={key++} className="text-json-number">
          {num}
        </span>,
      );
    }

    last = m.index + m[0].length;
  }

  if (last < code.length) {
    nodes.push(<Fragment key={key++}>{code.slice(last)}</Fragment>);
  }

  return nodes;
}

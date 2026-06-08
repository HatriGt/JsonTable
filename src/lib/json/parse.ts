export type ParseError = {
  message: string;
  line: number;
  column: number;
  position: number;
};

export type ParseResult =
  | { ok: true; value: unknown; error: null }
  | { ok: false; value: null; error: ParseError };

export function parseJson(raw: string): ParseResult {
  const text = raw ?? "";
  if (!text.trim()) {
    return {
      ok: false,
      value: null,
      error: { message: "Empty input", line: 1, column: 1, position: 0 },
    };
  }
  try {
    return { ok: true, value: JSON.parse(text), error: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const pos = extractPosition(msg);
    const { line, column } = positionToLineCol(text, pos);
    return {
      ok: false,
      value: null,
      error: { message: humanize(msg), line, column, position: pos },
    };
  }
}

function extractPosition(msg: string): number {
  const m = msg.match(/position\s+(\d+)/i);
  return m ? Number(m[1]) : 0;
}

function positionToLineCol(text: string, pos: number) {
  let line = 1;
  let column = 1;
  for (let i = 0; i < pos && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function humanize(msg: string): string {
  return msg
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/\s*in JSON at position \d+.*$/i, "")
    .replace(/^Unexpected token/i, "Unexpected token");
}

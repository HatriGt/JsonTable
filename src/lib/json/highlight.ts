// Pretty-print + tokenize JSON into spans for syntax highlighting.

export type Token = { t: "key" | "string" | "number" | "bool" | "null" | "punct" | "ws"; v: string };

export function prettyPrint(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

// Tokenize a single line of formatted JSON. Good enough for display.
export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = line.length;

  while (i < n) {
    const ch = line[i];

    // whitespace
    if (ch === " " || ch === "\t") {
      let j = i;
      while (j < n && (line[j] === " " || line[j] === "\t")) j++;
      tokens.push({ t: "ws", v: line.slice(i, j) });
      i = j;
      continue;
    }

    // string (key or value)
    if (ch === '"') {
      let j = i + 1;
      while (j < n) {
        if (line[j] === "\\") {
          j += 2;
          continue;
        }
        if (line[j] === '"') {
          j++;
          break;
        }
        j++;
      }
      const str = line.slice(i, j);
      // peek next non-ws char to decide key vs string
      let k = j;
      while (k < n && (line[k] === " " || line[k] === "\t")) k++;
      const isKey = line[k] === ":";
      tokens.push({ t: isKey ? "key" : "string", v: str });
      i = j;
      continue;
    }

    // number
    if (/[-0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[-0-9.eE+]/.test(line[j])) j++;
      tokens.push({ t: "number", v: line.slice(i, j) });
      i = j;
      continue;
    }

    // true/false/null
    if (line.startsWith("true", i)) {
      tokens.push({ t: "bool", v: "true" });
      i += 4;
      continue;
    }
    if (line.startsWith("false", i)) {
      tokens.push({ t: "bool", v: "false" });
      i += 5;
      continue;
    }
    if (line.startsWith("null", i)) {
      tokens.push({ t: "null", v: "null" });
      i += 4;
      continue;
    }

    // punctuation { } [ ] , :
    tokens.push({ t: "punct", v: ch });
    i++;
  }

  return tokens;
}
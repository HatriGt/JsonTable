// Pretty-print JSON for the source editor.

export function prettyPrint(value: unknown, indent = 2): string {
  try {
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}

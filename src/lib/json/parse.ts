/**
 * Parse strategy (benchmarked against WASM options like vectorjson/simdjson):
 * - Full materialization for grid/tree needs a plain JS object graph.
 * - For 256KB–10MB payloads, JSON.parse in a Web Worker matches or beats WASM parsers;
 *   structured clone back to the main thread is highly optimized in Chromium.
 * - JSONGrid (jsongrid.com) also uses plain JSON.parse + deferred/virtualized UI — no WASM.
 * WASM only wins for streaming or partial field access, which we do not use today.
 */
export type ParseError = {
  message: string;
  line: number;
  column: number;
  position: number;
};

export type ParseResult =
  | { ok: true; value: unknown; error: null }
  | { ok: false; value: null; error: ParseError };

/** JSON payloads at or above this size are parsed off the main thread. */
export const LARGE_JSON_BYTES = 256 * 1024;

/** Files at or above this size use conservative UI defaults (collapsed nesting, no recents). */
export const HUGE_JSON_BYTES = 512 * 1024;

let worker: Worker | null = null;
let workerReqId = 0;
const workerWaiters = new Map<
  number,
  { resolve: (r: ParseResult) => void; reject: (e: Error) => void }
>();

function getParseWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./parse.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<{ id: number; result: ParseResult }>) => {
      const waiter = workerWaiters.get(event.data.id);
      if (!waiter) return;
      workerWaiters.delete(event.data.id);
      waiter.resolve(event.data.result);
    };
    worker.onerror = (event) => {
      for (const [, waiter] of workerWaiters) {
        waiter.reject(new Error(event.message || "JSON parse worker failed"));
      }
      workerWaiters.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

function parseInWorker(raw: string): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const id = ++workerReqId;
    workerWaiters.set(id, { resolve, reject });
    getParseWorker().postMessage({ id, raw });
  });
}

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    const sched = (
      globalThis as typeof globalThis & {
        scheduler?: { postTask?: (cb: () => void, opts?: { priority?: string }) => void };
      }
    ).scheduler;
    if (sched?.postTask) {
      sched.postTask(() => resolve(), { priority: "user-blocking" });
      return;
    }
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(() => resolve(), { timeout: 50 });
      return;
    }
    setTimeout(resolve, 0);
  });
}

export async function parseJsonAsync(raw: string): Promise<ParseResult> {
  if (raw.length < LARGE_JSON_BYTES) {
    return parseJson(raw);
  }
  await yieldToMain();
  return parseInWorker(raw);
}

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

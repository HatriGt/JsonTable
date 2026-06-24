// Shareable links encode the document into the URL fragment (#share=…) so the
// JSON never leaves the browser — the fragment is not sent to the server. The
// payload is deflate-compressed (when the browser supports CompressionStream)
// and base64url-encoded so it survives copy/paste and address bars.

export const SHARE_HASH_KEY = "share";

// Links much larger than this are unwieldy and may be truncated by some
// clients (chat apps, email). We still generate them, but warn the caller.
export const SHARE_URL_WARN_BYTES = 16_000;

// At/above this raw size we stop encoding the document into the URL and switch
// to a server-backed short link (/workspace/link/{id}). Below it, the inline
// path is used and the data never leaves the browser.
export const SHARE_INLINE_MAX_BYTES = 32 * 1024;

// Hard cap on what we'll accept into the server store, to protect the free
// storage tier. Above this we offer Download only.
export const SHARE_SERVER_MAX_BYTES = 5 * 1024 * 1024;

// Server short links expire after 30 days.
export const SHARE_TTL_SECONDS = 30 * 24 * 60 * 60;

/** UTF-8 byte length of a string. */
export function byteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}

/** True when the document is too large to embed in a URL and needs a short link. */
export function needsServerShare(raw: string): boolean {
  return byteLength(raw) >= SHARE_INLINE_MAX_BYTES;
}

/** True when the document is too large even for the server store. */
export function exceedsServerLimit(raw: string): boolean {
  return byteLength(raw) > SHARE_SERVER_MAX_BYTES;
}

/** Build the full short-link URL for the current origin. */
export function buildShortLinkUrl(id: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/workspace/link/${id}`;
}

/** Trigger a client-side download of the raw JSON as a .json file. */
export function downloadJson(name: string, raw: string): void {
  const fileName = name.toLowerCase().endsWith(".json") ? name : `${name || "data"}.json`;
  const blob = new Blob([raw], { type: "application/json" });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(href);
}

type SharePayload = {
  /** file name */
  n: string;
  /** raw JSON text */
  r: string;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function hasCompressionStream(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new CompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  void writer.write(bytes as BufferSource);
  void writer.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new DecompressionStream("deflate-raw");
  const writer = stream.writable.getWriter();
  void writer.write(bytes as BufferSource);
  void writer.close();
  return new Uint8Array(await new Response(stream.readable).arrayBuffer());
}

/**
 * Encode a document into a share token. The first character flags the encoding:
 * "c" = compressed, "u" = uncompressed (fallback).
 */
export async function encodeShare(name: string, raw: string): Promise<string> {
  const payload: SharePayload = { n: name, r: raw };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  if (hasCompressionStream()) {
    return "c" + toBase64Url(await deflate(bytes));
  }
  return "u" + toBase64Url(bytes);
}

/** Decode a share token back into a document, or null if it is malformed. */
export async function decodeShare(token: string): Promise<{ name: string; raw: string } | null> {
  try {
    const flag = token[0];
    const body = token.slice(1);
    if (!body) return null;
    const bytes = fromBase64Url(body);
    const json =
      flag === "c"
        ? new TextDecoder().decode(await inflate(bytes))
        : new TextDecoder().decode(bytes);
    const payload = JSON.parse(json) as SharePayload;
    if (typeof payload?.n !== "string" || typeof payload?.r !== "string") return null;
    return { name: payload.n, raw: payload.r };
  } catch {
    return null;
  }
}

/** Build the full shareable URL for the current origin. */
export async function buildShareUrl(name: string, raw: string): Promise<string> {
  const token = await encodeShare(name, raw);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/workspace#${SHARE_HASH_KEY}=${token}`;
}

/** Read a share token from a URL hash like "#share=…", or null if absent. */
export function readShareToken(hash: string): string | null {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(clean);
  return params.get(SHARE_HASH_KEY);
}

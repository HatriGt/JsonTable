import process from "node:process";
import type { Client } from "@libsql/client";

import { SHARE_TTL_SECONDS } from "./share";

// Server-only storage for share short links. The .server.ts suffix keeps this
// out of the client bundle.
//
// Backend: Turso (libSQL/SQLite over HTTP) when TURSO_DATABASE_URL is set —
// its free tier (5 GB) is far more than enough for share links. Without the
// env vars we fall back to an in-process Map, which works for a single dev
// server session but is NOT durable in serverless production (each invocation
// may get a fresh process).

export type ShareRecord = { name: string; raw: string };

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/** ~10-char base62 id from crypto random bytes. */
function generateId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let id = "";
  for (const b of bytes) id += BASE62[b % 62];
  return id;
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

// ---- libSQL (Turso) backend ----------------------------------------------

let clientPromise: Promise<Client> | null = null;

function getClient(): Promise<Client> | null {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) return null;
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
      await client.execute(
        `CREATE TABLE IF NOT EXISTS shares (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           raw TEXT NOT NULL,
           created_at INTEGER NOT NULL,
           expires_at INTEGER NOT NULL
         )`,
      );
      return client;
    })();
  }
  return clientPromise;
}

// ---- in-memory fallback ---------------------------------------------------

type MemRecord = ShareRecord & { expiresAt: number };
const memStore = new Map<string, MemRecord>();
let warnedMemory = false;

function warnMemoryOnce() {
  if (warnedMemory) return;
  warnedMemory = true;
  console.warn(
    "[share] TURSO_DATABASE_URL is not set — using a non-durable in-memory store. " +
      "Short links will not survive across serverless invocations.",
  );
}

// ---- public API -----------------------------------------------------------

export async function putShare(record: ShareRecord): Promise<string> {
  const id = generateId();
  const createdAt = nowSeconds();
  const expiresAt = createdAt + SHARE_TTL_SECONDS;

  const clientP = getClient();
  if (clientP) {
    const client = await clientP;
    await client.execute({
      sql: "INSERT INTO shares (id, name, raw, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
      args: [id, record.name, record.raw, createdAt, expiresAt],
    });
    return id;
  }

  warnMemoryOnce();
  memStore.set(id, { ...record, expiresAt });
  return id;
}

export async function getShare(id: string): Promise<ShareRecord | null> {
  const now = nowSeconds();

  const clientP = getClient();
  if (clientP) {
    const client = await clientP;
    const result = await client.execute({
      sql: "SELECT name, raw FROM shares WHERE id = ? AND expires_at > ?",
      args: [id, now],
    });
    const row = result.rows[0];
    if (!row) return null;
    return { name: String(row.name), raw: String(row.raw) };
  }

  warnMemoryOnce();
  const record = memStore.get(id);
  if (!record) return null;
  if (record.expiresAt <= now) {
    memStore.delete(id);
    return null;
  }
  return { name: record.name, raw: record.raw };
}

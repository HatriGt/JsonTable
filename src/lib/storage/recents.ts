import { get, set, del, keys } from "idb-keyval";

const PREFIX = "doc:";
const INDEX_KEY = "doc-index";

export type RecentMeta = {
  id: string;
  name: string;
  sizeBytes: number;
  savedAt: number;
};

function dedupeByName(items: RecentMeta[]): RecentMeta[] {
  const sorted = [...items].sort((a, b) => b.savedAt - a.savedAt);
  const seen = new Set<string>();
  return sorted.filter((item) => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}

export async function listRecents(): Promise<RecentMeta[]> {
  const idx = (await get<RecentMeta[]>(INDEX_KEY)) ?? [];
  const deduped = dedupeByName(idx);

  if (deduped.length !== idx.length) {
    const removed = idx.filter((r) => !deduped.some((d) => d.id === r.id));
    for (const old of removed) await del(PREFIX + old.id);
    await set(INDEX_KEY, deduped);
  }

  return deduped;
}

export async function saveRecent(name: string, raw: string): Promise<RecentMeta> {
  const sizeBytes = new Blob([raw]).size;
  const idx = await listRecents();
  const existing = idx.find((r) => r.name === name);

  if (existing) {
    const meta: RecentMeta = { ...existing, sizeBytes, savedAt: Date.now() };
    await set(PREFIX + existing.id, raw);
    const next = [meta, ...idx.filter((r) => r.id !== existing.id)].slice(0, 8);
    await set(INDEX_KEY, next);
    return meta;
  }

  const id = crypto.randomUUID();
  const meta: RecentMeta = { id, name, sizeBytes, savedAt: Date.now() };
  await set(PREFIX + id, raw);
  const next = [meta, ...idx].slice(0, 8);
  const removed = idx.filter((r) => !next.some((n) => n.id === r.id));
  for (const old of removed) await del(PREFIX + old.id);
  await set(INDEX_KEY, next);
  return meta;
}

export async function loadRecent(id: string): Promise<string | undefined> {
  return await get<string>(PREFIX + id);
}

export async function deleteRecent(id: string): Promise<void> {
  await del(PREFIX + id);
  const idx = await listRecents();
  await set(
    INDEX_KEY,
    idx.filter((r) => r.id !== id),
  );
}

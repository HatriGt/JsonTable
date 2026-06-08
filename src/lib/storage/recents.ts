import { get, set, del, keys } from "idb-keyval";

const PREFIX = "doc:";
const INDEX_KEY = "doc-index";

export type RecentMeta = {
  id: string;
  name: string;
  sizeBytes: number;
  savedAt: number;
};

export async function listRecents(): Promise<RecentMeta[]> {
  const idx = (await get<RecentMeta[]>(INDEX_KEY)) ?? [];
  return idx.sort((a, b) => b.savedAt - a.savedAt);
}

export async function saveRecent(name: string, raw: string): Promise<RecentMeta> {
  const id = crypto.randomUUID();
  const meta: RecentMeta = {
    id,
    name,
    sizeBytes: new Blob([raw]).size,
    savedAt: Date.now(),
  };
  await set(PREFIX + id, raw);
  const idx = await listRecents();
  const next = [meta, ...idx].slice(0, 8);
  for (const old of idx.slice(7)) await del(PREFIX + old.id);
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

export async function _clearAll() {
  for (const k of await keys()) await del(k);
}

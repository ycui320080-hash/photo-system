import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
mkdirSync('.data', { recursive: true });
export const db = new DatabaseSync(resolve('.data/studio.sqlite'));
db.exec(
  'PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS records(collection TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(collection,id)); CREATE TABLE IF NOT EXISTS local_files(id TEXT PRIMARY KEY,order_id TEXT,path TEXT,preview_id TEXT,sync_status TEXT,created_at TEXT);',
);
export function list<T>(collection: string): T[] {
  return db
    .prepare('SELECT data FROM records WHERE collection=?')
    .all(collection)
    .map((r) => JSON.parse(String(r.data)));
}
export function get<T>(collection: string, id: string): T {
  const r = db.prepare('SELECT data FROM records WHERE collection=? AND id=?').get(collection, id);
  if (!r) throw Error('记录不存在');
  return JSON.parse(String(r.data));
}
export function save<T extends { id: string }>(collection: string, data: T) {
  const row = db
    .prepare('SELECT data FROM records WHERE collection=? AND id=?')
    .get(collection, data.id);
  const previous = row ? JSON.parse(String(row.data)) : {};
  const value = data as T & { createdAt?: string; updatedAt?: string; status?: string };
  const now = new Date().toISOString();
  Object.assign(data, {
    createdAt: value.createdAt || previous.createdAt || now,
    updatedAt: now,
    status: value.status || previous.status || 'active',
  });
  db.prepare(
    'INSERT INTO records VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET data=excluded.data',
  ).run(collection, data.id, JSON.stringify(data));
  return data;
}
export function log(actor: string, action: string, target: string) {
  save('operation_logs', {
    id: randomUUID(),
    actor,
    action,
    target,
    createdAt: new Date().toISOString(),
  });
}

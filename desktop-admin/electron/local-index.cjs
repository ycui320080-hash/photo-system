const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto');
let database;
const dir = process.env.STUDIO_INDEX_DIR || path.resolve(__dirname, '../../.data/electron');
const file = path.join(dir, 'local-index.sqlite');
function flush() {
  fs.writeFileSync(file, Buffer.from(database.export()));
}
exports.init = async () => {
  fs.mkdirSync(dir, { recursive: true });
  const SQL = await require('sql.js')();
  database = fs.existsSync(file) ? new SQL.Database(fs.readFileSync(file)) : new SQL.Database();
  database.run(
    `CREATE TABLE IF NOT EXISTS local_files(id TEXT PRIMARY KEY,order_id TEXT NOT NULL,original_path TEXT NOT NULL,preview_id TEXT,sync_status TEXT NOT NULL,created_at TEXT NOT NULL);CREATE TABLE IF NOT EXISTS settings(id TEXT PRIMARY KEY,value TEXT NOT NULL);CREATE TABLE IF NOT EXISTS upload_jobs(id TEXT PRIMARY KEY,order_id TEXT NOT NULL,source_path TEXT NOT NULL,kind TEXT NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,last_error TEXT NOT NULL DEFAULT '',next_retry INTEGER NOT NULL DEFAULT 0)`,
  );
  database.run("UPDATE upload_jobs SET status='failed' WHERE status='uploading'");
  flush();
};
exports.add = (orderId, originalPath, previewId) => {
  const id = crypto
    .createHash('sha256')
    .update(orderId + originalPath + previewId)
    .digest('hex');
  database.run('INSERT OR IGNORE INTO local_files VALUES(?,?,?,?,?,?)', [
    id,
    orderId,
    originalPath,
    previewId,
    'synced',
    new Date().toISOString(),
  ]);
  flush();
};
exports.enqueue = (orderId, sourcePath, kind, fingerprint = '') => {
  const id = crypto
    .createHash('sha256')
    .update(orderId + sourcePath + kind + fingerprint)
    .digest('hex');
  database.run(
    "INSERT OR IGNORE INTO upload_jobs(id,order_id,source_path,kind,status) VALUES(?,?,?,?,'pending')",
    [id, orderId, sourcePath, kind],
  );
  flush();
  return id;
};
exports.jobs = () => {
  const query = database.prepare('SELECT * FROM upload_jobs');
  const result = [];
  while (query.step()) result.push(query.getAsObject());
  query.free();
  return result;
};
exports.update = (id, status, error = '') => {
  const attempts =
    (exports.jobs().find((j) => j.id === id)?.attempts || 0) + (status === 'uploading' ? 1 : 0);
  const next = status === 'failed' ? Date.now() + Math.min(300000, 1000 * 2 ** attempts) : 0;
  database.run('UPDATE upload_jobs SET status=?,attempts=?,last_error=?,next_retry=? WHERE id=?', [
    status,
    attempts,
    error,
    next,
    id,
  ]);
  flush();
};
exports.setting = (id, value) => {
  if (value !== undefined) {
    database.run('INSERT OR REPLACE INTO settings VALUES(?,?)', [id, String(value)]);
    flush();
  }
  const rows = database.exec('SELECT value FROM settings WHERE id=?', [id]);
  return rows[0]?.values[0]?.[0] || '';
};

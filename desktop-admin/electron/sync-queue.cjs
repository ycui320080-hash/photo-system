const fs = require('node:fs/promises'),
  path = require('node:path');
const index = require('./local-index.cjs');
let running = false;
exports.run = async (token, force = false) => {
  if (running) return { busy: true };
  running = true;
  try {
    for (const job of index
      .jobs()
      .filter(
        (j) =>
          !j.kind.startsWith('cloud-') &&
          ['pending', 'failed'].includes(j.status) &&
          (force || j.next_retry <= Date.now()),
      )) {
      index.update(job.id, 'uploading');
      try {
        const info = await fs.stat(job.source_path);
        if (info.size > 10485760) throw Error('文件超过10MB');
        const bytes = await fs.readFile(job.source_path),
          ext = path.extname(job.source_path).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const form = new FormData();
        form.append('files', new Blob([bytes], { type: mime }), path.basename(job.source_path));
        form.append('kind', job.kind);
        form.append('uploadKey', job.id);
        const response = await fetch(
          'http://127.0.0.1:8787/api/orders/' + job.order_id + '/photos',
          {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token },
            body: form,
            signal: AbortSignal.timeout(60000),
          },
        );
        const result = await response.json();
        if (!result.ok) throw Error(result.error);
        const photos = job.kind === 'delivery' ? result.data.delivery : result.data.photos;
        const photo = photos.find((p) => p.uploadKey === job.id) || photos[photos.length - 1];
        index.add(job.order_id, job.source_path, photo.id);
        index.update(job.id, 'synced');
      } catch (e) {
        index.update(job.id, 'failed', String(e.message).slice(0, 300));
      }
    }
    return {
      jobs: index
        .jobs()
        .map(({ source_path, ...job }) => ({ ...job, name: path.basename(source_path) })),
    };
  } finally {
    running = false;
  }
};

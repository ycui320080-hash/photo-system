const { dialog, ipcMain } = require('electron');
const fs = require('node:fs/promises'),
  path = require('node:path');
const index = require('./local-index.cjs');
exports.register = (win) => {
  ipcMain.handle('read-cloud-photos', async (event, input) => {
    if (event.sender !== win.webContents) throw Error('来源无效');
    if (input.orderId) {
      if (!/^[a-zA-Z0-9-]{1,100}$/.test(input.orderId)) throw Error('订单编号无效');
      const picked = await dialog.showOpenDialog(win, {
        properties: ['openFile', 'multiSelections'],
        defaultPath: index.setting('defaultDirectory') || undefined,
        filters: [{ name: '照片', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
      });
      if (picked.canceled) return [];
      if (picked.filePaths.length > 20) throw Error('每批最多20张');
      for (const file of picked.filePaths) {
        const info = await fs.stat(file);
        index.enqueue(
          input.orderId,
          file,
          input.kind === 'delivery' ? 'cloud-delivery' : 'cloud-preview',
          String(info.size) + ':' + info.mtimeMs,
        );
      }
    }
    const pending = index
      .jobs()
      .filter((j) => j.kind.startsWith('cloud-') && j.status !== 'synced');
    const result = [];
    for (const job of pending) {
      try {
        const info = await fs.stat(job.source_path);
        if (info.size > 10485760) throw Error('照片超过10MB');
        const bytes = await fs.readFile(job.source_path);
        index.update(job.id, 'uploading');
        result.push({
          id: job.id,
          orderId: job.order_id,
          kind: job.kind.replace('cloud-', ''),
          name: path.basename(job.source_path),
          bytes,
        });
      } catch (e) {
        index.update(job.id, 'failed', e.message);
      }
    }
    return result;
  });
  ipcMain.handle('cloud-photo-result', async (event, input) => {
    if (event.sender !== win.webContents) throw Error('来源无效');
    const job = index.jobs().find((j) => j.id === input.jobId && j.kind.startsWith('cloud-'));
    if (!job) throw Error('未知任务');
    if (input.error) {
      index.update(job.id, 'failed', String(input.error).slice(0, 300));
      return;
    }
    if (!/^[a-zA-Z0-9-]{1,100}$/.test(input.photoId)) throw Error('照片编号无效');
    index.add(job.order_id, job.source_path, input.photoId);
    index.update(job.id, 'synced');
  });
};

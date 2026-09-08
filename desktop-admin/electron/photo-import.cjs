const { dialog, ipcMain } = require('electron');
const path = require('node:path');
const index = require('./local-index.cjs'),
  queue = require('./sync-queue.cjs');
exports.register = (win) => {
  const guard = (event, input) => {
    if (event.sender !== win.webContents || !input || typeof input.token !== 'string')
      throw Error('请求无效');
  };
  ipcMain.handle('import-photos', async (event, input) => {
    guard(event, input);
    if (!/^[A-Za-z0-9-]{1,100}$/.test(input.orderId)) throw Error('订单编号无效');
    const picked = await dialog.showOpenDialog(win, {
      properties: ['openFile', 'multiSelections'],
      defaultPath: index.setting('defaultDirectory') || undefined,
      filters: [{ name: '照片', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
    });
    if (picked.canceled) return { cancelled: true };
    if (picked.filePaths.length > 20) throw Error('每次最多20张');
    for (const file of picked.filePaths) {
      const info = await require('node:fs/promises').stat(file);
      index.enqueue(
        input.orderId,
        file,
        input.kind === 'delivery' ? 'delivery' : 'preview',
        String(info.size) + ':' + info.mtimeMs,
      );
    }
    return queue.run(input.token, true);
  });
  ipcMain.handle('retry-photos', async (event, input) => {
    guard(event, input);
    return queue.run(input.token, true);
  });
  ipcMain.handle('sync-status', async (event) => {
    if (event.sender !== win.webContents) throw Error('请求无效');
    return {
      jobs: index
        .jobs()
        .map(({ source_path, ...job }) => ({ ...job, name: path.basename(source_path) })),
      directory: index.setting('defaultDirectory'),
    };
  });
  ipcMain.handle('choose-directory', async (event) => {
    if (event.sender !== win.webContents) throw Error('请求无效');
    const picked = await dialog.showOpenDialog(win, { properties: ['openDirectory'] });
    if (!picked.canceled) index.setting('defaultDirectory', picked.filePaths[0]);
    return index.setting('defaultDirectory');
  });
};

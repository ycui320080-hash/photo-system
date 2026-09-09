const { BrowserWindow, ipcMain } = require('electron');
exports.register = (win) => {
  ipcMain.handle('list-printers', async (event) => {
    if (event.sender !== win.webContents) throw Error('请求无效');
    const printers = await win.webContents.getPrintersAsync();
    return printers.map(({ name, status, isDefault }) => ({ name, status, isDefault }));
  });
  ipcMain.handle('print-photos', async (event, input) => {
    if (event.sender !== win.webContents || !input || typeof input.html !== 'string')
      throw Error('请求无效');
    if (input.html.length > 80000000) throw Error('打印内容过大');
    const copies = Math.min(Math.max(Number(input.copies) || 1, 1), 50);
    const printWin = new BrowserWindow({ show: false, webPreferences: { sandbox: true } });
    try {
      await printWin.webContents.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(input.html),
      );
      const options = { printBackground: true, copies };
      if (typeof input.deviceName === 'string' && input.deviceName) {
        options.deviceName = input.deviceName;
        options.silent = true;
      } else {
        printWin.show();
      }
      return await new Promise((resolve) => {
        printWin.webContents.print(options, (success, reason) => {
          resolve({ success, reason: success ? '' : String(reason || '') });
        });
      });
    } finally {
      printWin.destroy();
    }
  });
};

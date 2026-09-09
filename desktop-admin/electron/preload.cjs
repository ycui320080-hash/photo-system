const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('studio', {
  readCloudPhotos: (input) => ipcRenderer.invoke('read-cloud-photos', input),
  cloudPhotoResult: (input) => ipcRenderer.invoke('cloud-photo-result', input),
  importPhotos: (input) => ipcRenderer.invoke('import-photos', input),
  retryPhotos: (input) => ipcRenderer.invoke('retry-photos', input),
  syncStatus: () => ipcRenderer.invoke('sync-status'),
  chooseDirectory: () => ipcRenderer.invoke('choose-directory'),
  listPrinters: () => ipcRenderer.invoke('list-printers'),
  printPhotos: (input) => ipcRenderer.invoke('print-photos', input),
});

// !!! https://electron-vite.org/guide/dev !!!
import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Database } from '../common/types';

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', {
      getDirectoryStructure: (dirPath?: string, maxDepth?: number) =>
        ipcRenderer.invoke('getDirectoryStructure', dirPath, maxDepth),
      readDb: async () => ipcRenderer.invoke('readDb'),
      writeDb: (database: Database) => ipcRenderer.invoke('writeDb', database),
      getDbPath: async () => ipcRenderer.invoke('getDbPath')
    });
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.api = {
    getDirectoryStructure: (dirPath?: string, maxDepth?: number) =>
      ipcRenderer.invoke('getDirectoryStructure', dirPath, maxDepth),
    readDb: async () => ipcRenderer.invoke('readDb'),
    writeDb: (database: Database) => ipcRenderer.invoke('writeDb', database),
    getDbPath: async () => ipcRenderer.invoke('getDbPath')
  };
}

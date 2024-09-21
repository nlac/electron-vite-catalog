import { ElectronAPI } from '@electron-toolkit/preload';
import type { Database, FsEntry } from '../common/types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      getDirectoryStructure: (dirPath?: string, maxDepth?: number) => Promise<FsEntry[]>;
      readDb: () => Promise<Database>;
      writeDb: (database: Database) => Promise<any>;
      getDbPath: () => Promise<string>;
    };
  }
}

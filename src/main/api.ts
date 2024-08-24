import fs from 'fs';
import path from 'path';
import drivelist from 'drivelist';
import { app } from 'electron';
import { FsEntryType } from '../common/types';
import type { FsEntry, SearchResult, Database } from '../common/types';
import {
  removePartitionLetter,
  writePartitionLabel,
  PARTITION_ID_FILE,
  readPartitionLabel
} from './fs-utils';
import { sortFsEntries } from '../common/utils';

let dbPath: string = '';

const getRemovableDrives = async (): Promise<FsEntry[]> => {
  const drives = await drivelist.list();
  return drives
    .filter((drive) => drive.isRemovable)
    .map((drive) => ({
      type: FsEntryType.Drive,
      label: drive.description,
      fullPath: '',
      children: drive.mountpoints
        .map((mp) => ({
          type: FsEntryType.Partition,
          label: readPartitionLabel(mp.path),
          fullPath: mp.path
          // no children yet
        }))
        .sort(sortFsEntries)
    }))
    .sort(sortFsEntries);
};

const getFolderChildren = (dirPath: string): FsEntry[] => {
  const children: FsEntry[] = [];
  try {
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
      try {
        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          children.push({
            type: FsEntryType.Folder,
            label: item,
            fullPath: removePartitionLetter(fullPath)
            //children: []
          });
        } else if (stats.isFile() && item !== PARTITION_ID_FILE) {
          children.push({
            type: FsEntryType.File,
            label: item,
            fullPath: removePartitionLetter(fullPath)
          });
        }
      } catch (err: any) {
        console.error(err.message);
      }
    }
  } catch (err: any) {
    console.error(err.message);
  }
  return children.sort(sortFsEntries);
};

export const getDirectoryStructure = async (
  dirPath: string = '', // must be a valid fs path
  maxDepth: number = 1,
  level = 0
) => {
  if (level === maxDepth) {
    return [];
  }
  const items = dirPath ? getFolderChildren(dirPath) : await getRemovableDrives();
  for (const item of items) {
    if (item.type === FsEntryType.Folder) {
      if (level + 1 < maxDepth) {
        item.children = await getDirectoryStructure(
          path.join(dirPath, item.label),
          maxDepth,
          level + 1
        );
      }
    }
  }

  return items;
};

export const readDb = (): Database => {
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  }
  return [];
};

export const writeDb = (database: Database) => {
  try {
    for (const partition of database) {
      if (partition.label && partition.fullPath) {
        writePartitionLabel(partition.fullPath, partition.label);
      }
      partition.fullPath = ''; // do not save letter from the fs
    }
    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));
  } catch (err: any) {
    return err;
  }
  return undefined;
};

const searchNodes = (alias: string, regex: RegExp, nodes: FsEntry[], currentPath: string[]) => {
  const results: SearchResult[] = [];
  for (const node of nodes) {
    const newPath = [...currentPath, node.label];

    if (regex.test(node.label)) {
      results.push({ alias, path: newPath });
    }

    if (node.type === 'folder' && node.children) {
      results.push(...searchNodes(alias, regex, node.children, newPath));
    }
  }
  return results;
};

export const search = (database: Database, regexpPattern: string) => {
  const results: SearchResult[] = [];
  const regex = new RegExp(regexpPattern, 'i');

  for (const entry of database) {
    results.push(...searchNodes(entry.label, regex, entry.children as FsEntry[], []));
  }
  //for (const alias in database) {
  //  results.push(...searchNodes(alias, regex, database[alias], []))
  //}

  return results;
};

export const init = () => {
  dbPath = path.join(app.getPath('appData'), 'catalog', 'database.json');
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  console.info('api initialized, dbFilePath: ', dbPath, ' | ' + app.getAppPath());
};

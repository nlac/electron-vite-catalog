import { writable, get } from 'svelte/store';
import { progress } from './progress';
import {
  DbStatus,
  type FsEntry,
  type Database,
  type TreeEntry,
  FsEntryType
} from '../../../common/types';
import { sendMessage } from './message';
import { isDescendant, sortFsEntries } from '../../../common/utils';

export const database = writable<Database>([]);

const getDbPartitionByLabel = (db: Database, partition: TreeEntry) =>
  db.find((p) => p.label === partition.label);

const getDbFolder = (dbPartition: FsEntry, fullPath: string) =>
  dbPartition.children?.find((n) => n.fullPath === fullPath);

const sortNodes = (children: FsEntry[]) => {
  if (children) {
    children.sort(sortFsEntries);

    for (const child of children) {
      sortNodes(child.children);
    }
  }
};

const maintainDb = (db: Database) => {
  // deleting saved sub-trees of other saved folders
  for (const partition of db) {
    delete (partition as TreeEntry)._expanded;
    for (let i = 0; i < partition.children.length; i++) {
      const folder = partition.children[i];
      if (
        partition.children.find(
          (child) => child !== folder && isDescendant(child.fullPath, folder.fullPath)
        )
      ) {
        partition.children.splice(i, 1);
        i--;
      }
    }
  }
  sortNodes(db);
};

export const deleteNode = async (node: TreeEntry) => {
  const newDb = [...get(database)];

  progress.set(true);

  const treePartition = node._parentPartition || node;
  const dbPartition = getDbPartitionByLabel(newDb, treePartition);
  if (dbPartition && !dbPartition.fullPath) {
    dbPartition.fullPath = treePartition.fullPath;
  }

  for (let i = 0; i < newDb.length; i++) {
    if (node.type === FsEntryType.Partition && node.label === newDb[i].label) {
      newDb.splice(i, 1);
      break;
    }
    for (let j = 0; j < newDb[i].children.length; j++) {
      if (node.fullPath === newDb[i].children[j].fullPath) {
        newDb[i].children.splice(j, 1);
        break;
      }
    }
  }

  maintainDb(newDb);
  database.update(() => newDb);
  const writeResult = await window.api.writeDb(newDb);
  if (writeResult) {
    // TODO: handle it
    console.info('error:', writeResult);
  }
  sendMessage('update-tree', node._parentPartition || node);

  progress.set(false);
};

export const saveNode = async (node: TreeEntry) => {
  const newDb = [...get(database)];

  progress.set(true);

  const deepChildren = await (window as any).api.getDirectoryStructure(
    (node._parentPartition?.fullPath || '') + node.fullPath,
    99
  );
  const treePartition = node._parentPartition || node;
  const dbPartition = getDbPartitionByLabel(newDb, treePartition);
  if (dbPartition) {
    if (!dbPartition.fullPath) {
      dbPartition.fullPath = treePartition.fullPath;
    }
    if (node.type === FsEntryType.Partition) {
      //dbPartition.label = node.label
      dbPartition.children = deepChildren;
    } else {
      const dbFolder = getDbFolder(dbPartition, node.fullPath);
      if (dbFolder) {
        dbFolder.children = deepChildren;
      } else {
        dbPartition.children.push({
          type: node.type,
          label: node.label,
          fullPath: node.fullPath,
          children: deepChildren
        });
      }
    }
  } else {
    if (node.type === FsEntryType.Partition) {
      newDb.push({
        type: FsEntryType.Partition,
        label: node.label,
        fullPath: node.fullPath,
        children: deepChildren
      });
    } else {
      newDb.push({
        type: FsEntryType.Partition,
        label: node._parentPartition.label,
        fullPath: node._parentPartition.fullPath,
        children: [
          {
            type: node.type,
            label: node.label,
            fullPath: node.fullPath,
            children: deepChildren
          }
        ]
      });
    }
  }

  maintainDb(newDb);
  database.update(() => newDb);
  const writeResult = await window.api.writeDb(newDb);
  if (writeResult) {
    // TODO: handle it
    console.info('error:', writeResult);
  }
  sendMessage('update-tree', treePartition);

  progress.set(false);
};

export const getDbStatus = (node: TreeEntry) => {
  const dbPartition = getDbPartitionByLabel(get(database), node._parentPartition || node);

  if (node.type === FsEntryType.Partition) {
    return dbPartition?.children?.length ? DbStatus.DescendantSaved : DbStatus.NonSaved;
  }

  if (node.type !== FsEntryType.Folder) {
    return DbStatus.NoReasonToSave;
  }

  // node is a folder
  if (dbPartition?.children) {
    for (const child of dbPartition.children) {
      if (child.fullPath === node.fullPath) {
        return DbStatus.Saved;
      }
      if (isDescendant(child.fullPath, node.fullPath)) {
        return DbStatus.NoReasonToSave;
      }
      if (isDescendant(node.fullPath, child.fullPath)) {
        return DbStatus.DescendantSaved;
      }
    }
  }

  return DbStatus.NonSaved;
};

export const searchPattern = (
  pattern: RegExp,
  node?: FsEntry,
  partitionLabel?: string
): string[] => {
  const result: string[] = [];
  const isRoot = !partitionLabel;
  const children: FsEntry[] = node ? node.children : get(database);
  if (children) {
    result.push(
      ...children
        .map((child) => searchPattern(pattern, child, partitionLabel || child.label))
        .flat()
    );
  }
  if (node && pattern.test(node.label)) {
    result.push(partitionLabel + ':\\' + node.fullPath);
  }
  if (isRoot) {
    result.sort();
    for (let i = 1; i < result.length; i++) {
      if (isDescendant(result[i - 1], result[i])) {
        result.splice(i - 1, 1);
        i--;
      }
    }
  }
  return result;
};
(async () => database.set(await window.api.readDb()))();

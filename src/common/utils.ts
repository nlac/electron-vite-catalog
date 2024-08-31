import { FsEntryType, type FsEntry } from './types';

export const isDescendant = (parentPath: string, childPath: string, allowEqual = false) =>
  (allowEqual && childPath === parentPath) ||
  childPath.indexOf(parentPath.replace(/\\+$/, '') + '\\') === 0;

export const sortFsEntries = (a: FsEntry, b: FsEntry) => {
  const labelA = (a.label || a.fullPath || '').toLowerCase();
  const labelB = (b.label || b.fullPath || '').toLowerCase();
  if (a.type !== FsEntryType.File && b.type !== FsEntryType.File) {
    return labelA > labelB ? 1 : -1;
  }
  if (a.type !== FsEntryType.File) {
    return -1;
  }
  if (b.type !== FsEntryType.File) {
    return 1;
  }
  return labelA > labelB ? 1 : -1;
};

export enum FsEntryType {
  Root = '',
  File = 'file',
  Folder = 'folder',
  Partition = 'partition',
  Drive = 'drive'
}

export type FsEntry = {
  type: FsEntryType
  label: string
  fullPath: string
  children?: FsEntry[]
}

// array of partitions
export type Database = FsEntry[]

export type SearchResult = { alias: string; path: string[] }

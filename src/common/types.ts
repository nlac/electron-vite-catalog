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

export type Expandable = {
  _expanded: boolean
  _parentPartition?: TreeEntry
  _originalLabel?: string
}

export type TreeEntry = FsEntry & Expandable

// array of partitions
export type Database = FsEntry[]

export type SearchResult = { alias: string; path: string[] }

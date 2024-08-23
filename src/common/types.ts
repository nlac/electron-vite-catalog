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
}

export type TreeEntry = FsEntry &
  Expandable & {
    _parentPartition?: TreeEntry
  }

// array of partitions
export type Database = FsEntry[]

export enum DbStatus {
  NoReasonToSave = 'no-reason-to-save', // no reason to save/update cus it's a file or its parent is already saved
  DescendantSaved = 'descendant-saved', // can be saved + show that there's some saved descendants
  Saved = 'saved', // updateable
  NonSaved = 'non-saved' // saveable
}

export type SearchResult = { alias: string; path: string[] }

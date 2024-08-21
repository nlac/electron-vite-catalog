import type { FsEntry } from '../../common/types'

export type Expandable = {
  _expanded: boolean
  _parentPartition?: TreeEntry
  _originalLabel?: string
}

export type TreeEntry = FsEntry & Expandable

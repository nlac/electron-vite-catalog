import type { FsEntry } from '../../common/types'

export type Expandable = {
  _expanded: boolean
}

export type TreeEntry = FsEntry & Expandable & {
    _parent?: TreeEntry
}

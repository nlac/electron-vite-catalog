import { writable } from 'svelte/store'
import type { TreeEntry } from './types'
import type { FsEntry, Database } from '../../common/types'

export const database = writable<Database>({})

database.update(() => (window as any).api.readDb())

export const saveNode = (node: TreeEntry) => {
  database.update((db) => ({ ...db, [node.label]: [node as FsEntry] }))
}

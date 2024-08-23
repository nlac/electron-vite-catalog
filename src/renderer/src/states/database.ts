import { writable, get } from 'svelte/store'
import { progress } from './progress'
import {
  DbStatus,
  type FsEntry,
  type Database,
  type TreeEntry,
  FsEntryType
} from '../../../common/types'
import { sendMessage } from './message'
import { isDescendant } from '../../../common/utils'

export const database = writable<Database>([])

//export const aliases = derived(database, ($database) => $database.map((p) => p.label))

const getDbPartitionByLabel = (db: Database, partition: TreeEntry) =>
  db.find((p) => p.label === partition.label)

const getDbFolder = (dbPartition: FsEntry, fullPath: string) =>
  dbPartition.children?.find((n) => n.fullPath === fullPath)

const maintainDb = (db: Database) => {
  for (const partition of db) {
    for (let i = 0; i < partition.children.length; i++) {
      const folder = partition.children[i]
      if (
        partition.children.find(
          (child) => child !== folder && folder.fullPath.indexOf(child.fullPath + '\\') === 0
        )
      ) {
        partition.children.splice(i, 1)
        i--
      }
    }
  }
}

export const deleteNode = async (node: TreeEntry) => {
  const newDb = [...get(database)]

  progress.set(true)

  for (let i = 0; i < newDb.length; i++) {
    if (node.type === FsEntryType.Partition && node.label === newDb[i].label) {
      newDb.splice(i, 1)
      break
    }
    for (let j = 0; j < newDb[i].children.length; j++) {
      if (node.fullPath === newDb[i].children[j].fullPath) {
        newDb[i].children.splice(j, 1)
        break
      }
    }
  }

  maintainDb(newDb)
  database.update(() => newDb)
  window.api.writeDb(newDb)
  sendMessage('update-tree', node._parentPartition || node)

  progress.set(false)
}

export const saveNode = async (node: TreeEntry) => {
  const newDb = [...get(database)]

  progress.set(true)

  const deepChildren = await (window as any).api.getDirectoryStructure(
    (node._parentPartition?.fullPath || '') + node.fullPath,
    99
  )
  const treePartition = node._parentPartition || node
  const dbPartition = getDbPartitionByLabel(newDb, treePartition)
  if (dbPartition) {
    if (node.type === FsEntryType.Partition) {
      //dbPartition.label = node.label
      dbPartition.children = deepChildren
    } else {
      const dbFolder = getDbFolder(dbPartition, node.fullPath)
      if (dbFolder) {
        dbFolder.children = deepChildren
      } else {
        dbPartition.children.push({
          type: node.type,
          label: node.label,
          fullPath: node.fullPath,
          children: deepChildren
        })
      }
    }
  } else {
    if (node.type === FsEntryType.Partition) {
      newDb.push({
        type: FsEntryType.Partition,
        label: node.label,
        fullPath: node.fullPath,
        children: deepChildren
      })
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
      })
    }
  }

  maintainDb(newDb)
  database.update(() => newDb)
  window.api.writeDb(newDb)
  sendMessage('update-tree', treePartition)

  progress.set(false)
}

export const getDbStatus = (node: TreeEntry) => {
  const dbPartition = getDbPartitionByLabel(get(database), node._parentPartition || node)

  if (node.type === FsEntryType.Partition) {
    return dbPartition?.children?.length ? DbStatus.DescendantSaved : DbStatus.NonSaved
  }

  if (node.type !== FsEntryType.Folder) {
    return DbStatus.NoReasonToSave
  }

  // node is a folder
  if (dbPartition?.children) {
    for (const child of dbPartition.children) {
      if (child.fullPath === node.fullPath) {
        return DbStatus.Saved
      }
      if (isDescendant(child.fullPath, node.fullPath)) {
        return DbStatus.NoReasonToSave
      }
      if (isDescendant(node.fullPath, child.fullPath)) {
        return DbStatus.DescendantSaved
      }
    }
  }

  return DbStatus.NonSaved
}

// watching db
database.subscribe((db) => {
  console.info('db is now:', db)
})

const init = async () => {
  const db: Database = await window.api.readDb()
  database.update(() => db)
}

init()

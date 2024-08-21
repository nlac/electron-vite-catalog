import { writable } from 'svelte/store'
import type { TreeEntry } from './types'
import { type FsEntry, type Database, FsEntryType } from '../../common/types'
//import { FsEntryType } from '../../common/types'

export const database = writable<Database>([])
let databaseSnapshot: Database

const getDbPartitionByLabel = (db: Database, partition: TreeEntry) =>
  db.find((p) => p.label === partition._originalLabel)

const getDbFolder = (dbPartition: FsEntry, fullPath: string) =>
  dbPartition.children?.find((n) => n.fullPath === fullPath)

/*
const cleanNodeBeforeSave = (node: FsEntry) => {
  node.fullPath = ''
  if (node.children) {
    node.children.forEach(cleanNodeBeforeSave)
  }
}
*/

export const saveNode = async (node: TreeEntry) => {
  const newDb = [...databaseSnapshot]
  const deepChildren = await (window as any).api.getDirectoryStructure(
    (node._parentPartition?.fullPath || '') + node.fullPath,
    99
  )

  const dbPartition = getDbPartitionByLabel(newDb, node._parentPartition)
  if (dbPartition) {
    if (node.type === FsEntryType.Partition) {
      dbPartition.label = node.label
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
        fullPath: '',
        children: deepChildren
      })
    } else {
      newDb.push({
        type: FsEntryType.Partition,
        label: node._parentPartition.label,
        fullPath: '',
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

  //console.info('newDb', newDb)
  database.update(() => newDb)
  window.api.writeDb(newDb)
}

export const getPartitionAliases = () => databaseSnapshot.map((p) => p.label)

export const getFsDrives = () => {
  return window.api.getDirectoryStructure().then((drives: TreeEntry[]) => {
    drives.forEach((drive) => {
      drive._expanded = true
      for (const partition of drive.children as TreeEntry[]) {
        partition._originalLabel = partition.label
      }
    })
    return drives
  })
}

database.subscribe((db) => {
  databaseSnapshot = db
  console.info('db is now:', db)
})

const init = async () => {
  const db: Database = await window.api.readDb()
  database.update(() => db)
}

init()

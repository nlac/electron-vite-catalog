import fs from 'fs'
import path from 'path'
import drivelist from 'drivelist'
import { app } from 'electron'
import { FsEntryType } from '../common/types'
import type { FsEntry, SearchResult, Database } from '../common/types'

let dbFilePath: string = ''
let dbDir: string = ''
let database: Database = {}

const sortFsEntries = (a: FsEntry, b: FsEntry) => {
  const labelA = a.label || a.fullPath
  const labelB = b.label || b.fullPath
  if (a.children && b.children) {
    return labelA > labelB ? 1 : -1
  }
  if (a.children) {
    return -1
  }
  if (b.children) {
    return 1
  }
  return labelA > labelB ? 1 : -1
}

const getRemovableDrives = async (): Promise<FsEntry[]> => {
  const drives = await drivelist.list()
  return (
    drives
      //.filter((drive) => drive.isRemovable)
      .map((drive) => ({
        type: FsEntryType.Drive,
        label: drive.description,
        fullPath: '',
        children: drive.mountpoints
          .map((mp) => ({
            type: FsEntryType.Partition,
            label: '', //mp.path,
            fullPath: mp.path,
            children: []
          }))
          .sort(sortFsEntries)
      }))
      .sort(sortFsEntries)
  )
}

const getFolderChildren = (dirPath: string): FsEntry[] => {
  const children: FsEntry[] = []
  const items = fs.readdirSync(dirPath)
  for (const item of items) {
    try {
      const fullPath = path.join(dirPath, item)
      const stats = fs.statSync(fullPath)
      if (stats.isDirectory()) {
        children.push({
          type: FsEntryType.Folder,
          label: item,
          fullPath,
          children: []
        })
      } else if (stats.isFile()) {
        children.push({
          type: FsEntryType.File,
          label: item,
          fullPath
        })
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }
  return children.sort(sortFsEntries)
}

const getDirectoryStructure = async (dirPath: string = '', maxDepth: number = 1, level = 0) => {
  if (level === maxDepth) {
    return []
  }
  const items = dirPath ? getFolderChildren(dirPath) : await getRemovableDrives()
  for (const item of items) {
    if (item.type === FsEntryType.Folder) {
      if (level + 1 < maxDepth) {
        item.children = await getDirectoryStructure(
          path.join(dirPath, item.label),
          maxDepth,
          level + 1
        )
      }
    } else if (item.type === FsEntryType.Drive && item.children) {
      // item is a drive -> children are already filled
      for (const partition of item.children) {
        partition.children = await getDirectoryStructure(partition.fullPath, maxDepth, level + 2)
      }
    }
  }

  return items
}

const readDb = () => {
  //if (!fs.existsSync(dbFilePath)) {
  //  fs.writeFileSync(dbFilePath, JSON.stringify({}), 'utf-8');
  //}
  if (fs.existsSync(dbFilePath)) {
    const fileContent = fs.readFileSync(dbFilePath, 'utf-8')
    database = JSON.parse(fileContent)
  }
  return database
}

const writeDb = () => {
  fs.writeFileSync(dbFilePath, JSON.stringify(database, null, 2))
}

const saveAlias = async (alias: string, dirPath: string) => {
  const structure = await getDirectoryStructure(dirPath)
  database[alias] = structure
  writeDb()
  console.log(`Structure for "${alias}" has been updated in the database.`)
}

const deleteAlias = async (alias: string) => {
  delete database[alias]
  writeDb()
  console.log(`"${alias}" deleted from the database.`)
}

const searchNodes = (alias: string, regex: RegExp, nodes: FsEntry[], currentPath: string[]) => {
  const results: SearchResult[] = []
  for (const node of nodes) {
    const newPath = [...currentPath, node.label]

    if (regex.test(node.label)) {
      results.push({ alias, path: newPath })
    }

    if (node.type === 'folder' && node.children) {
      results.push(...searchNodes(alias, regex, node.children, newPath))
    }
  }
  return results
}

const search = (regexpPattern: string) => {
  const results: SearchResult[] = []
  const regex = new RegExp(regexpPattern, 'i')

  for (const alias in database) {
    results.push(...searchNodes(alias, regex, database[alias], []))
  }

  return results
}

const init = () => {
  dbFilePath = path.join(app.getPath('appData'), 'catalog', 'database.json')
  dbDir = path.dirname(dbFilePath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
}

///////////////////////// exposing api /////////////////////////////

export const api = {
  init,
  readDb,
  getDirectoryStructure,
  saveAlias,
  deleteAlias,
  search
}

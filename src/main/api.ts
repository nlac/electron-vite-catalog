import fs from 'fs'
import path from 'path'
import drivelist from 'drivelist'
import { app } from 'electron'
import { FsEntryType } from '../common/types'
import type { FsEntry, SearchResult, Database } from '../common/types'

let dbPath: string = ''

const sortFsEntries = (a: FsEntry, b: FsEntry) => {
  const labelA = a.label || a.fullPath
  const labelB = b.label || b.fullPath
  if (a.type !== FsEntryType.File && b.type !== FsEntryType.File) {
    return labelA > labelB ? 1 : -1
  }
  if (a.type !== FsEntryType.File) {
    return -1
  }
  if (b.type !== FsEntryType.File) {
    return 1
  }
  return labelA > labelB ? 1 : -1
}

const removePartitionLetter = (fullPath: string) => fullPath.replace(/^[a-zA-Z]:[/\\]+/, '')

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
            fullPath: mp.path
            //children: []
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
          fullPath: removePartitionLetter(fullPath)
          //children: []
        })
      } else if (stats.isFile()) {
        children.push({
          type: FsEntryType.File,
          label: item,
          fullPath: removePartitionLetter(fullPath)
        })
      }
    } catch (err: any) {
      console.error(err.message)
    }
  }
  return children.sort(sortFsEntries)
}

export const getDirectoryStructure = async (
  dirPath: string = '', // must be a valid fs path
  maxDepth: number = 1,
  level = 0
) => {
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

export const readDb = (): Database => {
  if (fs.existsSync(dbPath)) {
    const fileContent = fs.readFileSync(dbPath, 'utf-8')
    return JSON.parse(fileContent)
  }
  return []
}

export const writeDb = (database: Database) => {
  // console.info('writing to ' + dbPath)
  fs.writeFileSync(dbPath, JSON.stringify(database, null, 2))
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

export const search = (database: Database, regexpPattern: string) => {
  const results: SearchResult[] = []
  const regex = new RegExp(regexpPattern, 'i')

  for (const entry of database) {
    results.push(...searchNodes(entry.label, regex, entry.children as FsEntry[], []))
  }
  //for (const alias in database) {
  //  results.push(...searchNodes(alias, regex, database[alias], []))
  //}

  return results
}

export const init = () => {
  dbPath = path.join(app.getPath('appData'), 'catalog', 'database.json')
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }
  console.info('api initialized, dbFilePath: ', dbPath, ' | ' + app.getAppPath())
}

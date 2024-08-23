import fs from 'fs'
import path from 'path'
import { type FsEntry, FsEntryType } from '../common/types'

export const PARTITION_ID_FILE = '__catalog_id-do_not_remove__.txt'

export const sortFsEntries = (a: FsEntry, b: FsEntry) => {
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

export const removePartitionLetter = (fullPath: string) => fullPath.replace(/^[a-zA-Z]:[/\\]+/, '')

export const createOrGetPartitionLabel = (partitionPath: string, alias: string = '') => {
  const filePath = path.join(partitionPath.replace(/[:\\/]+/g, ':'), PARTITION_ID_FILE)
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8')
    }
    if (alias) {
      fs.writeFileSync(filePath, alias, 'utf8')
    }
  } catch (err) {
    console.error(err)
  }
  return alias
}

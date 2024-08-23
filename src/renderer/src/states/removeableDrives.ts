import { writable } from 'svelte/store'
import type { TreeEntry } from '../../../common/types'

export const removeableDrives = writable<Promise<TreeEntry[]>>()

export const getRemoveableDrives = () => {
  const pDrives = window.api.getDirectoryStructure().then((drives: TreeEntry[]) => {
    drives.forEach((drive) => {
      drive._expanded = true
    })
    console.info('drives from fs: ', drives)
    return drives
  })
  removeableDrives.set(pDrives)
  return pDrives
}

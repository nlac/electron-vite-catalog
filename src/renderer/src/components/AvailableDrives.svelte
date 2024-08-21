<script lang="ts">
  import TreeView from './TreeView.svelte'
  import TreeLabel from './TreeLabel.svelte'
  import { FsEntryType } from '../../../common/types'
  import type { TreeEntry } from '../types'
  import { getFsDrives } from '../state'

  const getChildren = (node: TreeEntry) =>
    node.type === FsEntryType.File ? undefined : ((node.children || []) as TreeEntry[])

  const onOpenNode = async (node: TreeEntry) => {
    if (node.type === FsEntryType.Partition || node.type === FsEntryType.Folder) {
      const partition = node._parentPartition || node
      if (!node.children) {
        node.children = await window.api.getDirectoryStructure(
          node.type === FsEntryType.Partition ? node.fullPath : partition.fullPath + node.fullPath
        )
      }
      for (const child of node.children as TreeEntry[]) {
        child._parentPartition = partition
      }
    }
  }

  const getRoot = (drives: TreeEntry[]): TreeEntry => {
    return {
      type: FsEntryType.Root,
      label: 'Available drives',
      fullPath: '',
      children: drives,
      _expanded: true
    }
  }
</script>

{#await getFsDrives()}
  <p>Loading...</p>
{:then drives}
  <TreeView tree={getRoot(drives)} {getChildren} {onOpenNode} labelComponent={TreeLabel} />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

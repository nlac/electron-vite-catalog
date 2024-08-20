<script lang="ts">
  import TreeView from './TreeView.svelte'
  import TreeLabel from './TreeLabel.svelte'
  import { FsEntryType } from '../../../common/types'
  import type { TreeEntry } from '../types'

  const getChildren = (node: TreeEntry) => node.children as TreeEntry[]
  const onOpenNode = async (node: TreeEntry) => {
    if (node.type === FsEntryType.Partition || node.type === FsEntryType.Folder) {
      node.children = await window.api.getDirectoryStructure(node.fullPath)
      node.children.forEach((child) => ((child as TreeEntry)._parent = node))
    }
  }

  const drives = window.api.getDirectoryStructure().then((drives: TreeEntry[]) => {
    drives.forEach((drive) => {
      drive._expanded = true
    })
    return drives
  })
</script>

{#await drives}
  <p>Loading...</p>
{:then drives}
  <TreeView
    tree={{
      type: FsEntryType.Root,
      label: 'Available drives',
      fullPath: '',
      children: drives,
      _expanded: true
    }}
    {getChildren}
    {onOpenNode}
    labelComponent={TreeLabel}
  />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

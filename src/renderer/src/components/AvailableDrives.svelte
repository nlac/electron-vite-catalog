<script lang="ts">
  import TreeView from './TreeView.svelte';
  import FsTreeLabel from './FsTreeLabel.svelte';
  import { type TreeEntry, FsEntryType } from '../../../common/types';
  import { removeableDrives, getRemoveableDrives } from '../stores/removeableDrives';
  import { progress } from '../stores/progress';

  const getChildren = (node: TreeEntry) =>
    node.type === FsEntryType.File ? undefined : ((node.children || []) as TreeEntry[]);

  const onOpenNode = async (node: TreeEntry) => {
    if (node.type === FsEntryType.Partition || node.type === FsEntryType.Folder) {
      const partition = node._parentPartition || node;
      if (!node.children) {
        node.children = await window.api.getDirectoryStructure(
          node.type === FsEntryType.Partition ? node.fullPath : partition.fullPath + node.fullPath
        );
      }
      for (const child of node.children as TreeEntry[]) {
        child._parentPartition = partition;
      }
    }
  };

  const getRoot = (drives: TreeEntry[]): TreeEntry => {
    return {
      type: FsEntryType.Root,
      label: 'Available removeable drives on the PC',
      fullPath: '',
      children: drives,
      _expanded: true
    };
  };

  getRemoveableDrives();
  progress.set(true);
</script>

{#await $removeableDrives}
  <p>Loading...</p>
{:then drives}
  {(() => {
    progress.set(false);
    return '';
  })()}
  <a
    href="#"
    class="reload-button"
    on:click={() => {
      progress.set(true);
      getRemoveableDrives();
    }}>⟳</a
  >
  <TreeView tree={getRoot(drives)} {getChildren} {onOpenNode} labelComponent={FsTreeLabel} />
{:catch error}
  <p style="color: red">{error.message}</p>
{/await}

<style>
  .reload-button {
    position: absolute;
    right: 20px;
    top: 18px;
    z-index: 1;
  }
</style>

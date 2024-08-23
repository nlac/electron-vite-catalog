<script lang="ts" context="module">
  import { type TreeEntry, DbStatus, FsEntryType } from '../../../common/types'
  import { saveNode, getDbStatus, deleteNode } from '../states/database'

  const noBubbling = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const saveLabels = {
    [DbStatus.NoReasonToSave]: '',
    [DbStatus.DescendantSaved]: 'save',
    [DbStatus.Saved]: 'update',
    [DbStatus.NonSaved]: 'save'
  }
</script>

<script lang="ts">
  export let tree: TreeEntry

  const onSaveNode = (e: MouseEvent) => {
    noBubbling(e)
    saveNode(tree)
  }

  const onDeleteNode = (e: MouseEvent) => {
    noBubbling(e)
    deleteNode(tree)
  }

  const isPartition = tree.type === FsEntryType.Partition
  const isLabelEditable = isPartition && !tree.label

  $: label = isPartition ? tree.fullPath : tree.label || tree.fullPath
  $: dbStatus = getDbStatus(tree)
</script>

{#if tree.type === FsEntryType.File}
  {label}
{/if}

{#if tree.type !== FsEntryType.File}
  <div
    class="tree-label"
    class:tree-label-drive={isPartition}
    class:saveable-tree={isPartition && tree.label}
  >
    <span class="tree-label-text">{label}</span>
    {#if isPartition}
      <div class="field-row">
        <input
          type="text"
          class="label-editor"
          placeholder="fill your partition label"
          bind:value={tree.label}
          on:click={noBubbling}
          disabled={!isLabelEditable}
        />
      </div>
    {/if}
    {#if (tree.type === FsEntryType.Partition || tree.type === FsEntryType.Folder) && dbStatus !== DbStatus.NoReasonToSave}
      <a href="#" on:click={onSaveNode} class="save-node {dbStatus}">{saveLabels[dbStatus]}</a>
    {/if}
    {#if dbStatus === DbStatus.Saved}
      <a href="#" on:click={onDeleteNode} class="delete-node">delete</a>
    {/if}
  </div>
{/if}

<style>
  .tree-label {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .tree-label-text {
    display: inline-block;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: sub;
  }

  .tree-label-drive .tree-label-text {
    min-width: 1.2rem;
  }

  .save-node,
  .delete-node {
    margin-left: 0.2rem;
  }

  .tree-label-drive,
  .save-node {
    color: #00f;
  }

  .delete-node {
    color: #f00;
  }
</style>

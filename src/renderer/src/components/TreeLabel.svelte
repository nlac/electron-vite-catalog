<script lang="ts" context="module">
  import { type TreeEntry, FsEntryType } from '../../../common/types'
  import { getPartitionAliases, saveNode } from '../states/state'

  const noBubbling = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
</script>

<script lang="ts">
  export let tree: TreeEntry
  let comboOpen = false
  const toggleCombo = (e: MouseEvent) => {
    noBubbling(e)
    comboOpen = !comboOpen
  }
  const onSaveNode = (e: MouseEvent) => {
    noBubbling(e)
    saveNode(tree)
  }

  const onSelectOption = (e: MouseEvent, option: string) => {
    noBubbling(e)
    comboOpen = false
    tree.label = option
  }

  $: label = tree.type === FsEntryType.Partition ? tree.fullPath : tree.label || tree.fullPath
  $: options = getPartitionAliases()
</script>

{#if tree.type === FsEntryType.File}
  {label}
{/if}

{#if tree.type !== FsEntryType.File}
  <div
    class="tree-label {tree.type === FsEntryType.Partition ? 'tree-label-drive' : ''} {tree.type ===
      FsEntryType.Partition &&
      tree.label &&
      'saveable-tree'}"
  >
    <span class="tree-label-text">{label}</span>
    {#if tree.type === FsEntryType.Partition}
      <div class="combobox">
        <input
          type="text"
          role="combobox"
          aria-owns="company"
          placeholder="select or fill its name"
          on:click={noBubbling}
          bind:value={tree.label}
        />
        <button on:click={toggleCombo}></button>
        <ul role="listbox" class="has-hover" hidden={!comboOpen}>
          <li role="option">dummy</li>
          {#each options as option}
            {@const opts = option === tree.label ? { 'aria-selected': true } : {}}
            <li role="option" on:click={(e) => onSelectOption(e, option)} {...opts}>
              {option}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
    {#if tree.type === FsEntryType.Partition || tree.type === FsEntryType.Folder}
      <a href="javascript;" on:click={onSaveNode} class="save-node">save</a>
    {/if}
  </div>
{/if}

<style>
  .tree-label {
    display: inline-block;
  }

  .tree-label-text {
    display: inline-block;
    overflow-x: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    vertical-align: sub;
  }

  .tree-label-drive .tree-label-text {
    min-width: 1rem;
  }

  .tree-label-drive {
    color: #00f;
  }

  .combobox {
    display: inline-block;
    position: relative;
  }

  .combobox ul {
    position: absolute;
    width: 100%;
    z-index: 1;
  }
</style>

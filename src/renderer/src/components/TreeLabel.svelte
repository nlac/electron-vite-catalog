<script lang="ts" context="module">
  import { FsEntryType } from '../../../common/types'
  import type { TreeEntry } from '../types'
  import { saveNode } from '../state'

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
  const onSave = (e: MouseEvent) => {
    noBubbling(e)
    saveNode(tree)
  }
  $: label = tree.type === FsEntryType.Partition ? tree.fullPath : tree.label || tree.fullPath
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
        <ul role="listbox" hidden={!comboOpen}>
          <li role="option">Facebook</li>
          <li role="option">Amazon</li>
          <li role="option">Apple</li>
          <li role="option">Netflix</li>
          <li role="option">Google</li>
        </ul>
      </div>
    {/if}
    {#if tree.type === FsEntryType.Partition || tree.type === FsEntryType.Folder}
      <a href="javascript;" on:click={onSave} class="save-node">save</a>
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

  /*  
  .tree-label-drive .tree-label-text {
    width: 2rem;
    max-width: 2rem;
  }
*/
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

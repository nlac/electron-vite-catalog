<script lang="ts">
  import type { ComponentType } from 'svelte'
  import type { Expandable } from '../../../common/types'

  type TreeNode = $$Generic<Expandable>
  export let tree: TreeNode
  export let getChildren: (node: TreeNode) => TreeNode[]
  export let onOpenNode: (node: TreeNode) => Promise<void>
  export let labelComponent: ComponentType

  $: children = getChildren(tree)

  const toggleNode = async () => {
    if (!tree._expanded && onOpenNode) {
      await onOpenNode(tree)
    }
    tree._expanded = !tree._expanded
  }
</script>

<ul class="tree-view-container">
  <li>
    {#if children}
      <span class="node node-folder" class:expanded={tree._expanded} on:click={toggleNode}>
        <svelte:component this={labelComponent} {tree} />
      </span>
      {#if tree._expanded}
        {#each children as child}
          <svelte:self tree={child} {getChildren} {onOpenNode} {labelComponent} />
        {/each}
      {/if}
    {:else}
      <span class="node node-file">
        <svelte:component this={labelComponent} {tree} />
      </span>
    {/if}
  </li>
</ul>

<style>
  .tree-view-container {
    margin: 0;
    list-style: none;
    padding-left: 1rem;
    user-select: none;
  }
  .node-file {
    padding-left: 1rem;
  }
  .node-folder {
    cursor: pointer;
    display: inline-block;
  }
  .node-folder:before {
    content: '⊞';
  }
  .expanded:before {
    content: '⊟';
  }
</style>

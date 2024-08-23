<script lang="ts">
  import { onDestroy, type ComponentType } from 'svelte'
  import SimpleLabel from './SimpleLabel.svelte'
  import type { Expandable } from '../../../common/types'
  import { onMessage } from '../states/message'

  type TreeNode = $$Generic<Expandable>
  export let tree: TreeNode
  export let getChildren: (node: TreeNode) => TreeNode[]
  export let onOpenNode: (node: TreeNode) => Promise<void> = undefined
  export let labelComponent: ComponentType = SimpleLabel
  export let level = 0

  $: children = getChildren(tree)
  $: folderProps = tree._expanded ? { open: true } : {}

  const toggleNode = async () => {
    if (!tree._expanded && onOpenNode) {
      await onOpenNode(tree)
    }
    // setTimeout is needed to update folderProps properly...
    setTimeout(() => {
      tree._expanded = !tree._expanded
    }, 0)
  }

  const unsubscribeMessages = onMessage(['update-tree'], (_key, node) => {
    if (tree === node) {
      if (tree._expanded) {
        tree._expanded = false
        toggleNode()
      }
    }
    return tree === node
  })

  onDestroy(unsubscribeMessages)
</script>

<ul class={!level && 'tree-view has-collapse-button has-connectorx has-container'}>
  <li>
    {#if children}
      <details {...folderProps}>
        <summary on:click={toggleNode}><svelte:component this={labelComponent} {tree} /></summary>
        {#each children as child}
          <svelte:self tree={child} {getChildren} {onOpenNode} {labelComponent} level={level + 1} />
        {/each}
      </details>
    {:else}
      <svelte:component this={labelComponent} {tree} />
    {/if}
  </li>
</ul>

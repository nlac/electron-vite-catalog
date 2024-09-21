<script lang="ts" context="module">
  import { type TreeEntry } from '../../../common/types';
  import { deleteNode } from '../stores/database';
</script>

<script lang="ts">
  export let tree: TreeEntry;
  export let level = 0;

  const onDeleteNode = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('sure?')) {
      deleteNode(tree);
    }
  };

  const isDeletable = (level === 1 || level === 2) && tree.children;
</script>

<div>
  {tree.label}
  {#if isDeletable}
    <a href="#" on:click={onDeleteNode} class="delete-node">delete</a>
  {/if}
</div>

<style>
  .delete-node {
    color: #f00;
  }
</style>

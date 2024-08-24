<script lang="ts" context="module">
  import type { ComponentType } from 'svelte';

  export type TabItem = {
    label: string;
    component: ComponentType;
  };
</script>

<script lang="ts">
  export let items: TabItem[] = [];
  export let activeIndex = 0;
</script>

<nav>
  <ul role="menubar">
    {#each items as item, idx}
      <li
        role="menuitem"
        class={idx === activeIndex ? 'active' : ''}
        on:click={() => (activeIndex = idx)}
      >
        {item.label}
      </li>
    {/each}
  </ul>
</nav>
<main>
  {#each items as item, idx}
    {#if idx === activeIndex}
      <svelte:component this={item.component} />
    {/if}
  {/each}
</main>

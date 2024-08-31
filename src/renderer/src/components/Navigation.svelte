<script lang="ts" context="module">
  import type { ComponentType } from 'svelte';
  import { activePage } from '../stores/activePage';

  export type NavItem = {
    label: string;
    component: ComponentType;
  };
</script>

<script lang="ts">
  export let items: NavItem[] = [];
</script>

<nav>
  <ul role="menubar">
    {#each items as item, idx}
      <li
        role="menuitem"
        class={idx === $activePage ? 'active' : ''}
        on:click={() => activePage.set(idx)}
      >
        {item.label}
      </li>
    {/each}
  </ul>
</nav>
<main>
  {#each items as item, idx}
    {#if idx === $activePage}
      <svelte:component this={item.component} />
    {/if}
  {/each}
</main>

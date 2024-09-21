<script lang="ts">
  import { activePage } from '../stores/activePage';
</script>

<h4 class="no-margin-top">electron-vite-catalog</h4>

<p>
  You can <a href="#" on:click={() => activePage.set(2)}>catalog</a> folders or entire partitions on
  removeable drives, then <a href="#" on:click={() => activePage.set(0)}>search</a> or
  <a href="#" on:click={() => activePage.set(1)}>browse</a> the catalog.
</p>

{#await window.api.getDbPath() then dbPath}
  <p>database: {dbPath}</p>
{/await}

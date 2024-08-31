<script lang="ts" context="module">
  import { searchPattern, database } from '../stores/database';
  import { activePage } from '../stores/activePage';

  const getResults = (term: string) => {
    if (term.length < 3) {
      return '';
    }
    const paths = term !== '' ? searchPattern(new RegExp(term, 'i')) : [];
    if (paths.length > 300) {
      return 'More than 300 results. Try to be more specific.';
    }
    const result: Record<string, any> = {};
    for (const path of paths) {
      const parts = path.split(/:\\/);
      const partitionLabel = parts[0];
      if (!result[partitionLabel]) {
        result[partitionLabel] = [parts[1]];
      } else {
        result[partitionLabel].push(parts[1]);
      }
    }
    return result;
  };
</script>

<script lang="ts">
  $: term = '';
  $: result = getResults(term);
</script>

{#if $database.length}
  <p class="no-margin-top">
    Enter a regular expression that matches a part of the file or folder name to get which
    removeable drive and what path it is on
  </p>

  <div class="field-row">
    <input
      id="text26"
      type="text"
      bind:value={term}
      size={20}
      placeholder="enter at least 3 chars"
    />
  </div>

  <p>or you can <a href="#" on:click={() => activePage.set(1)}>browse</a> the saved catalog.</p>
{:else}
  <p class="no-margin-top">
    Nothing catalogized yet. Insert a removeable drive and <a
      href="#"
      on:click={() => activePage.set(2)}>save</a
    > some folder or partition.
  </p>
{/if}

<div>
  {#if typeof result === 'string'}
    <p>{result}</p>
  {:else if Object.keys(result).length}
    {#each Object.keys(result) as partitionLabel}
      <h5>{partitionLabel}:\</h5>
      <ul>
        {#each result[partitionLabel] as path}
          <li>{path}</li>
        {/each}
      </ul>
    {/each}
  {:else}
    <p>No result</p>
  {/if}
</div>

<style>
  h5 {
    font-size: inherit;
    margin: 12px 0 0 0;
  }
</style>

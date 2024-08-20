<script lang="ts">
  import Versions from './components/Versions.svelte'
  import AvailableDrives from './components/AvailableDrives.svelte'
  import Tabs, { type TabItem } from './components/Tabs.svelte'

  const items: TabItem[] = [
    { label: 'Manage', component: AvailableDrives },
    { label: 'Search', component: Versions }
  ]
</script>

<Tabs {items} />

<footer>
  <div class="status-bar">
    <p class="status-bar-field">footer here</p>
  </div>
</footer>

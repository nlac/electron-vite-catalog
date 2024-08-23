<script lang="ts">
  import AvailableDrives from './components/AvailableDrives.svelte'
  import Browse from './components/Browse.svelte'
  import Tabs, { type TabItem } from './components/Tabs.svelte'
  import Footer from './components/Footer.svelte'

  const items: TabItem[] = [
    { label: 'Manage', component: AvailableDrives },
    { label: 'Search', component: Browse }
  ]
</script>

<Tabs {items} />

<Footer />

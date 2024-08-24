<script lang="ts">
  import AvailableDrives from './components/AvailableDrives.svelte';
  import Browse from './components/Browse.svelte';
  import Tabs, { type TabItem } from './components/Tabs.svelte';
  import Footer from './components/Footer.svelte';
  import Search from './components/Search.svelte';
  import About from './components/About.svelte';

  const items: TabItem[] = [
    { label: 'Search', component: Search },
    { label: 'Browse', component: Browse },
    { label: 'Update', component: AvailableDrives },
    { label: 'About', component: About }
  ];
</script>

<Tabs {items} />

<Footer />

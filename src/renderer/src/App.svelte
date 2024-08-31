<script lang="ts">
  import AvailableDrives from './components/AvailableDrives.svelte';
  import Browse from './components/Browse.svelte';
  import Pages, { type NavItem } from './components/Navigation.svelte';
  import Footer from './components/Footer.svelte';
  import Search from './components/Search.svelte';
  import About from './components/About.svelte';

  const items: NavItem[] = [
    { label: 'Search', component: Search },
    { label: 'Browse', component: Browse },
    { label: 'Update', component: AvailableDrives },
    { label: 'About', component: About }
  ];
</script>

<Pages {items} />

<Footer />

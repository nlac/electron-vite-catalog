<script lang="ts" context="module">
  import { type TreeEntry } from '../../../common/types';
</script>

<script lang="ts">
  export let tree: TreeEntry;
  export let level = 0;
</script>

{tree.label}

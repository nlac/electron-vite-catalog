<script lang="ts">
  import { FsEntryType, type TreeEntry } from '../../../common/types';
  import { database } from '../stores/database';
  import TreeView from './TreeView.svelte';
  import DbTreeLabel from './DbTreeLabel.svelte';

  $: root = {
    type: FsEntryType.Root,
    label: 'Saved partitions in the database',
    fullPath: '',
    children: $database as TreeEntry[],
    _expanded: true
  } as TreeEntry;

  const getChildren = (node: TreeEntry) =>
    node.type === FsEntryType.File ? undefined : ((node.children || []) as TreeEntry[]);
</script>

<TreeView tree={root} {getChildren} labelComponent={DbTreeLabel} />

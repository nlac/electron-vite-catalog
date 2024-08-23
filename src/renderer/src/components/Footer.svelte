<script lang="ts">
  import { progress } from '../states/progress'

  $: message = ''
  progress.subscribe((p) => {
    if (!p) {
      message = 'completed'
      setTimeout(() => (message = ''), 2000)
    }
  })
</script>

<footer>
  <div class="status-bar" class:progress={$progress} class:attention={!!message}>
    <div role="progressbar" class="status-bar-field marquee"></div>
    <div class="status-bar-field text-right">{message}</div>
  </div>
</footer>

<script lang="ts">
  import { progress } from '../stores/progress';

  $: message = '';
  progress.subscribe((p) => {
    if (!p) {
      message = 'completed';
      setTimeout(() => (message = ''), 2000);
    }
  });
</script>

<footer>
  <div class="status-bar" class:progress={$progress} class:message={!!message}>
    <div class="status-bar-field marquee progressbar" role="progressbar"></div>
    <div class="status-bar-field message">{message}</div>
  </div>
</footer>

<style>
  .status-bar {
    margin: 0;
  }

  .status-bar .status-bar-field {
    display: none;
  }

  .status-bar.progress .progressbar {
    display: block;
  }

  .status-bar.message .message {
    display: block;
    background-color: #2a90ff;
    color: #ffffff;
    text-align: right;
  }
</style>

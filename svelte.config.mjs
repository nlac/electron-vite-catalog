import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  onwarn: (warning, handler) => {
    // @nlac: here can disable some warnings for build
    if (warning.code.match(/a11/i)) return;
    handler(warning);
  }
};

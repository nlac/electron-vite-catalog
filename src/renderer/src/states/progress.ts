import { writable } from 'svelte/store';

export const progress = writable<boolean>(false);

import { writable } from 'svelte/store';

export const activePage = writable<number>(0);

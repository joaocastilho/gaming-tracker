/**
 * Mock for $app/stores SvelteKit module
 * Provides SvelteKit's built-in stores
 */

import { writable } from 'svelte/store';

// Page store
export const page = writable({
	url: new URL('http://localhost:3000/'),
	params: {},
	route: { id: '/' },
	status: 200,
	error: null,
	data: {}
});

// Navigation store
export const navigating = writable(null);

// Updated store
export const updated = writable(false);

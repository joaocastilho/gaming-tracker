/**
 * Mock for $app/state SvelteKit module
 * Provides reactive page state access
 */

import { writable } from 'svelte/store';

// Create a mock page store
function createMockPage() {
	const { subscribe, set, update } = writable({
		url: new URL('http://localhost:3000/'),
		params: {},
		route: { id: '/' },
		status: 200,
		error: null,
		data: {},
		form: undefined,
		state: {}
	});

	return {
		subscribe,
		set,
		update,
		// Helper to set URL for tests
		_setUrl(url: string) {
			update((p) => ({ ...p, url: new URL(url) }));
		}
	};
}

export const page = createMockPage();

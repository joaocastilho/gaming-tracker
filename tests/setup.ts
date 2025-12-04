import { mock } from 'bun:test';

// Mock SvelteKit navigation
mock.module('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	replaceState: () => Promise.resolve(),
	pushState: () => Promise.resolve(),
	beforeNavigate: () => {},
	afterNavigate: () => {},
	disableScrollHandling: () => {},
	preloadData: () => Promise.resolve(),
	preloadCode: () => Promise.resolve()
}));

// Mock FilterWorker
mock.module('$lib/workers/filterWorker.ts?worker', () => {
	return {
		default: class MockWorker {
			postMessage() {}
			onmessage() {}
			terminate() {}
		}
	};
});

// Mock Svelte stores if needed, but they should work natively
// We might need to mock $app/stores if used
mock.module('$app/stores', () => ({
	page: { subscribe: () => {} },
	navigating: { subscribe: () => {} },
	updated: { subscribe: () => {} }
}));

// Mock window and document globally for all tests
if (typeof global.window === 'undefined') {
	global.window = {
		location: {
			origin: 'http://localhost',
			href: 'http://localhost/',
			pathname: '/',
			search: ''
		},
		scrollTo: () => {},
		localStorage: {
			getItem: () => null,
			setItem: () => {}
		}
	} as unknown as Window & typeof globalThis;
}

if (typeof global.localStorage === 'undefined') {
	global.localStorage = {
		getItem: () => null,
		setItem: () => {},
		removeItem: () => {},
		clear: () => {},
		key: () => null,
		length: 0
	} as unknown as Storage;
}

if (typeof global.document === 'undefined') {
	global.document = {
		documentElement: {
			classList: {
				add: () => {},
				remove: () => {}
			}
		},
		body: {
			classList: {
				add: () => {},
				remove: () => {}
			},
			style: {}
		}
	} as unknown as Document;
}

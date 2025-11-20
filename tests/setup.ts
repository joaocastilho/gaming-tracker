import { mock } from 'bun:test';

// Mock SvelteKit navigation
mock.module('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve(),
	replaceState: () => Promise.resolve(),
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

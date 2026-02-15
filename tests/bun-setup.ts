/**
 * Bun test setup file
 *
 * This file is used when running tests with Bun's native test runner.
 * It mocks SvelteKit $app modules that Bun cannot resolve natively.
 *
 * Usage: bun test --preload ./tests/bun-setup.ts
 *
 * Note: For best results with Svelte 5 and SvelteKit, use Vitest instead:
 *   bun run test       (uses Vitest)
 *   bunx vitest run    (explicitly uses Vitest)
 */

import { mock } from 'bun:test';

// Mock SvelteKit environment
mock.module('$app/environment', () => ({
	browser: true,
	dev: false,
	building: false,
	version: 'test'
}));

// Mock SvelteKit navigation
mock.module('$app/navigation', () => ({
	goto: () => Promise.resolve(),
	replaceState: () => {},
	pushState: () => {},
	invalidate: () => Promise.resolve(),
	invalidateAll: () => Promise.resolve()
}));

// Mock SvelteKit state
mock.module('$app/state', () => ({
	page: {
		subscribe: (fn: (value: unknown) => void) => {
			fn({ url: new URL('http://localhost:3000/'), params: {} });
			return () => {};
		}
	}
}));

// Mock SvelteKit stores
mock.module('$app/stores', () => ({
	page: {
		subscribe: (fn: (value: unknown) => void) => {
			fn({ url: new URL('http://localhost:3000/'), params: {} });
			return () => {};
		}
	},
	navigating: {
		subscribe: (fn: (value: unknown) => void) => {
			fn(null);
			return () => {};
		}
	},
	updated: {
		subscribe: (fn: (value: unknown) => void) => {
			fn(false);
			return () => {};
		}
	}
}));

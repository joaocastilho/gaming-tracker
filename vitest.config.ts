/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['tests/**/*.{test,spec}.{js,ts}'],
		setupFiles: ['fake-indexeddb/auto', 'tests/setup.ts'],
		restoreMocks: true,
		testTimeout: 10000,
	},
	resolve: {
		conditions: ['browser'],
	},
} as Parameters<typeof defineConfig>[0]);

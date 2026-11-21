/// <reference types="vitest/config" />
import solid from '@solidjs/vite-plugin';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [solid()],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['tests/**/*.{test,spec}.{js,ts,tsx}'],
		setupFiles: ['fake-indexeddb/auto', 'tests/setup.ts'],
		restoreMocks: true,
		testTimeout: 10000,
	},
	resolve: {
		conditions: ['development', 'browser'],
	},
});

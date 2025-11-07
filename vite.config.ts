import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'exclude-large-dataset',
			closeBundle() {
				console.log('🔧 Excluding large dataset from build...');

				const buildDir = 'build';
				const largeDatasetPath = join(buildDir, 'games-large.json');
				const largeDatasetBrPath = join(buildDir, 'games-large.json.br');
				const largeDatasetGzPath = join(buildDir, 'games-large.json.gz');

				// Remove the large dataset files from build output
				try {
					if (existsSync(largeDatasetPath)) {
						unlinkSync(largeDatasetPath);
					}
					if (existsSync(largeDatasetBrPath)) {
						unlinkSync(largeDatasetBrPath);
					}
					if (existsSync(largeDatasetGzPath)) {
						unlinkSync(largeDatasetGzPath);
					}
				} catch (error) {
					console.warn('⚠️  Failed to exclude large dataset from build:', error);
				}
			}
		}
	],
	build: {
		rollupOptions: {
			output: {
				// Optimize chunk splitting for better caching
				// Use function-based manualChunks to check actual module IDs
				manualChunks: (id) => {
					// Check if it's from node_modules
					if (id.includes('node_modules')) {
						// UI libraries
						if (id.includes('lucide-svelte')) {
							return 'vendor-ui';
						}
						// Utility libraries
						if (id.includes('date-fns')) {
							return 'vendor-utils';
						}
						if (id.includes('zod')) {
							return 'vendor-utils';
						}
						// Group other large vendor packages
						if (id.includes('svelte') || id.includes('@sveltejs')) {
							return 'vendor-svelte';
						}
						// Other vendor code
						return 'vendor';
					}
				}
			}
		},
		chunkSizeWarningLimit: 1000,
		sourcemap: false
	},
	// Optimize dependencies
	optimizeDeps: {
		include: ['lucide-svelte', 'date-fns']
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});

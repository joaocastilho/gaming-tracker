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

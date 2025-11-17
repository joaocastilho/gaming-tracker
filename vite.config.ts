import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { unlinkSync, existsSync } from 'fs';
import { join } from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: 'exclude-large-dataset',
			closeBundle() {
				if (process.env.NODE_ENV !== 'production') {
					console.log('🔧 Excluding large dataset from build...');
				}

				const buildDir = 'build';
				const largeDatasetPath = join(buildDir, 'games-large.json');
				const largeDatasetBrPath = join(buildDir, 'games-large.json.br');
				const largeDatasetGzPath = join(buildDir, 'games-large.json.gz');

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
				manualChunks(id) {
					// Application-specific chunks
					if (id.includes('$lib/components/FilterDropdown.svelte')) {
						return 'filters';
					}
					if (id.includes('$lib/components/DetailModal.svelte')) {
						return 'modals';
					}
					if (id.includes('$lib/components/GameEditorModal.svelte')) {
						return 'editor';
					}
					if (id.includes('$lib/stores/filteredGamesStore.ts')) {
						return 'games-store';
					}
					if (id.includes('$lib/views/GamesView.svelte')) {
						return 'games-view';
					}
					if (id.includes('$lib/components/VirtualList.svelte')) {
						return 'virtual-list';
					}

					// Vendor chunks
					if (id.includes('node_modules')) {
						if (id.includes('lucide-svelte')) {
							return 'vendor-ui';
						}
						if (id.includes('html2canvas')) {
							return 'vendor-canvas';
						}
						if (
							id.includes('date-fns') ||
							id.includes('zod') ||
							id.match(/node_modules\/(lodash|date-fns|dayjs)/)
						) {
							return 'vendor-utils';
						}
						if (id.includes('svelte') || id.includes('@sveltejs')) {
							return 'vendor-svelte';
						}
						return 'vendor';
					}
				}
			}
		},
		target: 'es2020',
		cssCodeSplit: true,
		minify: 'esbuild',
		sourcemap: false,
		assetsInlineLimit: 4096,
		chunkSizeWarningLimit: 1000,
		modulePreload: {
			polyfill: false
		}
	},
	optimizeDeps: {
		include: ['lucide-svelte', 'date-fns'],
		exclude: ['web-vitals']
	},
	server: {
		fs: {
			strict: false
		}
	}
});

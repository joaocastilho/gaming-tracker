import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

function stripHtmlComments() {
	return {
		name: 'strip-html-comments',
		apply: 'build' as const,
		transformIndexHtml(html: string) {
			return html.replace(/<!--(?!\[\[!-?-?])(?:\s|[\S\s])*?-->/g, '');
		},
	};
}

function injectBuildDate() {
	return {
		name: 'inject-build-date',
		transformIndexHtml(html: string) {
			return html.replace('%build-date%', String(Date.now()));
		},
	};
}

export default defineConfig({
	define: {
		__BUILD_DATE__: Date.now(),
	},
	plugins: [
		tailwindcss(),
		sveltekit(),
		injectBuildDate(),
		stripHtmlComments(),
		{
			name: 'fix-mjs-content-type',
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					const url = req.url;
					if (url?.endsWith('.mjs') || url?.endsWith('.js')) {
						res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
					} else if (url?.endsWith('.ts')) {
						res.setHeader('Content-Type', 'text/x-typescript; charset=utf-8');
					}
					next();
				});
			},
		},
	],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id: string) {
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

					if (id.includes('node_modules')) {
						if (id.includes('zod') || id.match(/node_modules\/(lodash|dayjs)/)) {
							return 'vendor-utils';
						}
						if (id.includes('svelte') || id.includes('@sveltejs')) {
							return 'vendor-svelte';
						}
						return 'vendor';
					}
				},
			},
		},
		target: 'es2020',
		minify: true,
		sourcemap: false,
		assetsInlineLimit: 4096,
		chunkSizeWarningLimit: 1000,
		modulePreload: {
			polyfill: false,
		},
	},
	optimizeDeps: {
		include: ['lucide-svelte', 'zod', 'dexie'],
		exclude: ['web-vitals'],
	},
	server: {
		fs: {
			strict: false,
		},
	},
});

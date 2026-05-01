import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function stripHtmlComments() {
	return {
		name: 'strip-html-comments',
		apply: 'build' as const,
		transformIndexHtml(html: string) {
			return html.replace(/<!--(?!\[\[!-?-?])(?:\s|[\S\s])*?-->/g, '');
		},
	};
}

function optimizeCss() {
	return {
		name: 'optimize-css',
		apply: 'build' as const,
		transformIndexHtml(html: string) {
			// Read critical CSS
			const criticalCss = fs.readFileSync(path.resolve('src/lib/styles/critical.css'), 'utf-8');

			// 1. Convert stylesheet links to async preload
			// This matches the pattern SvelteKit uses for CSS links
			let newHtml = html.replace(
				/<link rel="stylesheet" href="([^"]+\.css)">/g,
				'<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel=\'stylesheet\'">'
			);

			// 2. Inject critical CSS and noscript fallback
			newHtml = newHtml.replace('</head>', `    <style>${criticalCss}</style>\n    </head>`);

			return newHtml;
		},
	};
}

function injectBuildDate() {
	return {
		name: 'inject-build-date',
		transformIndexHtml(html: string) {
			const buildDate = new Date().toLocaleString(undefined, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
				timeZoneName: 'short',
			});
			return html.replace('%build-date%', buildDate);
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
		optimizeCss(),
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
						if (id.includes('dexie')) {
							return 'vendor-db';
						}
						if (id.includes('@chenglou/pretext')) {
							return 'vendor-text';
						}
						if (id.includes('lucide-svelte')) {
							return 'vendor-icons';
						}
						if (id.includes('zod')) {
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

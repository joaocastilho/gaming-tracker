import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { readFileSync } from 'fs';

// Read package.json version at build time
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Custom plugin to strip HTML comments in production
function stripHtmlComments() {
	return {
		name: 'strip-html-comments',
		apply: 'build' as const,
		transformIndexHtml(html: string) {
			// Match HTML comments but exclude Svelte's internal markers
			// Svelte markers: <!--[!-->, <!--]-->, <!---->
			// We want to keep Svelte markers but remove developer comments
			return html.replace(/<!--(?!\[\[!-?-?])(?:\s|[\S\s])*?-->/g, '');
		}
	};
}

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version)
	},
	plugins: [
		sveltekit(),
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
			}
		},
		devtoolsJson()
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

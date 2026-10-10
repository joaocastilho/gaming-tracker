import type { Plugin } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// SvelteKit 3 no longer supports transformIndexHtml (it renders HTML itself),
// so post-process the emitted HTML assets at the end of the build instead.
// Only safe transforms are applied here — Svelte's hydration markers must be
// preserved, so comments are intentionally left untouched.
function postProcessHtml(): Plugin {
	return {
		name: 'post-process-html',
		writeBundle(_options, bundle) {
			const criticalCss = fs.readFileSync(path.resolve('src/lib/styles/critical.css'), 'utf-8');
			for (const file of Object.values(bundle)) {
				if (file.type !== 'asset' || !file.fileName.endsWith('.html')) continue;
				file.source = String(file.source).replace('</head>', `    <style>${criticalCss}</style>\n    </head>`);
			}
		},
	};
}

export default defineConfig({
	define: {
		__BUILD_DATE__: Date.now(),
	},
	plugins: [
		tailwindcss(),
		sveltekit({
			preprocess: vitePreprocess(),
			inlineStyleThreshold: 8192,
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				fallback: '404.html',
				precompress: true,
				strict: true,
			}),
		}),
		postProcessHtml(),
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
					// Vendor splitting only. Component-level rules that matched on
					// '#lib/...' specifiers never fired (Vite passes resolved file
					// paths here), and the components they targeted are lazily
					// imported via {#await import(...)} anyway, so they get their
					// own chunks from the dynamic imports themselves.
					if (id.includes('node_modules')) {
						if (id.includes('chart.js') || id.includes('chartjs-plugin-datalabels')) {
							return 'vendor-charts';
						}
						if (id.includes('dexie')) {
							return 'vendor-db';
						}
						if (id.includes('@chenglou/pretext')) {
							return 'vendor-text';
						}
						if (id.includes('@lucide/svelte') || id.includes('lucide-svelte')) {
							return 'vendor-icons';
						}
						if (id.includes('zod')) {
							return 'editor';
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
		include: ['@lucide/svelte', 'zod', 'dexie'],
	},
	server: {
		fs: {
			strict: false,
		},
	},
});

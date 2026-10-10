import type { Plugin } from 'vite';
import type { Adapter } from '@sveltejs/kit';
import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';

// Stylesheets for components that are only ever dynamically imported (the
// layout's {#await import(...)} modals and menus) must not block first paint.
// SvelteKit already defers most of them with `disabled media="(max-width: 0)`,
// but occasionally one still ships in the critical path — so anything left
// render-blocking is switched to print media and flipped on by a tiny inline
// script once it arrives. Inline handlers are not an option: _headers sets
// script-src-attr to a hash allowlist, which blocks them.
const LAZY_COMPONENT_CSS = [
	'DetailModal',
	'GameEditorModal',
	'DeleteConfirmModal',
	'LoginModal',
	'MobileSearch',
	'MobileFilters',
	'MobileSettingsMenu',
];

const DEFER_SCRIPT = `    <script>
document.querySelectorAll('link[data-deferred-css]').forEach(function (l) {
	if (l.sheet) {
		l.media = 'all';
		return;
	}
	l.addEventListener('load', function () { l.media = 'all'; }, { once: true });
});
</script>
`;

function deferLazyCss(html: string): string {
	let deferred = 0;
	const withMedia = html.replace(/<link([^>]*rel="stylesheet"[^>]*)>/g, (tag: string, attrs: string) => {
		if (!LAZY_COMPONENT_CSS.some((name) => attrs.includes(name))) return tag;
		// Already non-blocking (SvelteKit's own deferral) - leave it alone.
		if (attrs.includes('disabled') || attrs.includes('media=')) return tag;
		deferred += 1;
		return `<link${attrs} media="print" data-deferred-css>`;
	});
	return deferred === 0 ? withMedia : withMedia.replace('</head>', `${DEFER_SCRIPT}    </head>`);
}

// The service worker is source-controlled with its comments, but should be
// served minified. static/ is copied verbatim by Vite, so build it from src/
// and emit it as a plain asset instead. The `.source` suffix keeps Vite from
// treating `service-worker.js` as its own service-worker entry, which builds
// with code splitting disabled and rejects the manualChunks config below.
function emitServiceWorker(): Plugin {
	return {
		name: 'emit-service-worker',
		generateBundle() {
			const source = fs.readFileSync(path.resolve('src/service-worker.source.js'), 'utf-8');
			let output = source;
			if (typeof Bun !== 'undefined') {
				// @ts-expect-error bun-types ships TranspilerOptions without `minify`, but Bun 1.4 supports it
				output = new Bun.Transpiler({ loader: 'js', minify: true, target: 'browser' }).transformSync(source);
			}
			this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: output });
		},
	};
}

// SvelteKit 3 no longer supports transformIndexHtml (it renders HTML itself),
// and every bundling hook runs before adapter-static writes the prerendered
// pages, so the HTML has to be rewritten on disk after the adapter finishes.
// Only safe transforms are applied - SvelteKit's hydration markers must be
// preserved, so comments are intentionally left untouched. Precompressed
// variants are regenerated so the served copies match the edited HTML.
const PAGES_DIR = 'build';

function postProcessAdapter(inner: Adapter): Adapter {
	return {
		...inner,
		name: `${inner.name}-post-processed`,
		async adapt(builder) {
			await inner.adapt(builder);

			const outDir = path.resolve(PAGES_DIR);
			if (!fs.existsSync(outDir)) return;

			const criticalCss = fs.readFileSync(path.resolve('src/lib/styles/critical.css'), 'utf-8');
			for (const entry of fs.readdirSync(outDir)) {
				if (!entry.endsWith('.html')) continue;

				const filePath = path.join(outDir, entry);
				const original = fs.readFileSync(filePath, 'utf-8');
				const processed = deferLazyCss(original.replace('</head>', `    <style>${criticalCss}</style>\n    </head>`));
				if (processed === original) continue;

				fs.writeFileSync(filePath, processed);
				const variants = [
					['gz', gzipSync(processed)],
					['br', brotliCompressSync(processed)],
				] as const;
				for (const [ext, data] of variants) {
					const compressedPath = `${filePath}.${ext}`;
					if (fs.existsSync(compressedPath)) fs.writeFileSync(compressedPath, data);
				}
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
		emitServiceWorker(),
		sveltekit({
			preprocess: vitePreprocess(),
			inlineStyleThreshold: 8192,
			adapter: postProcessAdapter(
				adapter({
					pages: PAGES_DIR,
					assets: PAGES_DIR,
					fallback: '404.html',
					precompress: true,
					strict: true,
				})
			),
		}),
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

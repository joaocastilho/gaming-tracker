import fs from 'node:fs';
import path from 'node:path';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { minifySync } from 'rolldown/experimental';
import { defineConfig, type Plugin } from 'vite';
import { devApiPlugin } from './scripts/devApiPlugin.js';

// Emit src/service-worker.source.js as minified /service-worker.js in the client build.
function emitServiceWorker(): Plugin {
	return {
		name: 'emit-service-worker',
		generateBundle() {
			if (this.environment?.name && this.environment.name !== 'client') return;
			const source = fs.readFileSync(path.resolve('src/service-worker.source.js'), 'utf-8');
			const minified = minifySync('service-worker.js', source).code;
			this.emitFile({ type: 'asset', fileName: 'service-worker.js', source: minified });
		},
	};
}

// Post-process dist/client/index.html after the Solid Start static shell is
// written: inject critical.css, stamp SPA fallback 404.html, and write
// precompressed .gz / .br variants.
function postProcessStaticShell(): Plugin {
	return {
		name: 'post-process-static-shell',
		apply: 'build',
		enforce: 'post',
		buildApp: {
			order: 'post',
			async handler() {
				const outDir = path.resolve('dist/client');
				const indexPath = path.join(outDir, 'index.html');
				if (!fs.existsSync(indexPath)) return;

				const criticalCss = fs
					.readFileSync(path.resolve('src/lib/styles/critical.css'), 'utf-8')
					.replace(/\/\*[\s\S]*?\*\//g, '')
					.replace(/\s+/g, ' ')
					.replace(/\s*([{}:;,])\s*/g, '$1')
					.trim();
				const original = fs.readFileSync(indexPath, 'utf-8');
				const criticalTag = `<style>${criticalCss}</style>`;
				let processed = original;
				if (!original.includes(criticalCss)) {
					const firstStylesheet = original.indexOf('<link rel="stylesheet"');
					processed =
						firstStylesheet >= 0
							? `${original.slice(0, firstStylesheet)}${criticalTag}${original.slice(firstStylesheet)}`
							: original.replace('</head>', `${criticalTag}</head>`);
				}

				const routeShells = [
					'index.html',
					'404.html',
					'library.html',
					'completed.html',
					'planned.html',
					'tierlist.html',
					'stats.html',
					'login.html',
				];
				for (const fileName of routeShells) {
					const targetPath = path.join(outDir, fileName);
					fs.writeFileSync(targetPath, processed);
					fs.writeFileSync(`${targetPath}.gz`, gzipSync(processed));
					fs.writeFileSync(`${targetPath}.br`, brotliCompressSync(processed));
				}

				// Mirror dist/client -> build/ so Cloudflare Pages uses the same output directory as main.
				const pagesOutDir = path.resolve('build');
				fs.rmSync(pagesOutDir, { recursive: true, force: true });
				fs.cpSync(outDir, pagesOutDir, { recursive: true });
			},
		},
	};
}

export default defineConfig({
	publicDir: 'static',
	define: {
		__BUILD_DATE__: Date.now(),
	},
	plugins: [tailwindcss(), devApiPlugin(), emitServiceWorker(), solid({ start: true }), postProcessStaticShell()],
	build: {
		target: 'es2020',
		minify: true,
		sourcemap: false,
		assetsInlineLimit: 4096,
		chunkSizeWarningLimit: 1000,
		modulePreload: {
			polyfill: false,
		},
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{
							name: 'vendor-runtime',
							priority: 30,
							test: (id) => id.includes('rolldown') && id.includes('runtime'),
						},
						{
							name: 'vendor-solid',
							priority: 25,
							test: /node_modules[\\/](solid-js|@solidjs)[\\/]/,
						},
						{
							name: 'vendor-icons',
							priority: 20,
							test: /node_modules[\\/]@lucide[\\/]solid[\\/]/,
						},
						{
							name: 'vendor-charts',
							priority: 15,
							test: /node_modules[\\/](chart\.js|chartjs-plugin-datalabels)[\\/]/,
						},
						{
							name: 'vendor-db',
							priority: 15,
							test: /node_modules[\\/]dexie[\\/]/,
						},
						{
							name: 'vendor-text',
							priority: 15,
							test: /node_modules[\\/]@chenglou[\\/]pretext[\\/]/,
						},
						{
							name: 'editor',
							priority: 15,
							test: /node_modules[\\/]zod[\\/]/,
						},
						{
							name: 'vendor',
							priority: 5,
							test: /node_modules[\\/]/,
						},
					],
				},
			},
		},
	},
	optimizeDeps: {
		include: ['zod', 'dexie'],
	},
	server: {
		fs: {
			strict: false,
		},
	},
});

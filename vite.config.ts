import fs from 'node:fs';
import path from 'node:path';
import solid from '@solidjs/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { minifySync } from 'rolldown/experimental';
import { defineConfig, type Plugin } from 'vite';

// Emit src/service-worker.source.js as minified /service-worker.js.
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

export default defineConfig({
	publicDir: 'static',
	define: {
		__BUILD_DATE__: Date.now(),
	},
	plugins: [tailwindcss(), emitServiceWorker(), solid({ start: true })],
	build: {
		outDir: 'build',
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
							test: (id) => id.includes('rolldown') && id.includes('runtime'),
						},
						{
							name: 'vendor-charts',
							test: /node_modules[\\/](chart\.js|chartjs-plugin-datalabels)/,
						},
						{ name: 'vendor-db', test: /node_modules[\\/]dexie/ },
						{ name: 'vendor-text', test: /node_modules[\\/]@chenglou[\\/]pretext/ },
						{ name: 'vendor-icons', test: /node_modules[\\/]@lucide[\\/]solid/ },
						{ name: 'editor', test: /node_modules[\\/]zod/ },
						{ name: 'vendor-solid', test: /node_modules[\\/](solid-js|@solidjs)/ },
						{ name: 'vendor', test: /node_modules/ },
					],
				},
			},
		},
	},
	optimizeDeps: {
		include: ['@lucide/solid', 'zod', 'dexie'],
	},
	server: {
		fs: {
			strict: false,
		},
	},
});

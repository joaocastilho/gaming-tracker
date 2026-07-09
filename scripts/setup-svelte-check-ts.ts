import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(__dirname, '..');
const ts6Path = path.join(projectRoot, 'node_modules', 'typescript6');
const svelteCheckNodeModules = path.join(projectRoot, 'node_modules', 'svelte-check', 'node_modules');
const targetTsPath = path.join(svelteCheckNodeModules, 'typescript');

function log(msg: string) {
	console.log(`[setup-svelte-check-ts] ${msg}`);
}

if (!fs.existsSync(ts6Path)) {
	log(`Error: typescript6 not found at ${ts6Path}. Make sure to run bun install first.`);
	process.exit(1);
}

const targets = [
	path.join(projectRoot, 'node_modules', 'svelte-check', 'node_modules'),
	path.join(projectRoot, 'node_modules', '@sveltejs', 'kit', 'node_modules'),
];

for (const targetNodeModules of targets) {
	const targetTsPath = path.join(targetNodeModules, 'typescript');
	if (!fs.existsSync(path.dirname(targetNodeModules))) {
		log(`Warning: Target package parent not found. Skipping ${targetNodeModules}`);
		continue;
	}

	try {
		// Create target node_modules if it doesn't exist
		if (!fs.existsSync(targetNodeModules)) {
			fs.mkdirSync(targetNodeModules, { recursive: true });
		}

		// Remove target directory if it already exists
		if (fs.existsSync(targetTsPath)) {
			fs.rmSync(targetTsPath, { recursive: true, force: true });
		}

		// Create symlink or copy
		if (process.platform === 'win32') {
			fs.symlinkSync(ts6Path, targetTsPath, 'junction');
			log(`Created junction from ${ts6Path} to ${targetTsPath}`);
		} else {
			fs.symlinkSync(ts6Path, targetTsPath, 'dir');
			log(`Created symlink from ${ts6Path} to ${targetTsPath}`);
		}
	} catch (err) {
		log(`Failed to symlink/junction. Trying recursive copy to ${targetTsPath}...`);
		try {
			fs.cpSync(ts6Path, targetTsPath, { recursive: true });
			log(`Copied ${ts6Path} to ${targetTsPath}`);
		} catch (copyErr) {
			console.error(`Error: Failed to setup typescript workaround for ${targetTsPath}`, copyErr);
			process.exit(1);
		}
	}
}

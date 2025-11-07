import prettier from 'eslint-config-prettier';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = fileURLToPath(new URL('./.gitignore', import.meta.url));

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: ['scripts/**/*']
	},
	{
		files: ['eslint.config.js'],
		languageOptions: {
			globals: {
				...globals.node,
				URL: 'readonly'
			}
		}
	},
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs.recommended,
	prettier,
	...svelte.configs.prettier,
	{
		files: ['**/*.{ts,tsx,svelte}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				URL: 'readonly'
			},
			parserOptions: {
				project: './tsconfig.json'
			}
		},
		rules: {
			'no-undef': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'@typescript-eslint/no-deprecated': 'warn'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// Service Worker configuration
		files: ['static/service-worker.js'],
		languageOptions: {
			globals: {
				self: 'readonly',
				caches: 'readonly',
				fetch: 'readonly',
				URL: 'readonly',
				location: 'readonly',
				ServiceWorkerGlobalScope: 'readonly',
				ExtendableEvent: 'readonly',
				FetchEvent: 'readonly'
			}
		},
		rules: {
			'no-undef': 'off' // Service worker runs in a different context
		}
	}
);

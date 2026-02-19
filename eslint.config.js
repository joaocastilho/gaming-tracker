import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Global ignores
	{
		ignores: ['node_modules/**', '.svelte-kit/**', 'build/**', 'dist/**', '.git/**', '.wrangler/**']
	},

	// Base JS config
	js.configs.recommended,

	// TypeScript config
	...tseslint.configs.recommended,

	// Svelte config
	...svelte.configs['flat/recommended'],

	// Global settings
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
				__APP_VERSION__: 'readonly',
				__BUILD_DATE__: 'readonly'
			}
		}
	},

	// TypeScript files including .svelte.ts
	{
		files: ['**/*.ts', '**/*.svelte.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				extraFileExtensions: ['.svelte']
			}
		}
	},

	// Svelte file settings
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},

	// Custom rules for all files
	{
		rules: {
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',
			'svelte/no-at-html-tags': 'warn',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	}
];

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	// Global ignores
	{
		ignores: ['node_modules/**', '.svelte-kit/**', 'build/**', 'dist/**', '.git/**']
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
				...globals.node
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
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/ban-ts-comment': 'off',
			'svelte/no-at-html-tags': 'off',
			'svelte/no-navigation-without-resolve': 'off',
			'svelte/prefer-svelte-reactivity': 'off'
		}
	}
];

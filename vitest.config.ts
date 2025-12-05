import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['tests/**/*.{test,spec}.{js,ts}']
		// Exclude the large dataset plugin logic by not including it here
		// or just by virtue of this being a separate config that doesn't import it
	}
});

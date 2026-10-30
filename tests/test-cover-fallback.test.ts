import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { beforeEach, describe, expect, it } from 'vitest';

import HomePage from '../src/routes/+page.svelte';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { imageErrorStore } from '#lib/stores/imageErrors.svelte.js';
import { createTestGame } from './helpers/factories';

function readStatsSource(): string {
	return readFileSync(resolve(process.cwd(), 'src/routes/stats/+page.svelte'), 'utf8');
}

/**
 * Covers are committed to games.json before their generated assets exist
 * (the optimize-covers GitHub Action runs afterwards), so a freshly added
 * game can point at a cover that 404s for minutes. Every cover must fall
 * back to the shared no-cover placeholder instead of rendering broken.
 */
describe('cover placeholder fallback', () => {
	beforeEach(() => {
		imageErrorStore.failedUrls.length = 0;
	});

	describe('home Now Playing cards', () => {
		it('swaps a failing cover to the no-cover placeholder', async () => {
			gamesStore.setAllGames([
				createTestGame({ title: 'In Progress', coverImage: 'covers/in-progress.webp', status: 'Playing' }),
			]);

			const { container } = render(HomePage);

			const img = container.querySelector('img.np-cover');
			expect(img).toHaveAttribute('src', '/covers/in-progress.webp');

			img?.dispatchEvent(new Event('error'));
			await new Promise((resolve) => setTimeout(resolve, 0));

			expect(imageErrorStore.hasFailed('/covers/in-progress.webp')).toBe(true);
			expect(img).toHaveAttribute('src', '/covers/placeholder_cover.webp');
		});

		it('uses the placeholder for a game without a cover path', async () => {
			gamesStore.setAllGames([createTestGame({ title: 'No Cover', coverImage: '', status: 'Playing' })]);

			const { container } = render(HomePage);

			expect(container.querySelector('img.np-cover')).toHaveAttribute('src', '/covers/placeholder_cover.webp');
		});
	});

	describe('stats top rated rows', () => {
		it('guards every rating cover instead of rendering a raw path', () => {
			const source = readStatsSource();
			const imgLines = source.split('\n').filter((line) => line.includes('class="rating-cover"'));

			expect(imgLines.length).toBe(4);
			for (const line of imgLines) {
				expect(line).toContain('onerror={handleCoverError}');
			}
			expect(source).not.toContain('src="/{game.coverImage}"');
			expect(source).toContain('function handleCoverError');
		});
	});
});

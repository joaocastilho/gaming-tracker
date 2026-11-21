import { render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('#lib/stores/editor.js', () => ({
	editorStore: {
		editorMode: false,
	},
}));
vi.mock('#lib/stores/offline.js', () => ({
	offlineStore: {
		isOnline: true,
	},
}));
vi.mock('#lib/stores/filters.js', () => ({
	filtersStore: {
		toggleTier: vi.fn(),
	},
}));

import GameCardArtwork from '#lib/components/game-card/GameCardArtwork.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import type { Game } from '#lib/types/game.js';

beforeEach(() => {
	imageErrorStore.failedUrls.length = 0;
});

describe('GameCardArtwork cover failures', () => {
	it('marks the game base cover path as failed and shows the placeholder', async () => {
		const game: Game = {
			id: 'cover-failure-1',
			title: 'Missing Cover',
			mainTitle: 'Missing Cover',
			subtitle: null,
			platform: 'Switch',
			genre: 'Action',
			year: 2024,
			coOp: 'No',
			status: 'Playing',
			coverImage: 'covers/missing-cover.webp',
			playtime: '3h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null,
		};
		const { container } = render(() => <GameCardArtwork game={game} />);

		const img = screen.getByRole('img');
		Object.defineProperty(img, 'currentSrc', {
			value: 'http://localhost:4173/covers/missing-cover-200w.webp',
			configurable: true,
		});
		img.dispatchEvent(new Event('error'));
		flush();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(imageErrorStore.hasFailed('/covers/missing-cover-200w.webp')).toBe(true);
		expect(imageErrorStore.hasFailed('/covers/missing-cover.webp')).toBe(true);

		expect(container.querySelector('img')).toHaveAttribute('src', '/covers/placeholder_cover.webp');
	});
});

describe('GameCardArtwork Component', () => {
	const mockGame: Game = {
		id: 'game-1',
		title: 'Metroid Dread',
		mainTitle: 'Metroid Dread',
		subtitle: null,
		platform: 'Switch',
		genre: 'Action',
		year: 2021,
		coOp: 'No',
		status: 'Completed',
		coverImage: 'metroid.webp',
		playtime: '12h',
		finishedDate: '2021-10-10',
		ratingPresentation: 9,
		ratingStory: 8,
		ratingGameplay: 9,
		score: 18,
		tier: 'S - Masterpiece',
	};

	it('should render cover image and skeleton', () => {
		const { container } = render(() => <GameCardArtwork game={mockGame} />);

		const img = screen.getByRole('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/metroid.webp');

		const skeleton = container.querySelector('.skeleton-loader');
		expect(skeleton).toBeInTheDocument();
	});

	it('should disable transition if image is already cached', async () => {
		const originalProperty = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'complete');
		Object.defineProperty(HTMLImageElement.prototype, 'complete', {
			value: true,
			writable: true,
			configurable: true,
		});
		Object.defineProperty(HTMLImageElement.prototype, 'naturalHeight', {
			value: 450,
			writable: true,
			configurable: true,
		});

		const { container } = render(() => <GameCardArtwork game={mockGame} />);
		flush();

		const img = screen.getByRole('img');
		expect(img.style.transition).toBe('none');

		const skeleton = container.querySelector('.skeleton-loader') as HTMLElement;
		expect(skeleton.style.transition).toBe('none');

		if (originalProperty) {
			Object.defineProperty(HTMLImageElement.prototype, 'complete', originalProperty);
		}
	});
});

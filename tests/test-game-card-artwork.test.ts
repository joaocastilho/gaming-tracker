import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';

// Mock stores
vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		editorMode: false,
	},
}));
vi.mock('$lib/stores/offline.svelte', () => ({
	offlineStore: {
		isOnline: true,
	},
}));
vi.mock('$lib/stores/filters.svelte', () => ({
	filtersStore: {
		toggleTier: vi.fn(),
	},
}));
vi.mock('$lib/stores/imageErrors.svelte', () => ({
	imageErrorStore: {
		hasFailed: () => false,
		markFailed: vi.fn(),
	},
}));

import GameCardArtwork from '$lib/components/game-card/GameCardArtwork.svelte';
import type { Game } from '$lib/types/game';

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
		const { container } = render(GameCardArtwork, {
			props: {
				game: mockGame,
			},
		});

		const img = screen.getByRole('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', '/metroid.webp');

		const skeleton = container.querySelector('.skeleton-loader');
		expect(skeleton).toBeInTheDocument();
	});

	it('should disable transition if image is already cached', async () => {
		// Mock image complete state
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

		const { container } = render(GameCardArtwork, {
			props: {
				game: mockGame,
			},
		});

		const img = screen.getByRole('img');
		expect(img.style.transition).toBe('none');

		const skeleton = container.querySelector('.skeleton-loader') as HTMLElement;
		expect(skeleton.style.transition).toBe('none');

		// Restore original properties
		if (originalProperty) {
			Object.defineProperty(HTMLImageElement.prototype, 'complete', originalProperty);
		}
	});
});

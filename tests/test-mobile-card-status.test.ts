import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import GameCard from '$lib/components/GameCard.svelte';
import GameCardInfo from '$lib/components/game-card/GameCardInfo.svelte';
import GameCardBadges from '$lib/components/game-card/GameCardBadges.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

// Mock window store as mobile to verify badge colors are preserved
vi.mock('$lib/stores/window.svelte', () => ({
	windowSize: {
		width: 390,
		height: 844,
		isMobile: true,
	},
}));

vi.mock('$lib/stores/modal.svelte', () => ({
	modalStore: {
		openViewModal: vi.fn(),
	},
}));

vi.mock('$lib/stores/filters.svelte', () => ({
	filtersStore: {
		togglePlatform: vi.fn(),
		toggleGenre: vi.fn(),
		toggleTier: vi.fn(),
		toggleCoOp: vi.fn(),
	},
}));

vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		get editorMode() {
			return false;
		},
	},
}));

vi.mock('$lib/stores/offline.svelte', () => ({
	offlineStore: {
		get isOnline() {
			return true;
		},
	},
}));

describe('Mobile not-complete card status (bug repro)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: 390,
		});
		global.ResizeObserver = class ResizeObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		} as unknown as typeof ResizeObserver;
	});

	it('Playing card shows PLAYING badge with playing colors on mobile viewport', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(GameCard, {
			props: { game, displayedGames: [game], size: 'small' },
		});

		// Badge text must be present even on narrow mobile cards
		expect(screen.getByText('PLAYING')).toBeTruthy();

		// Card must carry status for tinting
		const card = container.querySelector('.game-card');
		expect(card?.getAttribute('data-status')).toBe('playing');

		// Badge must carry playing color class (green tint), not fallback
		const badge = container.querySelector('.playing-badge');
		expect(badge).toBeTruthy();
	});

	it('Planned card shows PLANNED badge with planned colors on mobile viewport', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(GameCard, {
			props: { game, displayedGames: [game], size: 'small' },
		});

		expect(screen.getByText('PLANNED')).toBeTruthy();

		const card = container.querySelector('.game-card');
		expect(card?.getAttribute('data-status')).toBe('planned');

		const badge = container.querySelector('.planned-badge');
		expect(badge).toBeTruthy();
	});

	it('GameCardInfo shows status badge for non-completed games', () => {
		const playing = createTestGame({ status: 'Playing' });
		const { unmount } = render(GameCardInfo, { props: { game: playing } });
		expect(screen.getByText('PLAYING')).toBeTruthy();
		unmount();

		document.body.innerHTML = '';

		const planned = createTestGame({ status: 'Planned' });
		render(GameCardInfo, { props: { game: planned } });
		expect(screen.getByText('PLANNED')).toBeTruthy();
	});

	it('Completed card keeps score badge and completed tint', () => {
		const game = createCompletedGame();
		const { container } = render(GameCard, {
			props: { game, displayedGames: [game], size: 'small' },
		});

		expect(container.querySelector('.score-badge')).toBeTruthy();
		expect(container.querySelector('.game-card')?.getAttribute('data-status')).toBe('completed');
	});

	it('mobile platform/genre badges preserve colors (must NOT use disabled attr)', () => {
		const game = createTestGame({ status: 'Playing', platform: 'PC', genre: 'RPG' });
		const { container } = render(GameCardBadges, { props: { game } });

		const platformBtn = container.querySelector('.platform-badge');
		const genreBtn = container.querySelector('.genre-badge');

		expect(platformBtn).toBeTruthy();
		expect(genreBtn).toBeTruthy();

		// Color classes must be present
		expect(platformBtn?.className).toContain('platform-pc-badge');
		expect(genreBtn?.className).toContain('genre-rpg-badge');

		// Disabled buttons get greyed out by UA styles and lose badge colors.
		// Mobile must keep colors via pointer-events + JS guard, not `disabled`.
		expect(platformBtn?.hasAttribute('disabled')).toBe(false);
		expect(genreBtn?.hasAttribute('disabled')).toBe(false);
	});
});

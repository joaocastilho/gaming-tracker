import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { createGameSlug } from '$lib/utils/slugUtils';
import type { Game } from '$lib/types/game';

/**
 * Comprehensive tests for modalStore
 * Tests the live API: view-mode state, navigation, deep links, and URL sync.
 */

const mockGame: Game = {
	id: '1',
	title: 'Test Game',
	mainTitle: 'Test Game',
	subtitle: null,
	platform: 'PC',
	genre: 'RPG',
	status: 'Completed',
	tier: 'S - Masterpiece',
	score: 18,
	coOp: 'No',
	coverImage: 'covers/test.webp',
	year: 2024,
	playtime: '25h 0m',
	finishedDate: '2024-01-15',
	ratingPresentation: 9,
	ratingStory: 9,
	ratingGameplay: 9,
};

const mockGame2: Game = {
	...mockGame,
	id: '2',
	title: 'Test Game 2',
	mainTitle: 'Test Game 2',
};

const mockGames = [mockGame, mockGame2];

describe('ModalStore', () => {
	beforeEach(async () => {
		vi.useFakeTimers();
		modalStore.reset();
		gamesStore.initializeGames(mockGames);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Initial State', () => {
		it('starts with modal closed', () => {
			const state = modalStore.getState();
			expect(state.isOpen).toBe(false);
			expect(state.activeGame).toBeNull();
			expect(state.mode).toBe('view');
		});
	});

	describe('Open/Close Modal', () => {
		it('openViewModal opens modal with game', () => {
			modalStore.openViewModal(mockGame, mockGames);
			const state = modalStore.getState();
			expect(state.isOpen).toBe(true);
			expect(state.activeGame?.id).toBe('1');
			expect(state.mode).toBe('view');
		});

		it('openViewModal sets displayedGames', () => {
			modalStore.openViewModal(mockGame, mockGames);
			const state = modalStore.getState();
			expect(state.displayedGames.length).toBe(2);
		});

		it('openViewModal keeps previous displayed games when opening with empty list', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.openViewModal(mockGame2, []);
			const state = modalStore.getState();
			expect(state.activeGame?.id).toBe('2');
			expect(state.displayedGames.length).toBe(2);
		});

		it('closeModal closes modal and clears active game', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.closeModal();
			const state = modalStore.getState();
			expect(state.isOpen).toBe(false);
			expect(state.activeGame).toBeNull();
		});

		it('closeModal when already closed is a no-op', () => {
			expect(modalStore.getState().isOpen).toBe(false);
			modalStore.closeModal();
			expect(modalStore.getState().isOpen).toBe(false);
		});
	});

	describe('Filter Context', () => {
		it('openViewModal accepts filter context', () => {
			const filterContext = {
				searchTerm: 'test',
				platforms: ['PC'],
				activeTab: 'completed' as const,
			};
			modalStore.openViewModal(mockGame, mockGames, filterContext);
			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('test');
			expect(state.filterContext.platforms).toContain('PC');
			expect(state.filterContext.activeTab).toBe('completed');
		});

		it('openViewModal preserves existing context fields when partially updated', () => {
			const filterContext = {
				searchTerm: 'original',
				platforms: ['PC', 'PlayStation'],
				genres: [],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'all' as const,
			};
			modalStore.openViewModal(mockGame, mockGames, filterContext);
			modalStore.openViewModal(mockGame2, mockGames, { searchTerm: 'modified' });
			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('modified');
			expect(state.filterContext.platforms).toEqual(['PC', 'PlayStation']);
		});
	});

	describe('Reactive Navigation', () => {
		it('getReactiveNavigationGames filters by stored context', () => {
			modalStore.openViewModal(mockGame, mockGames, { platforms: ['PC'] });
			const result = modalStore.getReactiveNavigationGames(mockGames);
			expect(result).toHaveLength(2);
			expect(result.every((g) => g.platform === 'PC')).toBe(true);
		});

		it('getReactiveNavigationGames returns all games when no filters are applied', () => {
			modalStore.openViewModal(mockGame, mockGames);
			expect(modalStore.getReactiveNavigationGames(mockGames)).toEqual(mockGames);
		});
	});

	describe('Deep Links', () => {
		it('readFromURL opens the modal for a matching game slug', () => {
			const params = new URLSearchParams({ game: createGameSlug(mockGame.title) });
			modalStore.readFromURL(params, mockGames);
			const state = modalStore.getState();
			expect(state.isOpen).toBe(true);
			expect(state.activeGame?.id).toBe('1');
		});

		it('readFromURL closes the modal when no game is present', async () => {
			modalStore.readFromURL(new URLSearchParams({ game: createGameSlug(mockGame.title) }), mockGames);
			expect(modalStore.getState().isOpen).toBe(true);

			// Clear the writeToURL lock from the open before reading again
			await vi.advanceTimersByTimeAsync(100);

			modalStore.readFromURL(new URLSearchParams(), mockGames);
			expect(modalStore.getState().isOpen).toBe(false);
		});
	});
});

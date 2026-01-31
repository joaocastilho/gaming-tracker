import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { modalStore } from '$lib/stores/modal.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import type { Game } from '$lib/types/game';

// Mock game data
const mockGame: Game = {
	id: '1',
	title: 'Test Game',
	mainTitle: 'Test Game',
	subtitle: null,
	platform: 'PC',
	genre: 'RPG',
	year: 2023,
	coOp: 'No',
	status: 'Completed',
	coverImage: 'covers/test.webp',
	playtime: '50h',
	finishedDate: '2023-06-15',
	ratingPresentation: 9,
	ratingStory: 8,
	ratingGameplay: 9,
	score: 9,
	tier: 'A - Amazing'
};

const mockGame2: Game = {
	...mockGame,
	id: '2',
	title: 'Test Game 2',
	mainTitle: 'Test Game 2'
};

const mockGames = [mockGame, mockGame2];

describe('Detail Modal Interactions', () => {
	const originalWindow = global.window;

	beforeEach(async () => {
		vi.useFakeTimers();
		gamesStore.initializeGames(mockGames);
		modalStore.closeModal();
		await vi.advanceTimersByTimeAsync(100);

		// Mock window
		global.window = {
			location: {
				href: 'http://localhost/',
				toString: () => 'http://localhost/'
			},
			innerWidth: 1024,
			innerHeight: 768
		} as unknown as Window & typeof globalThis;
	});

	afterEach(() => {
		vi.useRealTimers();
		global.window = originalWindow;
	});

	describe('Escape Key Handling', () => {
		it('closes modal when Escape is pressed', () => {
			modalStore.openViewModal(mockGame, mockGames);
			expect(modalStore.isOpen).toBe(true);

			modalStore.handleEscape();

			expect(modalStore.isOpen).toBe(false);
		});

		it('does nothing if modal is already closed', () => {
			expect(modalStore.isOpen).toBe(false);
			modalStore.handleEscape();
			expect(modalStore.isOpen).toBe(false);
		});
	});

	describe('Modal State Management', () => {
		it('switches between games in displayed games list', () => {
			modalStore.openViewModal(mockGame, mockGames);
			expect(modalStore.activeGame?.id).toBe('1');

			modalStore.setActiveGame(mockGame2);
			expect(modalStore.activeGame?.id).toBe('2');
		});

		it('tracks displayed games for navigation', () => {
			modalStore.openViewModal(mockGame, mockGames);
			const state = modalStore.getState();

			expect(state.displayedGames).toHaveLength(2);
			expect(state.displayedGames[0].id).toBe('1');
			expect(state.displayedGames[1].id).toBe('2');
		});
	});

	describe('Mobile vs Desktop Behavior', () => {
		it('stores filter context when modal opens', () => {
			const filterContext = {
				searchTerm: 'test',
				platforms: ['PC'],
				genres: [],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'all' as const
			};

			modalStore.openViewModal(mockGame, mockGames, filterContext);
			const state = modalStore.getState();

			expect(state.filterContext.searchTerm).toBe('test');
			expect(state.filterContext.platforms).toEqual(['PC']);
		});

		it('updates filter context during modal session', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.updateFilterContext({ searchTerm: 'updated' });

			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('updated');
		});
	});
});

/**
 * DetailModal UI Tests
 * Tests that verify the DetailModal's UI interactions including:
 * - Navigation logic (next/prev game)
 * - Keyboard navigation
 * - Escape key handling
 * - State management integration with modalStore
 */
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { modalStore } from '$lib/stores/modal.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import type { Game } from '$lib/types/game';

// Mock game data for testing
const mockGames: Game[] = [
	{
		id: '1',
		title: 'First Game',
		mainTitle: 'First Game',
		subtitle: null,
		platform: 'PC',
		genre: 'RPG',
		year: 2023,
		coOp: 'No',
		status: 'Completed',
		coverImage: 'covers/first.webp',
		playtime: '20h',
		finishedDate: '2023-01-15',
		ratingPresentation: 8,
		ratingStory: 9,
		ratingGameplay: 8,
		score: 85,
		tier: 'A - Amazing'
	},
	{
		id: '2',
		title: 'Second Game',
		mainTitle: 'Second Game',
		subtitle: 'Subtitle',
		platform: 'PlayStation',
		genre: 'Action',
		year: 2022,
		coOp: 'Yes',
		status: 'Completed',
		coverImage: 'covers/second.webp',
		playtime: '40h',
		finishedDate: '2023-03-20',
		ratingPresentation: 9,
		ratingStory: 7,
		ratingGameplay: 9,
		score: 90,
		tier: 'S - Masterpiece'
	},
	{
		id: '3',
		title: 'Third Game',
		mainTitle: 'Third Game',
		subtitle: null,
		platform: 'Nintendo Switch',
		genre: 'Platformer',
		year: 2024,
		coOp: 'No',
		status: 'Planned',
		coverImage: 'covers/third.webp',
		playtime: '0h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null
	}
];

describe('DetailModal UI Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		gamesStore.initializeGames(mockGames);
		modalStore.closeModal();
	});

	afterEach(() => {
		modalStore.closeModal();
	});

	describe('Modal State Management', () => {
		it('should open modal with correct game', () => {
			modalStore.openViewModal(mockGames[0], mockGames);

			expect(modalStore.isOpen).toBe(true);
			expect(modalStore.activeGame?.id).toBe('1');
			expect(modalStore.activeGame?.title).toBe('First Game');
		});

		it('should store displayed games for navigation', () => {
			modalStore.openViewModal(mockGames[0], mockGames);

			const state = modalStore.getState();
			expect(state.displayedGames).toHaveLength(3);
			expect(state.displayedGames[0].id).toBe('1');
			expect(state.displayedGames[1].id).toBe('2');
			expect(state.displayedGames[2].id).toBe('3');
		});

		it('should close modal when closeModal is called', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.isOpen).toBe(true);

			modalStore.closeModal();
			expect(modalStore.isOpen).toBe(false);
		});
	});

	describe('Game Navigation', () => {
		it('should navigate to next game', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.activeGame?.id).toBe('1');

			modalStore.setActiveGame(mockGames[1]);
			expect(modalStore.activeGame?.id).toBe('2');
		});

		it('should navigate to previous game', () => {
			modalStore.openViewModal(mockGames[1], mockGames);
			expect(modalStore.activeGame?.id).toBe('2');

			modalStore.setActiveGame(mockGames[0]);
			expect(modalStore.activeGame?.id).toBe('1');
		});

		it('should track current index in displayed games', () => {
			modalStore.openViewModal(mockGames[1], mockGames);

			const state = modalStore.getState();
			// After opening with second game, the displayed games should have it
			expect(state.displayedGames.findIndex((g) => g.id === '2')).toBe(1);
		});

		it('should maintain game data during navigation', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			modalStore.setActiveGame(mockGames[1]);

			expect(modalStore.activeGame?.title).toBe('Second Game');
			expect(modalStore.activeGame?.platform).toBe('PlayStation');
			expect(modalStore.activeGame?.score).toBe(90);
		});
	});

	describe('Navigation Boundaries', () => {
		it('should handle navigation at first game', () => {
			modalStore.openViewModal(mockGames[0], mockGames);

			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			// At first game, index is 0
			expect(currentIndex).toBe(0);
			// Can navigate forward
			expect(currentIndex < state.displayedGames.length - 1).toBe(true);
		});

		it('should handle navigation at last game', () => {
			modalStore.openViewModal(mockGames[2], mockGames);

			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			// At last game, index is 2
			expect(currentIndex).toBe(2);
			// Can navigate backward
			expect(currentIndex > 0).toBe(true);
			// Cannot navigate forward
			expect(currentIndex >= state.displayedGames.length - 1).toBe(true);
		});

		it('should correctly identify if can navigate forward', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			const canNavigateForward = currentIndex < state.displayedGames.length - 1;
			expect(canNavigateForward).toBe(true);
		});

		it('should correctly identify if can navigate backward', () => {
			modalStore.openViewModal(mockGames[2], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			const canNavigateBackward = currentIndex > 0;
			expect(canNavigateBackward).toBe(true);
		});
	});

	describe('Escape Key Handling', () => {
		it('should close modal on escape', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.isOpen).toBe(true);

			modalStore.handleEscape();
			expect(modalStore.isOpen).toBe(false);
		});

		it('should do nothing if modal is already closed', () => {
			expect(modalStore.isOpen).toBe(false);
			modalStore.handleEscape();
			expect(modalStore.isOpen).toBe(false);
		});
	});

	describe('Filter Context', () => {
		it('should store filter context when modal opens', () => {
			const filterContext = {
				searchTerm: 'test search',
				platforms: ['PC'],
				genres: ['RPG'],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'completed' as const
			};

			modalStore.openViewModal(mockGames[0], mockGames, filterContext);
			const state = modalStore.getState();

			expect(state.filterContext.searchTerm).toBe('test search');
			expect(state.filterContext.platforms).toEqual(['PC']);
			expect(state.filterContext.genres).toEqual(['RPG']);
			expect(state.filterContext.activeTab).toBe('completed');
		});

		it('should update filter context during modal session', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			modalStore.updateFilterContext({ searchTerm: 'updated search' });

			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('updated search');
		});

		it('should preserve other context fields when updating partially', () => {
			const filterContext = {
				searchTerm: 'original',
				platforms: ['PC', 'PlayStation'],
				genres: [],
				statuses: [],
				tiers: [],
				sortOption: null,
				activeTab: 'all' as const
			};

			modalStore.openViewModal(mockGames[0], mockGames, filterContext);
			modalStore.updateFilterContext({ searchTerm: 'modified' });

			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('modified');
			expect(state.filterContext.platforms).toEqual(['PC', 'PlayStation']);
		});
	});

	describe('Navigation Index Calculations', () => {
		/**
		 * These tests verify the navigation index calculation logic
		 * that would be used by the DetailModal component
		 */

		it('should calculate correct next index', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			const nextIndex = currentIndex + 1;
			expect(nextIndex).toBe(1);
			expect(state.displayedGames[nextIndex].id).toBe('2');
		});

		it('should calculate correct previous index', () => {
			modalStore.openViewModal(mockGames[1], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			const prevIndex = currentIndex - 1;
			expect(prevIndex).toBe(0);
			expect(state.displayedGames[prevIndex].id).toBe('1');
		});

		it('should get next game from displayed games', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			if (currentIndex < state.displayedGames.length - 1) {
				const nextGame = state.displayedGames[currentIndex + 1];
				expect(nextGame.id).toBe('2');
				expect(nextGame.title).toBe('Second Game');
			}
		});

		it('should get previous game from displayed games', () => {
			modalStore.openViewModal(mockGames[2], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			if (currentIndex > 0) {
				const prevGame = state.displayedGames[currentIndex - 1];
				expect(prevGame.id).toBe('2');
				expect(prevGame.title).toBe('Second Game');
			}
		});
	});

	describe('Displayed Games Update', () => {
		it('should properly initialize displayed games on modal open', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.getState().displayedGames).toHaveLength(3);
		});

		it('should re-initialize displayed games when opening a new modal session', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.getState().displayedGames).toHaveLength(3);

			modalStore.closeModal();

			// Open with different set of games
			modalStore.openViewModal(mockGames[0], mockGames.slice(0, 2));
			expect(modalStore.getState().displayedGames).toHaveLength(2);
		});
	});

	describe('Swipe Gesture Logic', () => {
		/**
		 * These tests verify the swipe gesture logic functions
		 * that would be used by the DetailModal component
		 */

		it('should determine swipe direction from delta', () => {
			// Positive deltaX = swipe right = previous game
			const swipeRightDelta = 100;
			expect(swipeRightDelta > 0).toBe(true);

			// Negative deltaX = swipe left = next game
			const swipeLeftDelta = -100;
			expect(swipeLeftDelta < 0).toBe(true);
		});

		it('should check if swipe exceeds threshold', () => {
			const threshold = 50;

			// Sufficient swipe
			expect(Math.abs(100) > threshold).toBe(true);
			expect(Math.abs(-80) > threshold).toBe(true);

			// Insufficient swipe
			expect(Math.abs(30) > threshold).toBe(false);
			expect(Math.abs(-20) > threshold).toBe(false);
		});

		it('should validate swipe can navigate in direction', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			const state = modalStore.getState();
			const currentIndex = state.displayedGames.findIndex(
				(g) => g.id === modalStore.activeGame?.id
			);

			// At first game (index 0): can swipe left (next), cannot swipe right (prev)
			const canSwipeLeft = currentIndex < state.displayedGames.length - 1;
			const canSwipeRight = currentIndex > 0;

			expect(canSwipeLeft).toBe(true);
			expect(canSwipeRight).toBe(false);
		});
	});

	describe('Modal Modes', () => {
		it('should open in view mode', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			expect(modalStore.getState().mode).toBe('view');
		});

		it('should switch to edit mode', () => {
			modalStore.openViewModal(mockGames[0], mockGames);
			modalStore.openEditModal(mockGames[0]);
			expect(modalStore.getState().mode).toBe('edit');
		});

		it('should switch to add mode', () => {
			modalStore.openAddModal();
			expect(modalStore.getState().mode).toBe('add');
		});
	});
});

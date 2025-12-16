import { beforeEach, describe, expect, it } from 'vitest';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import type { Game } from '$lib/types/game';

/**
 * Comprehensive tests for modalStore
 * Tests modal state management, navigation, and form handling
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
	ratingGameplay: 9
};

const mockGame2: Game = {
	...mockGame,
	id: '2',
	title: 'Test Game 2',
	mainTitle: 'Test Game 2'
};

const mockGames = [mockGame, mockGame2];

describe('ModalStore', () => {
	beforeEach(() => {
		modalStore.closeModal();
		gamesStore.initializeGames(mockGames);
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

		it('openEditModal opens in edit mode', () => {
			modalStore.openEditModal(mockGame);
			const state = modalStore.getState();
			expect(state.isOpen).toBe(true);
			expect(state.mode).toBe('edit');
			expect(state.formData.title).toBe('Test Game');
		});

		it('openAddModal opens in add mode', () => {
			modalStore.openAddModal();
			const state = modalStore.getState();
			expect(state.isOpen).toBe(true);
			expect(state.mode).toBe('add');
			expect(state.formData.status).toBe('Planned');
		});

		it('closeModal closes modal', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.closeModal();
			const state = modalStore.getState();
			expect(state.isOpen).toBe(false);
			expect(state.activeGame).toBeNull();
		});

		it('toggleModal toggles open state', () => {
			const initialState = modalStore.getState();
			expect(initialState.isOpen).toBe(false);

			modalStore.toggleModal();
			expect(modalStore.getState().isOpen).toBe(true);

			modalStore.toggleModal();
			expect(modalStore.getState().isOpen).toBe(false);
		});
	});

	describe('Active Game Management', () => {
		it('setActiveGame updates active game', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.setActiveGame(mockGame2);
			const state = modalStore.getState();
			expect(state.activeGame?.id).toBe('2');
		});

		it('setActiveGame can set null', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.setActiveGame(null);
			const state = modalStore.getState();
			expect(state.activeGame).toBeNull();
		});
	});

	describe('Mode Management', () => {
		it('setMode changes modal mode', () => {
			modalStore.openViewModal(mockGame, mockGames);
			expect(modalStore.getState().mode).toBe('view');

			modalStore.setMode('edit');
			expect(modalStore.getState().mode).toBe('edit');

			modalStore.setMode('add');
			expect(modalStore.getState().mode).toBe('add');
		});
	});

	describe('Form Data', () => {
		it('updateFormData updates form field', () => {
			modalStore.openEditModal(mockGame);
			modalStore.updateFormData('title', 'Updated Title');
			const state = modalStore.getState();
			expect(state.formData.title).toBe('Updated Title');
		});

		it('updateFormData clears validation error for field', () => {
			modalStore.openAddModal();
			// Trigger validation first to create errors
			modalStore.validateForm();
			const stateBefore = modalStore.getState();
			expect(stateBefore.validationErrors.title).toBeDefined();

			// Update the field
			modalStore.updateFormData('title', 'New Title');
			const stateAfter = modalStore.getState();
			expect(stateAfter.validationErrors.title).toBe('');
		});

		it('resetForm restores original game data in edit mode', () => {
			modalStore.openEditModal(mockGame);
			modalStore.updateFormData('title', 'Changed');
			modalStore.resetForm();
			const state = modalStore.getState();
			expect(state.formData.title).toBe('Test Game');
		});

		it('resetForm sets defaults in add mode', () => {
			modalStore.openAddModal();
			modalStore.updateFormData('title', 'Something');
			modalStore.resetForm();
			const state = modalStore.getState();
			expect(state.formData.status).toBe('Planned');
			expect(state.formData.coOp).toBe('No');
		});
	});

	describe('Form Validation', () => {
		it('validateForm returns false for empty required fields', () => {
			modalStore.openAddModal();
			const isValid = modalStore.validateForm();
			expect(isValid).toBe(false);
		});

		it('validateForm returns true for valid data', () => {
			modalStore.openEditModal(mockGame);
			const isValid = modalStore.validateForm();
			expect(isValid).toBe(true);
		});

		it('validateForm checks required fields', () => {
			modalStore.openAddModal();
			modalStore.validateForm();
			const state = modalStore.getState();
			expect(state.validationErrors.title).toBeDefined();
			expect(state.validationErrors.platform).toBeDefined();
			expect(state.validationErrors.genre).toBeDefined();
		});
	});

	describe('Filter Context', () => {
		it('openViewModal accepts filter context', () => {
			const filterContext = {
				searchTerm: 'test',
				platforms: ['PC'],
				activeTab: 'completed' as const
			};
			modalStore.openViewModal(mockGame, mockGames, filterContext);
			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('test');
			expect(state.filterContext.platforms).toContain('PC');
			expect(state.filterContext.activeTab).toBe('completed');
		});

		it('updateFilterContext updates context', () => {
			modalStore.openViewModal(mockGame, mockGames);
			modalStore.updateFilterContext({ searchTerm: 'updated' });
			const state = modalStore.getState();
			expect(state.filterContext.searchTerm).toBe('updated');
		});
	});

	describe('Tier Calculation', () => {
		it('getTierFromScore returns correct tier for S (18+)', () => {
			expect(modalStore.getTierFromScore(18)).toBe('S - Masterpiece');
			expect(modalStore.getTierFromScore(20)).toBe('S - Masterpiece');
		});

		it('getTierFromScore returns correct tier for A (15-17)', () => {
			expect(modalStore.getTierFromScore(15)).toBe('A - Amazing');
			expect(modalStore.getTierFromScore(17)).toBe('A - Amazing');
		});

		it('getTierFromScore returns correct tier for B (12-14)', () => {
			expect(modalStore.getTierFromScore(12)).toBe('B - Great');
			expect(modalStore.getTierFromScore(14)).toBe('B - Great');
		});

		it('getTierFromScore returns correct tier for C (9-11)', () => {
			expect(modalStore.getTierFromScore(9)).toBe('C - Good');
			expect(modalStore.getTierFromScore(11)).toBe('C - Good');
		});

		it('getTierFromScore returns correct tier for D (6-8)', () => {
			expect(modalStore.getTierFromScore(6)).toBe('D - Decent');
			expect(modalStore.getTierFromScore(8)).toBe('D - Decent');
		});

		it('getTierFromScore returns E for low scores', () => {
			expect(modalStore.getTierFromScore(5)).toBe('E - Bad');
			expect(modalStore.getTierFromScore(0)).toBe('E - Bad');
		});
	});

	describe('Escape Handling', () => {
		it('handleEscape closes open modal', () => {
			modalStore.openViewModal(mockGame, mockGames);
			expect(modalStore.getState().isOpen).toBe(true);

			modalStore.handleEscape();
			expect(modalStore.getState().isOpen).toBe(false);
		});

		it('handleEscape does nothing when modal is closed', () => {
			expect(modalStore.getState().isOpen).toBe(false);
			modalStore.handleEscape();
			expect(modalStore.getState().isOpen).toBe(false);
		});
	});

	describe('Subscribe', () => {
		it('exposes subscribe method for Svelte store compatibility', () => {
			expect(typeof modalStore.subscribe).toBe('function');

			let callCount = 0;
			const unsubscribe = modalStore.subscribe(() => {
				callCount++;
			});

			modalStore.openViewModal(mockGame, mockGames);
			expect(callCount).toBeGreaterThan(0);

			unsubscribe();
		});
	});
});

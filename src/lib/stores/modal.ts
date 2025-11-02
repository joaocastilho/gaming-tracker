import { writable, get } from 'svelte/store';
import type { Game } from '../types/game.js';
import { gamesStore } from './games.js';

// TypeScript interfaces for modal state
export interface ModalState {
	isOpen: boolean;
	activeGame: Game | null;
	mode: 'view' | 'edit' | 'add';
	// Form state management
	formData: Partial<Game>;
	validationErrors: Record<string, string>;
	isSubmitting: boolean;
}

function createModalStore() {
	const modalState = writable<ModalState>({
		isOpen: false,
		activeGame: null,
		mode: 'view',
		formData: {},
		validationErrors: {},
		isSubmitting: false
	});

	return {
		// Subscribe to modal state changes
		subscribe: modalState.subscribe,

		// Get current state
		getState(): ModalState {
			return get(modalState);
		},

		// Open modal for viewing a game
		openViewModal(game: Game) {
			modalState.set({
				isOpen: true,
				activeGame: game,
				mode: 'view',
				formData: {},
				validationErrors: {},
				isSubmitting: false
			});
		},

		// Open modal for editing a game
		openEditModal(game: Game) {
			modalState.set({
				isOpen: true,
				activeGame: game,
				mode: 'edit',
				formData: { ...game },
				validationErrors: {},
				isSubmitting: false
			});
		},

		// Open modal for adding a new game
		openAddModal() {
			modalState.set({
				isOpen: true,
				activeGame: null,
				mode: 'add',
				formData: {
					status: 'Planned',
					coOp: 'No'
				},
				validationErrors: {},
				isSubmitting: false
			});
		},

		// Close modal
		closeModal() {
			modalState.set({
				isOpen: false,
				activeGame: null,
				mode: 'view',
				formData: {},
				validationErrors: {},
				isSubmitting: false
			});
		},

		// Toggle modal open/closed state
		toggleModal() {
			modalState.update((state) => ({
				...state,
				isOpen: !state.isOpen
			}));
		},

		// Update active game (for editing)
		setActiveGame(game: Game | null) {
			modalState.update((state) => ({
				...state,
				activeGame: game
			}));
		},

		// Set mode
		setMode(mode: 'view' | 'edit' | 'add') {
			modalState.update((state) => ({
				...state,
				mode
			}));
		},

		// Form management methods

		// Update form field value
		updateFormData(field: string, value: unknown) {
			modalState.update((state) => ({
				...state,
				formData: {
					...state.formData,
					[field]: value
				},
				// Clear validation error for this field if it exists
				validationErrors: {
					...state.validationErrors,
					[field]: ''
				}
			}));
		},

		// Reset form to defaults or initial values
		resetForm() {
			modalState.update((state) => {
				if (state.mode === 'edit' && state.activeGame) {
					// Reset to original game data for edit mode
					return {
						...state,
						formData: { ...state.activeGame },
						validationErrors: {},
						isSubmitting: false
					};
				} else {
					// Reset to defaults for add mode
					return {
						...state,
						formData: {
							status: 'Planned',
							coOp: 'No'
						},
						validationErrors: {},
						isSubmitting: false
					};
				}
			});
		},

		// Validate form data
		validateForm(): boolean {
			const state = get(modalState);
			const errors: Record<string, string> = {};

			// Required field validation
			if (!state.formData.title?.trim()) {
				errors.title = 'Title is required';
			}
			if (!state.formData.platform?.trim()) {
				errors.platform = 'Platform is required';
			}
			if (!state.formData.genre?.trim()) {
				errors.genre = 'Genre is required';
			}
			if (!state.formData.timeToBeat?.trim()) {
				errors.timeToBeat = 'Time to beat is required';
			}

			// Year validation
			if (state.formData.year !== undefined) {
				if (state.formData.year < 1970 || state.formData.year > 2099) {
					errors.year = 'Year must be between 1970 and 2099';
				}
			} else {
				errors.year = 'Year is required';
			}

			// Status-specific validation
			if (state.formData.status === 'Completed') {
				if (!state.formData.hoursPlayed?.trim()) {
					errors.hoursPlayed = 'Hours played is required for completed games';
				}
				if (!state.formData.finishedDate) {
					errors.finishedDate = 'Finished date is required for completed games';
				}
				if (
					state.formData.ratingPresentation === null ||
					state.formData.ratingPresentation === undefined
				) {
					errors.ratingPresentation = 'Presentation rating is required for completed games';
				}
				if (state.formData.ratingStory === null || state.formData.ratingStory === undefined) {
					errors.ratingStory = 'Story rating is required for completed games';
				}
				if (state.formData.ratingGameplay === null || state.formData.ratingGameplay === undefined) {
					errors.ratingGameplay = 'Gameplay rating is required for completed games';
				}

				// Rating range validation
				if (
					state.formData.ratingPresentation !== null &&
					state.formData.ratingPresentation !== undefined &&
					(state.formData.ratingPresentation < 0 || state.formData.ratingPresentation > 10)
				) {
					errors.ratingPresentation = 'Presentation rating must be between 0 and 10';
				}
				if (
					state.formData.ratingStory !== null &&
					state.formData.ratingStory !== undefined &&
					(state.formData.ratingStory < 0 || state.formData.ratingStory > 10)
				) {
					errors.ratingStory = 'Story rating must be between 0 and 10';
				}
				if (
					state.formData.ratingGameplay !== null &&
					state.formData.ratingGameplay !== undefined &&
					(state.formData.ratingGameplay < 0 || state.formData.ratingGameplay > 10)
				) {
					errors.ratingGameplay = 'Gameplay rating must be between 0 and 10';
				}
			}

			// Update validation errors
			modalState.update((currentState) => ({
				...currentState,
				validationErrors: errors
			}));

			return Object.keys(errors).length === 0;
		},

		// Submit form data
		async submitForm(): Promise<boolean> {
			const state = get(modalState);

			// Set submitting state
			modalState.update((currentState) => ({
				...currentState,
				isSubmitting: true,
				validationErrors: {}
			}));

			// Validate form
			if (!this.validateForm()) {
				modalState.update((currentState) => ({
					...currentState,
					isSubmitting: false
				}));
				return false;
			}

			try {
				if (state.mode === 'add') {
					// Calculate score if all ratings are provided
					const ratingPresentation = state.formData.ratingPresentation ?? null;
					const ratingStory = state.formData.ratingStory ?? null;
					const ratingGameplay = state.formData.ratingGameplay ?? null;
					const score =
						ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
							? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
							: null;

					// Generate UUID for new game
					const newGame: Game = {
						...(state.formData as Game),
						id: crypto.randomUUID(),
						coverImage: `covers/${state.formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'game'}.webp`,
						score,
						// Set tier only if completed and has score
						tier:
							state.formData.status === 'Completed' && score !== null
								? this.getTierFromScore(score)
								: null
					};

					gamesStore.addGame(newGame);
				} else if (state.mode === 'edit' && state.activeGame) {
					// Calculate score if all ratings are provided
					const ratingPresentation = state.formData.ratingPresentation ?? null;
					const ratingStory = state.formData.ratingStory ?? null;
					const ratingGameplay = state.formData.ratingGameplay ?? null;
					const score =
						ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
							? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
							: state.activeGame.score;

					// Update existing game
					const updatedGame: Game = {
						...state.activeGame,
						...state.formData,
						score,
						// Update tier if score changed
						tier:
							state.formData.status === 'Completed' && score !== null
								? this.getTierFromScore(score)
								: state.formData.status === 'Planned'
									? null
									: state.activeGame.tier
					};

					gamesStore.updateGame(state.activeGame.id, updatedGame);
				}

				// Close modal on success
				this.closeModal();
				return true;
			} catch (error) {
				console.error('Error submitting form:', error);
				modalState.update((currentState) => ({
					...currentState,
					isSubmitting: false,
					validationErrors: {
						submit: 'An error occurred while saving the game. Please try again.'
					}
				}));
				return false;
			}
		},

		// Helper method to determine tier from score
		getTierFromScore(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'E' {
			if (score >= 18) return 'S';
			if (score >= 15) return 'A';
			if (score >= 12) return 'B';
			if (score >= 9) return 'C';
			if (score >= 6) return 'D';
			return 'E';
		},

		// URL parameter management for deep linking
		readFromURL(searchParams: URLSearchParams, games: Game[]) {
			const gameId = searchParams.get('game');
			if (gameId) {
				const game = games.find((g) => g.id === gameId);
				if (game) {
					modalState.set({
						isOpen: true,
						activeGame: game,
						mode: 'view',
						formData: {},
						validationErrors: {},
						isSubmitting: false
					});
				}
			}
		},

		writeToURL() {
			if (typeof window === 'undefined') return;

			const state = get(modalState);
			const url = new URL(window.location.href);

			if (state.isOpen && state.activeGame) {
				url.searchParams.set('game', state.activeGame.id);
			} else {
				url.searchParams.delete('game');
			}

			// Use replaceState to avoid adding to browser history
			window.history.replaceState({}, '', url.toString());
		},

		// Handle escape key to close modal
		handleEscape() {
			modalState.update((state) => {
				if (state.isOpen) {
					return {
						...state,
						isOpen: false
					};
				}
				return state;
			});
		}
	};
}

export const modalStore = createModalStore();

export type ModalStore = ReturnType<typeof createModalStore>;

import { writable, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import { debounce } from '../utils/debounce.js';
import type { Game } from '../types/game.js';
import { gamesStore } from './games.js';

// Utility function to create URL-friendly slugs from game titles
function createGameSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
		.replace(/\s+/g, '-') // Replace spaces with hyphens
		.replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
		.trim()
		.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export interface ModalState {
	isOpen: boolean;
	activeGame: Game | null;
	mode: 'view' | 'edit' | 'add';
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

	// Debounced URL update to reduce main-thread jank
	const debouncedWriteToURL = debounce(() => {
		if (typeof window === 'undefined') return;

		try {
			const state = get(modalState);
			const url = new URL(window.location.href);

			if (state.isOpen && state.activeGame) {
				const slug = createGameSlug(state.activeGame.title);
				url.searchParams.set('game', slug);
			} else {
				url.searchParams.delete('game');
			}

			// Use replaceState to avoid adding to browser history
			replaceState(url.toString(), {});
		} catch (error) {
			// Silently ignore router initialization errors
			if (!(error instanceof Error) || !error.message.includes('router is initialized')) {
				console.warn('Failed to update URL:', error);
			}
		}
	}, 100); // 100ms debounce delay

	return {
		subscribe: modalState.subscribe,

		getState(): ModalState {
			return get(modalState);
		},

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

		toggleModal() {
			modalState.update((state) => ({
				...state,
				isOpen: !state.isOpen
			}));
		},

		setActiveGame(game: Game | null) {
			modalState.update((state) => ({
				...state,
				activeGame: game
			}));
		},

		setMode(mode: 'view' | 'edit' | 'add') {
			modalState.update((state) => ({
				...state,
				mode
			}));
		},

		updateFormData(field: string, value: unknown) {
			modalState.update((state) => ({
				...state,
				formData: {
					...state.formData,
					[field]: value
				},
				validationErrors: {
					...state.validationErrors,
					[field]: ''
				}
			}));
		},

		resetForm() {
			modalState.update((state) => {
				if (state.mode === 'edit' && state.activeGame) {
					return {
						...state,
						formData: { ...state.activeGame },
						validationErrors: {},
						isSubmitting: false
					};
				} else {
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

		validateForm(): boolean {
			const state = get(modalState);
			const errors: Record<string, string> = {};

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

			if (state.formData.year !== undefined) {
				if (state.formData.year < 1970 || state.formData.year > 2099) {
					errors.year = 'Year must be between 1970 and 2099';
				}
			} else {
				errors.year = 'Year is required';
			}

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

			modalState.update((currentState) => ({
				...currentState,
				validationErrors: errors
			}));

			return Object.keys(errors).length === 0;
		},

		async submitForm(): Promise<boolean> {
			const state = get(modalState);

			modalState.update((currentState) => ({
				...currentState,
				isSubmitting: true,
				validationErrors: {}
			}));

			if (!this.validateForm()) {
				modalState.update((currentState) => ({
					...currentState,
					isSubmitting: false
				}));
				return false;
			}

			try {
				if (state.mode === 'add') {
					const ratingPresentation = state.formData.ratingPresentation ?? null;
					const ratingStory = state.formData.ratingStory ?? null;
					const ratingGameplay = state.formData.ratingGameplay ?? null;
					const score =
						ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
							? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
							: null;

					const newGame: Game = {
						...(state.formData as Game),
						id: crypto.randomUUID(),
						coverImage: `covers/${state.formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'game'}.webp`,
						score,
						tier:
							state.formData.status === 'Completed' && score !== null
								? this.getTierFromScore(score)
								: null
					};

					gamesStore.addGame(newGame);
				} else if (state.mode === 'edit' && state.activeGame) {
					const ratingPresentation = state.formData.ratingPresentation ?? null;
					const ratingStory = state.formData.ratingStory ?? null;
					const ratingGameplay = state.formData.ratingGameplay ?? null;
					const score =
						ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
							? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
							: state.activeGame.score;

					const updatedGame: Game = {
						...state.activeGame,
						...state.formData,
						score,
						tier:
							state.formData.status === 'Completed' && score !== null
								? this.getTierFromScore(score)
								: state.formData.status === 'Planned'
									? null
									: state.activeGame.tier
					};

					gamesStore.updateGame(state.activeGame.id, updatedGame);
				}

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

		getTierFromScore(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'E' {
			if (score >= 18) return 'S';
			if (score >= 15) return 'A';
			if (score >= 12) return 'B';
			if (score >= 9) return 'C';
			if (score >= 6) return 'D';
			return 'E';
		},

		readFromURL(searchParams: URLSearchParams, games: Game[]) {
			const gameSlug = searchParams.get('game');
			if (gameSlug) {
				let game = games.find((g) => createGameSlug(g.title) === gameSlug);
				if (!game) {
					game = games.find((g) => g.id === gameSlug);
				}
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

		writeToURL: debouncedWriteToURL,

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

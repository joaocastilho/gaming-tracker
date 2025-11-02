import { writable, get } from 'svelte/store';
import type { Game } from '../types/game.js';

// TypeScript interfaces for modal state
export interface ModalState {
	isOpen: boolean;
	activeGame: Game | null;
	mode: 'view' | 'edit' | 'add';
}

function createModalStore() {
	const modalState = writable<ModalState>({
		isOpen: false,
		activeGame: null,
		mode: 'view'
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
				mode: 'view'
			});
		},

		// Open modal for editing a game
		openEditModal(game: Game) {
			modalState.set({
				isOpen: true,
				activeGame: game,
				mode: 'edit'
			});
		},

		// Open modal for adding a new game
		openAddModal() {
			modalState.set({
				isOpen: true,
				activeGame: null,
				mode: 'add'
			});
		},

		// Close modal
		closeModal() {
			modalState.set({
				isOpen: false,
				activeGame: null,
				mode: 'view'
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

		// URL parameter management for deep linking
		readFromURL(searchParams: URLSearchParams, games: Game[]) {
			const gameId = searchParams.get('game');
			if (gameId) {
				const game = games.find((g) => g.id === gameId);
				if (game) {
					modalState.set({
						isOpen: true,
						activeGame: game,
						mode: 'view'
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

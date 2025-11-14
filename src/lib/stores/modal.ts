import { writable, get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import { debounce } from '../utils/debounce.js';
import type { Game } from '../types/game.js';
import { gamesStore } from './games.js';

function createGameSlug(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim()
		.replace(/^-|-$/g, '');
}

export interface ModalState {
	isOpen: boolean;
	activeGame: Game | null;
	mode: 'view' | 'edit' | 'add';
	formData: Partial<Game>;
	validationErrors: Record<string, string>;
	isSubmitting: boolean;
	displayedGames: Game[];
	pendingGameFromURL: Game | null;
	filterContext: {
		searchTerm: string;
		platforms: string[];
		genres: string[];
		statuses: string[];
		tiers: string[];
		sortOption: import('../stores/filters').SortOption | null;
		activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
	};
}

function createModalStore() {
	const modalState = writable<ModalState>({
		isOpen: false,
		activeGame: null,
		mode: 'view',
		formData: {},
		validationErrors: {},
		isSubmitting: false,
		displayedGames: [],
		pendingGameFromURL: null,
		filterContext: {
			searchTerm: '',
			platforms: [],
			genres: [],
			statuses: [],
			tiers: [],
			sortOption: null,
			activeTab: 'all'
		}
	});

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

			replaceState(url.toString(), {});
		} catch {
			// Ignore router initialization errors
		}
	}, 100);

	return {
		subscribe: modalState.subscribe,

		getState(): ModalState {
			return get(modalState);
		},

		openViewModal(
			game: Game,
			displayedGames: Game[] = [],
			filterContext?: Partial<ModalState['filterContext']>
		) {
			modalState.update((state) => ({
				...state,
				isOpen: true,
				activeGame: game,
				mode: 'view',
				formData: {},
				validationErrors: {},
				isSubmitting: false,
				displayedGames,
				pendingGameFromURL: null,
				filterContext: filterContext
					? { ...state.filterContext, ...filterContext }
					: state.filterContext
			}));
		},

		openEditModal(game: Game, filterContext?: Partial<ModalState['filterContext']>) {
			modalState.update((state) => ({
				...state,
				isOpen: true,
				activeGame: game,
				mode: 'edit',
				formData: { ...game },
				validationErrors: {},
				isSubmitting: false,
				displayedGames: [],
				pendingGameFromURL: null,
				filterContext: filterContext
					? { ...state.filterContext, ...filterContext }
					: state.filterContext
			}));
		},

		openAddModal(filterContext?: Partial<ModalState['filterContext']>) {
			modalState.update((state) => ({
				...state,
				isOpen: true,
				activeGame: null,
				mode: 'add',
				formData: {
					status: 'Planned',
					coOp: 'No'
				},
				validationErrors: {},
				isSubmitting: false,
				displayedGames: [],
				pendingGameFromURL: null,
				filterContext: filterContext
					? { ...state.filterContext, ...filterContext }
					: state.filterContext
			}));
		},

		closeModal() {
			modalState.update((state) => ({
				...state,
				isOpen: false,
				activeGame: null,
				mode: 'view',
				formData: {},
				validationErrors: {},
				isSubmitting: false,
				displayedGames: [],
				pendingGameFromURL: null
			}));

			debouncedWriteToURL();
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

		updateFilterContext(context: Partial<ModalState['filterContext']>) {
			modalState.update((state) => ({
				...state,
				filterContext: { ...state.filterContext, ...context }
			}));
		},

		getReactiveNavigationGames(allGames: Game[]): Game[] {
			const state = get(modalState);
			if (!state.filterContext) return allGames;

			let filteredGames = [...allGames];

			// Apply search filter
			if (state.filterContext.searchTerm.trim()) {
				const query = state.filterContext.searchTerm.toLowerCase().trim();
				filteredGames = filteredGames.filter((game) => {
					const titleMatch = game.title.toLowerCase().includes(query);
					const genreMatch = game.genre.toLowerCase().includes(query);
					const platformMatch = game.platform.toLowerCase().includes(query);
					return titleMatch || genreMatch || platformMatch;
				});
			}

			// Apply platform filter
			if (state.filterContext.platforms.length > 0) {
				filteredGames = filteredGames.filter((game) =>
					state.filterContext.platforms.includes(game.platform)
				);
			}

			// Apply genre filter
			if (state.filterContext.genres.length > 0) {
				filteredGames = filteredGames.filter((game) =>
					state.filterContext.genres.includes(game.genre)
				);
			}

			// Apply tier filter
			if (state.filterContext.tiers.length > 0) {
				filteredGames = filteredGames.filter((game) => {
					if (!game.tier) return false;
					const gameTierFullName = this.getTierDisplayName(game.tier);
					return state.filterContext.tiers.includes(gameTierFullName);
				});
			}

			// Apply tab-specific filtering
			switch (state.filterContext.activeTab) {
				case 'completed':
					filteredGames = filteredGames.filter((game) => game.status === 'Completed');
					break;
				case 'planned':
					filteredGames = filteredGames.filter((game) => game.status === 'Planned');
					break;
				case 'tierlist':
					filteredGames = filteredGames.filter((game) => game.tier);
					break;
				default:
					// For 'all' tab, no additional filtering
					break;
			}

			// Apply sorting based on sortOption
			if (state.filterContext.sortOption) {
				const { key, direction } = state.filterContext.sortOption;
				const dir = direction === 'asc' ? 1 : -1;

				filteredGames = filteredGames.toSorted((a, b) => {
					const aVal =
						key === 'presentation'
							? (a.ratingPresentation ?? 0)
							: key === 'story'
								? (a.ratingStory ?? 0)
								: key === 'gameplay'
									? (a.ratingGameplay ?? 0)
									: (a.score ?? 0);

					const bVal =
						key === 'presentation'
							? (b.ratingPresentation ?? 0)
							: key === 'story'
								? (b.ratingStory ?? 0)
								: key === 'gameplay'
									? (b.ratingGameplay ?? 0)
									: (b.score ?? 0);

					if (aVal === bVal) return 0;
					return aVal > bVal ? dir : -dir;
				});
			} else {
				// Default sorting when no sortOption is selected
				switch (state.filterContext.activeTab) {
					case 'completed':
						// Sort completed games by finished date (most recent first)
						filteredGames = filteredGames.toSorted((a, b) => {
							if (!a.finishedDate && !b.finishedDate) return 0;
							if (!a.finishedDate) return 1;
							if (!b.finishedDate) return -1;
							return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
						});
						break;
					case 'planned':
						// Sort planned games alphabetically
						filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
						break;
					default:
						// Sort 'all' tab alphabetically
						filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
						break;
				}
			}

			return filteredGames;
		},

		getTierDisplayName(tier: string): string {
			const tierMapping: Record<string, string> = {
				S: 'S - Masterpiece',
				A: 'A - Amazing',
				B: 'B - Great',
				C: 'C - Good',
				D: 'D - Decent',
				E: 'E - Bad'
			};
			return tierMapping[tier] || tier;
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
			} catch {
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
					modalState.update((state) => ({
						...state,
						pendingGameFromURL: game
					}));
				}
			}
		},

		writeToURL: debouncedWriteToURL,

		openPendingGameFromURL(
			displayedGames: Game[],
			filterContext?: Partial<ModalState['filterContext']>
		) {
			const state = get(modalState);
			if (
				state.pendingGameFromURL &&
				displayedGames.some((g) => g.id === state.pendingGameFromURL!.id)
			) {
				this.openViewModal(state.pendingGameFromURL, displayedGames, filterContext);
			}
		},

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

/**
 * Modal Store - Svelte 5 Runes
 * Manages modal state, form data, and game detail view
 */

import { pushState, replaceState } from '$app/navigation';
import { createGameSlug } from '$lib/utils/slugUtils';
import { getTierDisplayName } from '$lib/utils/tierUtils';
import type { Game } from '../types/game.js';
import type { SortOption } from './filters.svelte';
import { gamesStore } from './games.svelte';

export interface CardRect {
	x: number;
	y: number;
	width: number;
	height: number;
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
	cardRect: CardRect | null;
	filterContext: {
		searchTerm: string;
		platforms: string[];
		genres: string[];
		statuses: string[];
		tiers: string[];
		sortOption: SortOption | null;
		activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
	};
}

const initialState: ModalState = {
	isOpen: false,
	activeGame: null,
	mode: 'view',
	formData: {},
	validationErrors: {},
	isSubmitting: false,
	displayedGames: [],
	pendingGameFromURL: null,
	cardRect: null,
	filterContext: {
		searchTerm: '',
		platforms: [],
		genres: [],
		statuses: [],
		tiers: [],
		sortOption: null,
		activeTab: 'all'
	}
};

class ModalStore {
	private _state = $state<ModalState>({ ...initialState });
	private subscribers = new Set<(value: ModalState) => void>();
	private isProgrammaticUpdate = false;

	// Removed debouncedWriteToURL to prevent race conditions with readFromURL

	get isOpen(): boolean {
		return this._state.isOpen;
	}

	get activeGame(): Game | null {
		return this._state.activeGame;
	}

	get mode(): 'view' | 'edit' | 'add' {
		return this._state.mode;
	}

	get formData(): Partial<Game> {
		return this._state.formData;
	}

	get validationErrors(): Record<string, string> {
		return this._state.validationErrors;
	}

	get isSubmitting(): boolean {
		return this._state.isSubmitting;
	}

	get displayedGames(): Game[] {
		return this._state.displayedGames;
	}

	get pendingGameFromURL(): Game | null {
		return this._state.pendingGameFromURL;
	}

	get filterContext(): ModalState['filterContext'] {
		return this._state.filterContext;
	}

	get cardRect(): CardRect | null {
		return this._state.cardRect;
	}

	subscribe(fn: (value: ModalState) => void): () => void {
		fn(this._state);
		this.subscribers.add(fn);
		return () => {
			this.subscribers.delete(fn);
		};
	}

	getState(): ModalState {
		return this._state;
	}

	openViewModal(
		game: Game | null,
		displayedGames: Game[] = [],
		filterContext?: Partial<ModalState['filterContext']>,
		cardRect?: CardRect
	): void {
		let finalDisplayedGames = displayedGames;

		if (displayedGames.length === 0 && !filterContext) {
			finalDisplayedGames =
				this._state.displayedGames.length > 0 ? this._state.displayedGames : gamesStore.games;
		}

		this._state = {
			...this._state,
			isOpen: true,
			activeGame: game,
			mode: 'view',
			formData: {},
			validationErrors: {},
			isSubmitting: false,
			displayedGames: finalDisplayedGames,
			pendingGameFromURL: null,
			cardRect: cardRect ?? null,
			filterContext: filterContext
				? { ...this._state.filterContext, ...filterContext }
				: this._state.filterContext
		};
		this.notifySubscribers();
		this.writeToURL();
	}

	openEditModal(game: Game, filterContext?: Partial<ModalState['filterContext']>): void {
		this._state = {
			...this._state,
			isOpen: true,
			activeGame: game,
			mode: 'edit',
			formData: { ...game },
			validationErrors: {},
			isSubmitting: false,
			displayedGames: [],
			pendingGameFromURL: null,
			filterContext: filterContext
				? { ...this._state.filterContext, ...filterContext }
				: this._state.filterContext
		};
		this.notifySubscribers();
	}

	openAddModal(filterContext?: Partial<ModalState['filterContext']>): void {
		this._state = {
			...this._state,
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
				? { ...this._state.filterContext, ...filterContext }
				: this._state.filterContext
		};
		this.notifySubscribers();
	}

	closeModal(): void {
		this._state = {
			...this._state,
			isOpen: false,
			activeGame: null,
			mode: 'view',
			formData: {},
			validationErrors: {},
			isSubmitting: false,
			displayedGames: [],
			pendingGameFromURL: null,
			cardRect: null
		};

		this.notifySubscribers();
		this.writeToURL();
	}

	toggleModal(): void {
		this._state = {
			...this._state,
			isOpen: !this._state.isOpen
		};
		this.notifySubscribers();
	}

	setActiveGame(game: Game | null): void {
		this._state = {
			...this._state,
			activeGame: game
		};
		this.notifySubscribers();
	}

	setMode(mode: 'view' | 'edit' | 'add'): void {
		this._state = {
			...this._state,
			mode
		};
		this.notifySubscribers();
	}

	updateFilterContext(context: Partial<ModalState['filterContext']>): void {
		const newFilterContext = { ...this._state.filterContext, ...context };

		const updatedDisplayedGames = this.getReactiveNavigationGamesFromContext(
			gamesStore.games,
			newFilterContext
		);

		let updatedActiveGame = this._state.activeGame;
		if (updatedActiveGame && !updatedDisplayedGames.find((g) => g.id === updatedActiveGame!.id)) {
			updatedActiveGame = null;
		}

		this._state = {
			...this._state,
			filterContext: newFilterContext,
			displayedGames: updatedDisplayedGames,
			activeGame: updatedActiveGame
		};
		this.notifySubscribers();
	}

	getReactiveNavigationGamesFromContext(
		allGames: Game[],
		filterContext: ModalState['filterContext']
	): Game[] {
		if (!filterContext) return allGames;

		let filteredGames = [...allGames];

		if (filterContext.searchTerm.trim()) {
			const query = filterContext.searchTerm.toLowerCase().trim();
			filteredGames = filteredGames.filter((game) => {
				const titleMatch = game.title.toLowerCase().includes(query);
				const genreMatch = game.genre.toLowerCase().includes(query);
				const platformMatch = game.platform.toLowerCase().includes(query);
				return titleMatch || genreMatch || platformMatch;
			});
		}

		if (filterContext.platforms.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				filterContext.platforms.includes(game.platform)
			);
		}

		if (filterContext.genres.length > 0) {
			filteredGames = filteredGames.filter((game) => filterContext.genres.includes(game.genre));
		}
		if (filterContext.statuses.length > 0) {
			filteredGames = filteredGames.filter((game) => filterContext.statuses.includes(game.status));
		}

		if (filterContext.tiers.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return filterContext.tiers.includes(gameTierFullName);
			});
		}

		switch (filterContext.activeTab) {
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
				break;
		}

		if (filterContext.sortOption) {
			const { key, direction } = filterContext.sortOption;
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
			switch (filterContext.activeTab) {
				case 'completed':
					filteredGames = filteredGames.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;

						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
					break;
				case 'planned':
					filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
					break;
				default:
					filteredGames = filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
					break;
			}
		}

		return filteredGames;
	}

	getReactiveNavigationGames(allGames: Game[]): Game[] {
		if (!this._state.filterContext) return allGames;
		return this.getReactiveNavigationGamesFromContext(allGames, this._state.filterContext);
	}

	updateFormData(field: string, value: unknown): void {
		this._state = {
			...this._state,
			formData: {
				...this._state.formData,
				[field]: value
			},
			validationErrors: {
				...this._state.validationErrors,
				[field]: ''
			}
		};
	}

	resetForm(): void {
		if (this._state.mode === 'edit' && this._state.activeGame) {
			this._state = {
				...this._state,
				formData: { ...this._state.activeGame },
				validationErrors: {},
				isSubmitting: false
			};
		} else {
			this._state = {
				...this._state,
				formData: {
					status: 'Planned',
					coOp: 'No'
				},
				validationErrors: {},
				isSubmitting: false
			};
		}
	}

	validateForm(): boolean {
		const state = this._state;
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

		this._state = {
			...this._state,
			validationErrors: errors
		};

		return Object.keys(errors).length === 0;
	}

	async submitForm(): Promise<boolean> {
		const state = this._state;

		this._state = {
			...this._state,
			isSubmitting: true,
			validationErrors: {}
		};

		if (!this.validateForm()) {
			this._state = {
				...this._state,
				isSubmitting: false
			};
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
			this._state = {
				...this._state,
				isSubmitting: false,
				validationErrors: {
					submit: 'An error occurred while saving the game. Please try again.'
				}
			};
			return false;
		}
	}

	getTierFromScore(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'E' {
		if (score >= 18) return 'S';
		if (score >= 15) return 'A';
		if (score >= 12) return 'B';
		if (score >= 9) return 'C';
		if (score >= 6) return 'D';
		return 'E';
	}

	readFromURL(searchParams: URLSearchParams, games: Game[]): void {
		if (this.isProgrammaticUpdate) return;

		const gameSlug = searchParams.get('game');
		if (gameSlug) {
			let game = games.find((g) => {
				const exactSlug = createGameSlug(g.title);
				if (exactSlug === gameSlug) return true;

				if (g.mainTitle && g.subtitle) {
					const mainTitleSlug = createGameSlug(g.mainTitle);
					if (mainTitleSlug === gameSlug) return true;
				}

				const titleLower = g.title.toLowerCase();
				const slugLower = gameSlug.toLowerCase();

				if (titleLower.includes('witcher') && slugLower === 'witcher-3') return true;

				return false;
			});

			if (!game) {
				game = games.find((g) => g.id === gameSlug);
			}
			if (game) {
				const state = this._state;
				if (!state.isOpen || state.activeGame?.id !== game.id) {
					this.openViewModal(game, games);
				}
			}
		} else {
			const state = this._state;
			if (state.isOpen) {
				this.closeModal();
			}
		}
	}

	async writeToURL(): Promise<void> {
		if (typeof window === 'undefined') return;

		this.isProgrammaticUpdate = true;

		try {
			const state = this._state;
			const url = new URL(window.location.href);
			const currentSlug = url.searchParams.get('game');

			if (state.isOpen && state.activeGame) {
				const slug = createGameSlug(state.activeGame.title);

				if (currentSlug) {
					url.searchParams.set('game', slug);
					await replaceState(url.toString(), { noscroll: true });
				} else {
					url.searchParams.set('game', slug);
					await pushState(url.toString(), { noscroll: true });
				}
			} else {
				if (currentSlug) {
					url.searchParams.delete('game');
					await replaceState(url.toString(), { noscroll: true });
				}
			}
		} catch {
			// Ignore router initialization errors
		} finally {
			setTimeout(() => {
				this.isProgrammaticUpdate = false;
			}, 50);
		}
	}

	openPendingGameFromURL(
		displayedGames: Game[],
		filterContext?: Partial<ModalState['filterContext']>
	): void {
		const state = this._state;
		if (
			state.pendingGameFromURL &&
			displayedGames.some((g) => g.id === state.pendingGameFromURL!.id)
		) {
			this.openViewModal(state.pendingGameFromURL, displayedGames, filterContext);
		}
	}

	handleEscape(): void {
		if (this._state.isOpen) {
			this._state = {
				...this._state,
				isOpen: false
			};
			this.notifySubscribers();
		}
	}

	private notifySubscribers(): void {
		for (const fn of this.subscribers) {
			fn(this._state);
		}
	}
}

export const modalStore = new ModalStore();
export type { ModalStore };

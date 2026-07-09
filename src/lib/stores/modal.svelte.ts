import { pushState, replaceState } from '$app/navigation';
import { createGameSlug, isValidSlug } from '$lib/utils/slugUtils';
import type { Game, TierValue } from '$lib/types/game';
import type { SortOption } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { filterGamesByContext } from '$lib/stores/modalNavigation.svelte';
import {
	validateFormData as validateFormDataFn,
	getTierFromScore as getTierFromScoreFn,
	buildNewGame,
	buildUpdatedGame,
} from '$lib/stores/modalForm.svelte';

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
		activeTab: 'all',
	},
};

class ModalStore {
	private _state = $state<ModalState>({ ...initialState });
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
			finalDisplayedGames = this._state.displayedGames.length > 0 ? this._state.displayedGames : gamesStore.games;
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
			filterContext: filterContext ? { ...this._state.filterContext, ...filterContext } : this._state.filterContext,
		};

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
			filterContext: filterContext ? { ...this._state.filterContext, ...filterContext } : this._state.filterContext,
		};
	}

	openAddModal(filterContext?: Partial<ModalState['filterContext']>): void {
		this._state = {
			...this._state,
			isOpen: true,
			activeGame: null,
			mode: 'add',
			formData: {
				status: 'Planned',
				coOp: 'No',
			},
			validationErrors: {},
			isSubmitting: false,
			displayedGames: [],
			pendingGameFromURL: null,
			filterContext: filterContext ? { ...this._state.filterContext, ...filterContext } : this._state.filterContext,
		};
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
			cardRect: null,
		};

		this.writeToURL();
	}

	toggleModal(): void {
		this._state = {
			...this._state,
			isOpen: !this._state.isOpen,
		};
	}

	setActiveGame(game: Game | null): void {
		this._state = {
			...this._state,
			activeGame: game,
		};
	}

	setMode(mode: 'view' | 'edit' | 'add'): void {
		this._state = {
			...this._state,
			mode,
		};
	}

	updateFilterContext(context: Partial<ModalState['filterContext']>): void {
		const newFilterContext = { ...this._state.filterContext, ...context };

		const updatedDisplayedGames = filterGamesByContext(gamesStore.games, newFilterContext);

		let updatedActiveGame = this._state.activeGame;
		if (updatedActiveGame && !updatedDisplayedGames.find((g) => g.id === updatedActiveGame?.id)) {
			updatedActiveGame = null;
		}

		this._state = {
			...this._state,
			filterContext: newFilterContext,
			displayedGames: updatedDisplayedGames,
			activeGame: updatedActiveGame,
		};
	}

	getReactiveNavigationGamesFromContext(allGames: Game[], filterContext: ModalState['filterContext']): Game[] {
		return filterGamesByContext(allGames, filterContext);
	}

	getReactiveNavigationGames(allGames: Game[]): Game[] {
		if (!this._state.filterContext) return allGames;
		return filterGamesByContext(allGames, this._state.filterContext);
	}

	updateFormData(field: string, value: unknown): void {
		this._state = {
			...this._state,
			formData: {
				...this._state.formData,
				[field]: value,
			},
			validationErrors: {
				...this._state.validationErrors,
				[field]: '',
			},
		};
	}

	resetForm(): void {
		if (this._state.mode === 'edit' && this._state.activeGame) {
			this._state = {
				...this._state,
				formData: { ...this._state.activeGame },
				validationErrors: {},
				isSubmitting: false,
			};
		} else {
			this._state = {
				...this._state,
				formData: {
					status: 'Planned',
					coOp: 'No',
				},
				validationErrors: {},
				isSubmitting: false,
			};
		}
	}

	validateForm(): boolean {
		const errors = validateFormDataFn(this._state.formData);
		this._state = {
			...this._state,
			validationErrors: errors,
		};
		return Object.keys(errors).length === 0;
	}

	async submitForm(): Promise<boolean> {
		const state = this._state;

		this._state = {
			...this._state,
			isSubmitting: true,
			validationErrors: {},
		};

		if (!this.validateForm()) {
			this._state = {
				...this._state,
				isSubmitting: false,
			};
			return false;
		}

		try {
			if (state.mode === 'add') {
				const newGame = buildNewGame(state.formData);
				gamesStore.addGame(newGame);
			} else if (state.mode === 'edit' && state.activeGame) {
				const updatedGame = buildUpdatedGame(state.activeGame, state.formData);
				gamesStore.updateGame(state.activeGame.id, updatedGame);
			}

			this.closeModal();
			return true;
		} catch {
			this._state = {
				...this._state,
				isSubmitting: false,
				validationErrors: {
					submit: 'An error occurred while saving the game. Please try again.',
				},
			};
			return false;
		}
	}

	getTierFromScore(score: number): TierValue {
		return getTierFromScoreFn(score);
	}

	readFromURL(searchParams: URLSearchParams, games: Game[]): void {
		if (this.isProgrammaticUpdate) return;

		const gameSlug = searchParams.get('game');
		if (gameSlug && isValidSlug(gameSlug)) {
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

	openPendingGameFromURL(displayedGames: Game[], filterContext?: Partial<ModalState['filterContext']>): void {
		const state = this._state;
		const pendingGame = state.pendingGameFromURL;
		if (pendingGame && displayedGames.some((g) => g.id === pendingGame.id)) {
			this.openViewModal(pendingGame, displayedGames, filterContext);
		}
	}

	handleEscape(): void {
		if (this._state.isOpen) {
			this._state = {
				...this._state,
				isOpen: false,
			};
		}
	}
}

export const modalStore = new ModalStore();
export type { ModalStore };

import { pushState, replaceState } from '$app/navigation';
import { createGameSlug, isValidSlug } from '$lib/utils/slugUtils';
import type { Game } from '$lib/types/game';
import type { SortOption } from '$lib/stores/filters.svelte';
import { gamesStore } from '$lib/stores/games.svelte';
import { filterGamesByContext } from '$lib/stores/modalNavigation.svelte';

export interface CardRect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ModalState {
	isOpen: boolean;
	activeGame: Game | null;
	mode: 'view';
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
	private programmaticUpdateId = 0;

	// Removed debouncedWriteToURL to prevent race conditions with readFromURL

	get isOpen(): boolean {
		return this._state.isOpen;
	}

	get activeGame(): Game | null {
		return this._state.activeGame;
	}

	get mode(): 'view' {
		return this._state.mode;
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
			displayedGames: finalDisplayedGames,
			pendingGameFromURL: null,
			cardRect: cardRect ?? null,
			filterContext: filterContext ? { ...this._state.filterContext, ...filterContext } : this._state.filterContext,
		};

		this.writeToURL();
	}

	closeModal(): void {
		this._state = {
			...this._state,
			isOpen: false,
			activeGame: null,
			mode: 'view',
			displayedGames: [],
			pendingGameFromURL: null,
			cardRect: null,
		};

		this.writeToURL();
	}

	reset(): void {
		this._state = { ...initialState };
		this.isProgrammaticUpdate = false;
		this.programmaticUpdateId = 0;
	}

	getReactiveNavigationGames(allGames: Game[]): Game[] {
		if (!this._state.filterContext) return allGames;
		return filterGamesByContext(allGames, this._state.filterContext);
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
		const currentUpdateId = ++this.programmaticUpdateId;

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
				if (this.programmaticUpdateId === currentUpdateId) {
					this.isProgrammaticUpdate = false;
				}
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
}

export const modalStore = new ModalStore();
export type { ModalStore };

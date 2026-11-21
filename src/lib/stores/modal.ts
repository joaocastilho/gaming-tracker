import type { SortOption } from '#lib/stores/filters.js';
import { gamesStore } from '#lib/stores/games.js';
import { filterGamesByContext } from '#lib/stores/modalNavigation.js';
import type { Game } from '#lib/types/game.js';
import { goto } from '#lib/utils/routerBridge.js';
import { createGameSlug, isValidSlug } from '#lib/utils/slugUtils.js';
import { createSyncSignal } from './signalHelpers.js';

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
	private _state = createSyncSignal<ModalState>({ ...initialState });
	private isProgrammaticUpdate = false;
	private programmaticUpdateId = 0;

	get isOpen(): boolean {
		return this._state.get().isOpen;
	}

	get activeGame(): Game | null {
		return this._state.get().activeGame;
	}

	get mode(): 'view' {
		return this._state.get().mode;
	}

	get displayedGames(): Game[] {
		return this._state.get().displayedGames;
	}

	get filterContext(): ModalState['filterContext'] {
		return this._state.get().filterContext;
	}

	get cardRect(): CardRect | null {
		return this._state.get().cardRect;
	}

	getState(): ModalState {
		return this._state.get();
	}

	openViewModal(
		game: Game | null,
		displayedGames: Game[] = [],
		filterContext?: Partial<ModalState['filterContext']>,
		cardRect?: CardRect
	): void {
		const current = this._state.get();
		let finalDisplayedGames = displayedGames;

		if (displayedGames.length === 0 && !filterContext) {
			finalDisplayedGames = current.displayedGames.length > 0 ? current.displayedGames : gamesStore.games;
		}

		this._state.set({
			...current,
			isOpen: true,
			activeGame: game,
			mode: 'view',
			displayedGames: finalDisplayedGames,
			cardRect: cardRect ?? null,
			filterContext: filterContext ? { ...current.filterContext, ...filterContext } : current.filterContext,
		});

		void this.writeToURL();
	}

	closeModal(): void {
		const current = this._state.get();
		this._state.set({
			...current,
			isOpen: false,
			activeGame: null,
			mode: 'view',
			displayedGames: [],
			cardRect: null,
		});

		void this.writeToURL();
	}

	reset(): void {
		this._state.set({ ...initialState });
		this.isProgrammaticUpdate = false;
		this.programmaticUpdateId = 0;
	}

	getReactiveNavigationGames(allGames: Game[]): Game[] {
		const current = this._state.get();
		if (!current.filterContext) return allGames;
		return filterGamesByContext(allGames, current.filterContext);
	}

	readFromURL(searchParams: Pick<URLSearchParams, 'get'>, displayedGames: Game[]): void {
		if (this.isProgrammaticUpdate) return;

		const gameSlug = searchParams.get('game');
		if (gameSlug && isValidSlug(gameSlug)) {
			// Indexed lookup: title slug, main-title slug, then id.
			const game = gamesStore.findByUrlSlug(gameSlug);
			if (game) {
				const state = this._state.get();
				if (!state.isOpen || state.activeGame?.id !== game.id) {
					this.openViewModal(game, displayedGames);
				}
			}
		} else {
			const state = this._state.get();
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
			const state = this._state.get();
			const url = new URL(window.location.href);
			const currentSlug = url.searchParams.get('game');

			if (state.isOpen && state.activeGame) {
				const slug = createGameSlug(state.activeGame.title);

				if (currentSlug) {
					url.searchParams.set('game', slug);
					await goto(url.toString(), { shallow: true, replace: true });
				} else {
					url.searchParams.set('game', slug);
					await goto(url.toString(), { shallow: true });
				}
			} else if (currentSlug) {
				url.searchParams.delete('game');
				await goto(url.toString(), { shallow: true, replace: true });
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
}

export const modalStore = new ModalStore();
export type { ModalStore };

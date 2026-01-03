import { untrack } from 'svelte';
import type { Game } from '$lib/types/game';

interface CompletedGamesCacheState {
	sortedCompletedGames: Game[];
	lastUpdated: number;
	gamesVersion: string;
}

class CompletedGamesCacheStore {
	private _cache = $state<CompletedGamesCacheState | null>(null);
	private lastUpdateId = '';
	private updateTimeout: ReturnType<typeof setTimeout> | null = null;

	get cache(): CompletedGamesCacheState | null {
		return this._cache;
	}

	/**
	 * Sort completed games by finished date (most recent first)
	 * Games without finished dates are placed at the end
	 */
	private sortCompletedGamesByDate(games: Game[]): Game[] {
		return games
			.filter((game) => game.status === 'Completed')
			.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
			});
	}

	/**
	 * Generate a version hash for the games data
	 * This helps us detect when games have been added/modified/deleted
	 */
	private generateGamesVersion(games: Game[]): string {
		const versionData = games
			.filter((game) => game.status === 'Completed')
			.map((game) => `${game.id}-${game.status}-${game.finishedDate || 'null'}`)
			.toSorted()
			.join('|');

		let hash = 0;
		for (let i = 0; i < versionData.length; i++) {
			const char = versionData.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}
		return hash.toString();
	}

	/**
	 * Update the cache if games data has changed
	 */
	updateCache(games: Game[]): void {
		const gamesVersion = this.generateGamesVersion(games);
		const currentCache = this._cache;

		const updateId = `${gamesVersion}-${games.length}`;

		if (this.updateTimeout) {
			clearTimeout(this.updateTimeout);
		}

		this.updateTimeout = setTimeout(() => {
			if (this.lastUpdateId === updateId) {
				return;
			}
			if (!currentCache || currentCache.gamesVersion !== gamesVersion) {
				const sortedCompletedGames = this.sortCompletedGamesByDate(games);
				this._cache = {
					sortedCompletedGames,
					lastUpdated: Date.now(),
					gamesVersion
				};

				this.lastUpdateId = updateId;
			} else {
				this.lastUpdateId = updateId;
			}
		}, 50);
	}

	/**
	 * Get the cached sorted completed games
	 * Returns null if cache is empty or needs updating
	 */
	getCachedCompletedGames(games: Game[]): Game[] | null {
		const currentCache = this._cache;
		if (!currentCache) return null;

		const currentVersion = this.generateGamesVersion(games);
		if (currentCache.gamesVersion !== currentVersion) {
			this.updateCache(games);
			return this._cache?.sortedCompletedGames || null;
		}

		return currentCache.sortedCompletedGames;
	}

	/**
	 * Check if the cache needs to be updated
	 */
	needsUpdate(games: Game[]): boolean {
		const currentCache = this._cache;
		if (!currentCache) return true;

		const currentVersion = this.generateGamesVersion(games);
		return currentCache.gamesVersion !== currentVersion;
	}

	clearCache(): void {
		this._cache = null;
	}

	getCacheInfo(): CompletedGamesCacheState | null {
		return this._cache;
	}

	// For backwards compatibility with $completedGamesCache subscription
	subscribe(fn: (value: CompletedGamesCacheState | null) => void): () => void {
		fn(this._cache);

		const root = $effect.root(() => {
			let first = true;
			$effect(() => {
				const state = this._cache;
				if (first) {
					first = false;
					return;
				}
				untrack(() => fn(state));
			});
		});

		return () => {
			root();
		};
	}
}

export const completedGamesCache = new CompletedGamesCacheStore();

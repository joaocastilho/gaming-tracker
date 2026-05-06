import type { Game } from '$lib/types/game';
import { parseDate } from '$lib/utils/dateUtils';

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

	private sortCompletedGamesByDate(games: Game[]): Game[] {
		return games
			.filter((game) => game.status === 'Completed')
			.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				const dateA = parseDate(a.finishedDate);
				const dateB = parseDate(b.finishedDate);
				if (!dateA || !dateB) return 0;
				return dateB - dateA;
			});
	}

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
					gamesVersion,
				};

				this.lastUpdateId = updateId;
			} else {
				this.lastUpdateId = updateId;
			}
		}, 50);
	}

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
}

export const completedGamesCache = new CompletedGamesCacheStore();

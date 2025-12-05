import { writable, get } from 'svelte/store';
import type { Game } from '$lib/types/game';

interface CompletedGamesCache {
	sortedCompletedGames: Game[];
	lastUpdated: number;
	gamesVersion: string;
}

/**
 * Cache for completed games sorted by finished date
 * This prevents re-sorting on every tab switch to the completed view
 */
function createCompletedGamesCache() {
	const cache = writable<CompletedGamesCache | null>(null);
	let lastUpdateId = '';
	let updateTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Sort completed games by finished date (most recent first)
	 * Games without finished dates are placed at the end
	 */
	function sortCompletedGamesByDate(games: Game[]): Game[] {
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
	function generateGamesVersion(games: Game[]): string {
		const versionData = games
			.filter((game) => game.status === 'Completed')
			.map((game) => `${game.id}-${game.status}-${game.finishedDate || 'null'}`)
			.sort()
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
	function updateCache(games: Game[]) {
		const gamesVersion = generateGamesVersion(games);
		const currentCache = get(cache);

		const updateId = `${gamesVersion}-${games.length}`;

		if (updateTimeout) {
			clearTimeout(updateTimeout);
		}

		updateTimeout = setTimeout(() => {
			if (lastUpdateId === updateId) {
				return;
			}
			if (!currentCache || currentCache.gamesVersion !== gamesVersion) {
				const sortedCompletedGames = sortCompletedGamesByDate(games);
				cache.set({
					sortedCompletedGames,
					lastUpdated: Date.now(),
					gamesVersion
				});

				lastUpdateId = updateId;
			} else {
				lastUpdateId = updateId;
			}
		}, 50);
	}

	/**
	 * Get the cached sorted completed games
	 * Returns null if cache is empty or needs updating
	 */
	function getCachedCompletedGames(games: Game[]): Game[] | null {
		const currentCache = get(cache);
		if (!currentCache) return null;

		const currentVersion = generateGamesVersion(games);
		if (currentCache.gamesVersion !== currentVersion) {
			updateCache(games);
			return get(cache)?.sortedCompletedGames || null;
		}

		return currentCache.sortedCompletedGames;
	}

	/**
	 * Check if the cache needs to be updated
	 */
	function needsUpdate(games: Game[]): boolean {
		const currentCache = get(cache);
		if (!currentCache) return true;

		const currentVersion = generateGamesVersion(games);
		return currentCache.gamesVersion !== currentVersion;
	}

	return {
		subscribe: cache.subscribe,
		updateCache,
		getCachedCompletedGames,
		needsUpdate,

		clearCache() {
			cache.set(null);
		},
		getCacheInfo() {
			return get(cache);
		}
	};
}

export const completedGamesCache = createCompletedGamesCache();

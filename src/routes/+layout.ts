import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const load: LayoutLoad = async ({ fetch }) => {
	// 1. Try to load from Dexie first (instant, works offline)
	if (browser) {
		try {
			// Dynamic import to avoid SSR issues with IndexedDB
			const { db } = await import('$lib/db');
			const cachedGames = await db.games.toArray();

			if (cachedGames.length > 0) {
				// Return cached data immediately -> Fast First Paint
				// Then trigger background refresh
				refreshGamesInBackground(fetch, db);

				return {
					games: cachedGames,
					meta: null,
					source: 'dexie'
				};
			}
		} catch (e) {
			console.warn('Failed to load from Dexie:', e);
		}
	}

	// 2. Fall back to network (games.json)
	try {
		const res = await fetch('/games.json', {
			headers: { accept: 'application/json' }
		});

		if (res.ok) {
			const data = await res.json();
			const games = data.games || [];

			// 3. Seed Dexie with fresh data for next time
			if (browser && games.length > 0) {
				import('$lib/db').then(({ db }) => {
					db.games.bulkPut(games).catch((err) => console.error('Failed to seed Dexie:', err));
				});
			}

			return {
				games: games,
				meta: null,
				source: 'network'
			};
		}
	} catch {
		// Silently ignore fetch errors
	}

	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

/**
 * Background Sync: Fetches latest games.json and updates Dexie.
 * If data changed, the UI will reactively update via liveQuery (if used)
 * or on next navigation/refresh.
 */
async function refreshGamesInBackground(
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	db: any
) {
	try {
		const res = await fetch('/games.json?t=' + Date.now(), {
			headers: { accept: 'application/json' }
		});

		if (res.ok) {
			const data = await res.json();
			if (data.games?.length > 0) {
				// Update Dexie with fresh data
				await db.games.bulkPut(data.games);

				// Optional: Check if we need to remove deleted games
				// (For now assuming bulkPut overwrites is same as simple sync,
				// full sync might need more logic but this is a starter)
			}
		}
	} catch (e) {
		console.warn('Background refresh failed:', e);
	}
}

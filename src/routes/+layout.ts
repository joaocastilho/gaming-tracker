import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';
import type { GamingTrackerDB } from '$lib/db';

export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
	if (browser) {
		try {
			const { db } = await import('$lib/db');
			const cachedGames = await db.games.toArray();

			if (cachedGames.length > 0) {
				refreshGamesInBackground(fetch, db);

				return {
					games: cachedGames,
					meta: null,
					source: 'dexie',
				};
			}
		} catch (e) {
			console.warn('Failed to load from Dexie:', e);
		}
	}

	try {
		const res = await fetch('/games.json', {
			headers: { accept: 'application/json' },
		});

		if (res.ok) {
			const data = await res.json();
			const games = data.games || [];

			if (browser && games.length > 0) {
				import('$lib/db').then(async ({ db }) => {
					await db
						.transaction('rw', db.games, async () => {
							await db.games.clear();
							await db.games.bulkPut(games);
						})
						.catch((err) => console.error('Failed to seed Dexie:', err));
				});
			}

			return {
				games: games,
				meta: null,
				source: 'network',
			};
		}
	} catch {
		// Silently ignore fetch errors
	}

	return {
		games: [],
		meta: null,
		source: 'none',
	};
};

async function refreshGamesInBackground(
	fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	db: GamingTrackerDB
) {
	try {
		const res = await fetch('/games.json?t=' + Date.now(), {
			headers: { accept: 'application/json' },
		});

		if (res.ok) {
			const data = await res.json();
			if (data.games?.length > 0) {
				await db.transaction('rw', db.games, async () => {
					await db.games.clear();
					await db.games.bulkPut(data.games);
				});
			}
		}
	} catch (e) {
		console.warn('Background refresh failed:', e);
	}
}

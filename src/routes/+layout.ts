import type { LayoutLoad } from './$types';
import { browser, dev } from '$app/environment';
import type { GamingTrackerDB } from '$lib/db';
import { toSlug } from '$lib/utils/slugUtils';
import type { Game } from '$lib/types/game';

export const prerender = true;

export const load: LayoutLoad = async ({ fetch, url }) => {
	const gameSlug = url.searchParams.get('game');
	let games: Game[] = [];
	let sharedGame: Game | null = null;

	if (browser) {
		try {
			const { db } = await import('$lib/db');
			const cachedGames = await db.games.toArray();

			if (cachedGames.length > 0) {
				refreshGamesInBackground(fetch, db);
				games = cachedGames;
			}
		} catch (e) {
			if (dev) console.warn('Failed to load from Dexie:', e);
		}
	}

	if (games.length === 0) {
		try {
			const res = await fetch('/games.json', {
				headers: { accept: 'application/json' },
			});

			if (res.ok) {
				const data = await res.json();
				games = data.games || [];

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
			}
		} catch {
			// Silently ignore fetch errors
		}
	}

	if (gameSlug && games.length > 0) {
		sharedGame = games.find((g) => toSlug(g.title) === gameSlug) || null;
	}

	return {
		games,
		sharedGame,
		meta: null,
		source: games.length > 0 ? 'dexie' : 'network', // Adding back for compatibility
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
		if (dev) console.warn('Background refresh failed:', e);
	}
}

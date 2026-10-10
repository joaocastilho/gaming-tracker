import type { LayoutLoad } from './$types';
import { browser, dev } from '$app/env';
import type { GamingTrackerDB } from '#lib/db.js';
import { decideGamesRefresh, readPayloadLastUpdated } from '#lib/utils/gamesRefreshPolicy.js';
import type { Game } from '#lib/types/game.js';

const GAMES_MARKER_KEY = 'games-last-updated';

// Required by @sveltejs/adapter-static: every route prerenders at build time.
export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
	let games: Game[] = [];
	let gamesSource: 'cache' | 'network' | 'none' = 'none';

	if (browser) {
		try {
			const { db } = await import('#lib/db.js');
			const cachedGames = await db.games.toArray();

			if (cachedGames.length > 0) {
				refreshGamesInBackground(fetch, db);
				games = cachedGames;
				gamesSource = 'cache';
			}
		} catch (e) {
			if (dev) console.warn('Failed to load from Dexie:', e);
		}
	}

	if (browser && games.length === 0) {
		try {
			const res = await fetch('/games.json', {
				headers: { accept: 'application/json' },
			});

			if (res.ok) {
				const data = await res.json();
				games = data.games || [];
				if (games.length > 0) gamesSource = 'network';
			}
		} catch {
			// Silently ignore fetch errors
		}
	}

	return {
		games,
		gamesSource,
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

			// The payload's meta.lastUpdated is stamped on every write. Comparing
			// it to the marker in IndexedDB skips the full clear + bulkPut
			// rewrite on page loads where games.json has not changed.
			const cachedMarker = await db.meta.get(GAMES_MARKER_KEY);
			const decision = decideGamesRefresh(data, cachedMarker?.value ?? null);
			if (decision !== 'apply') return;

			const nextMarker = readPayloadLastUpdated(data);
			await db.transaction('rw', db.games, db.meta, async () => {
				await db.games.clear();
				await db.games.bulkPut(data.games);
				if (nextMarker !== null) {
					await db.meta.put({ key: GAMES_MARKER_KEY, value: nextMarker }, GAMES_MARKER_KEY);
				}
			});
		}
	} catch (e) {
		if (dev) console.warn('Background refresh failed:', e);
	}
}

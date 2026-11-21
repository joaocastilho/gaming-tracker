import type { GamingTrackerDB } from '#lib/db.js';
import type { Game } from '#lib/types/game.js';
import { browser, dev } from '#lib/utils/env.js';
import { decideGamesRefresh, readPayloadLastUpdated } from '#lib/utils/gamesRefreshPolicy.js';

const GAMES_MARKER_KEY = 'games-last-updated';
const DB_SEEDED_KEY = 'gaming-tracker-db-seeded';

export interface GamesLoadResult {
	games: Game[];
	gamesSource: 'cache' | 'network' | 'none';
}

function hasSeededLocalDb(): boolean {
	try {
		return typeof localStorage !== 'undefined' && localStorage.getItem(DB_SEEDED_KEY) === '1';
	} catch {
		return false;
	}
}

export async function loadInitialGames(
	fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> = fetch
): Promise<GamesLoadResult> {
	let games: Game[] = [];
	let gamesSource: 'cache' | 'network' | 'none' = 'none';

	// On a cold first visit, skip loading the 74 KiB Dexie chunk so /games.json
	// can fetch and render immediately without waiting for IndexedDB setup.
	if (browser && hasSeededLocalDb()) {
		try {
			const { db } = await import('#lib/db.js');
			const cachedGames = await db.games.toArray();

			if (cachedGames.length > 0) {
				void refreshGamesInBackground(fetchFn, db);
				games = cachedGames;
				gamesSource = 'cache';
			}
		} catch (e) {
			if (dev) console.warn('Failed to load from Dexie:', e);
		}
	}

	if (browser && games.length === 0) {
		try {
			const earlyPromise = typeof window !== 'undefined' ? window.__INITIAL_GAMES_PROMISE__ : undefined;
			if (earlyPromise && fetchFn === fetch) {
				delete window.__INITIAL_GAMES_PROMISE__;
				const earlyData = (await earlyPromise) as { games?: Game[] } | null;
				if (earlyData?.games && earlyData.games.length > 0) {
					games = earlyData.games;
					gamesSource = 'network';
				}
			}

			if (games.length === 0) {
				const res = await fetchFn('/games.json', {
					headers: { accept: 'application/json' },
				});

				if (res.ok) {
					const data = (await res.json()) as { games?: Game[] };
					games = data.games || [];
					if (games.length > 0) gamesSource = 'network';
				}
			}
		} catch {
			try {
				const { db } = await import('#lib/db.js');
				const cachedGames = await db.games.toArray();
				if (cachedGames.length > 0) {
					games = cachedGames;
					gamesSource = 'cache';
				}
			} catch {
				// Silently ignore fallback errors
			}
		}
	}

	return { games, gamesSource };
}

async function refreshGamesInBackground(
	fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
	db: GamingTrackerDB
): Promise<void> {
	try {
		const res = await fetchFn(`/games.json?t=${Date.now()}`, {
			headers: { accept: 'application/json' },
		});

		if (res.ok) {
			const data = (await res.json()) as { games: Game[] };

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

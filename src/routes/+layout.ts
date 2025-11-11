import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	console.log('🎮 Layout: Starting to load games data...');
	// Local dev (bun run dev) compatibility:
	// Vite does not mount Cloudflare Pages functions, so /api/games 404s.
	// In that case, fall back to the bundled static JSON file.
	try {
		console.log('🎮 Layout: Attempting to fetch /games.json');
		const staticRes = await fetch('/games.json', { headers: { accept: 'application/json' } });
		console.log('🎮 Layout: Static fetch response status:', staticRes.status, 'ok:', staticRes.ok);

		if (staticRes.ok) {
			const games = await staticRes.json();
			console.log('🎮 Layout: Successfully loaded', games?.length, 'games from static JSON');
			return {
				games,
				meta: null,
				source: 'static'
			};
		} else {
			console.log('🎮 Layout: Static fetch failed with status:', staticRes.status);
		}
	} catch (error) {
		console.warn('🎮 Layout: Failed to load games.json:', error);
	}

	// Only try API if not in development
	if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
		try {
			console.log('🎮 Layout: Attempting to fetch /api/games');
			const res = await fetch('/api/games', { headers: { accept: 'application/json' } });

			if (res.ok) {
				const data = await res.json();
				console.log('🎮 Layout: Successfully loaded games from API');
				return {
					games: data.games,
					meta: data.meta ?? null,
					source: 'api'
				};
			}
		} catch (error) {
			console.warn('🎮 Layout: Failed to load /api/games:', error);
		}
	}

	console.log('🎮 Layout: No games data available, returning empty array');
	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

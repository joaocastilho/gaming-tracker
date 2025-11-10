import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	// Local dev (bun run dev) compatibility:
	// Vite does not mount Cloudflare Pages functions, so /api/games 404s.
	// In that case, fall back to the bundled static JSON file.
	try {
		const staticRes = await fetch('/games.json', { headers: { accept: 'application/json' } });

		if (staticRes.ok) {
			const games = await staticRes.json();
			return {
				games,
				meta: null,
				source: 'static'
			};
		}
	} catch (error) {
		console.warn('Failed to load games.json:', error);
	}

	// Only try API if not in development
	if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
		try {
			const res = await fetch('/api/games', { headers: { accept: 'application/json' } });

			if (res.ok) {
				const data = await res.json();
				return {
					games: data.games,
					meta: data.meta ?? null,
					source: 'api'
				};
			}
		} catch (error) {
			console.warn('Failed to load /api/games:', error);
		}
	}

	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

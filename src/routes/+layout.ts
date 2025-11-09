import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
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
	} catch {
		// Ignore and fall through to next strategies
	}

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
	} catch {
		// Ignore and fall through
	}

	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

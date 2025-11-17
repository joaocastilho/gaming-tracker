import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	// Local dev (bun run dev) compatibility:
	// Vite does not mount Cloudflare Pages functions, so /api/games 404s.
	// In that case, fall back to the bundled static JSON file.
	try {
		const staticRes = await fetch('/games.json', { headers: { accept: 'application/json' } });

		if (staticRes.ok) {
			return {
				games: fetch('/games.json').then((r) => r.json()).then((data) => data.games),
				meta: null,
				source: 'static'
			};
		}
	} catch {
		// Silently ignore static JSON fetch errors
	}

	if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost')) {
		try {
			const res = await fetch('/api/games', { headers: { accept: 'application/json' } });

			if (res.ok) {
				return {
					games: fetch('/api/games')
						.then((r) => r.json())
						.then((data) => data.games),
					meta: null,
					source: 'api'
				};
			}
		} catch {
			// Silently ignore API errors in development
		}
	}

	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

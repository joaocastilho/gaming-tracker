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

		// If API returns 404 or non-ok, fall back to static
	} catch {
		// Network/worker failure → fallback below
	}

	// Static fallback: the SvelteKit app still has access to bundled static/games.json via relative fetch.
	const staticRes = await fetch('/games.json', { headers: { accept: 'application/json' } });

	if (staticRes.ok) {
		const games = await staticRes.json();
		return {
			games,
			meta: null,
			source: 'static'
		};
	}

	// Last resort: empty list to avoid hard crash
	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

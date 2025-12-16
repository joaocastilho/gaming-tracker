import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	try {
		const staticRes = await fetch(`/games.json?t=${Date.now()}`, {
			headers: { accept: 'application/json' }
		});

		if (staticRes.ok) {
			const data = await staticRes.json();
			return {
				games: data.games,
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
				const data = await res.json();
				return {
					games: data.games,
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

import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/games.json', {
			headers: { accept: 'application/json' }
		});

		if (res.ok) {
			const data = await res.json();
			return {
				games: data.games,
				meta: null,
				source: 'static'
			};
		}
	} catch {
		// Silently ignore fetch errors
	}

	return {
		games: [],
		meta: null,
		source: 'none'
	};
};

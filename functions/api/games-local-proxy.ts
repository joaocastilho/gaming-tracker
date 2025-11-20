import { GamesPayloadSchema } from '../../src/lib/validation/game';

/**
 * Local-only handler to serve games from the bundled static JSON.
 *
 * This makes /api/games work in plain `bun dev` / `vite dev` without Cloudflare KV.
 * Cloudflare Pages/Workers should use functions/api/games.ts instead.
 */
export const onRequestGet = async () => {
	try {
		const res = await fetch('http://localhost:5173/games.json');

		if (!res.ok) {
			return new Response(JSON.stringify({ error: 'Failed to load games.json' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache'
				}
			});
		}

		const data = (await res.json()) as unknown;
		const parsed = GamesPayloadSchema.safeParse(data);

		if (!parsed.success) {
			return new Response(JSON.stringify({ error: 'Invalid games.json format' }), {
				status: 500,
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'no-cache'
				}
			});
		}

		return new Response(JSON.stringify(parsed.data), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
			}
		});
	} catch (error) {
		console.error('games-local-proxy failed', error);
		return new Response(JSON.stringify({ error: 'Failed to load games locally' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			}
		});
	}
};

import fs from 'node:fs';
import path from 'node:path';
import { GamesPayloadSchema } from '../../src/lib/validation/game';

/**
 * Local-only handler to write games directly to static/games.json.
 * This endpoint is for dev mode only - allows immediate file saves.
 *
 * POST /api/games-local
 * Body: { games: Game[] }
 */
export const onRequestPost = async ({ request }: { request: Request }) => {
	// This endpoint only works in local dev mode
	// In production, this file won't be served or will return 404
	try {
		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return new Response(JSON.stringify({ error: 'Expected application/json body' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const body = await request.json().catch(() => null);
		if (!body || !Array.isArray(body.games)) {
			return new Response(JSON.stringify({ error: 'Invalid payload: games array required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const parsed = GamesPayloadSchema.safeParse(body);
		if (!parsed.success) {
			return new Response(
				JSON.stringify({
					error: 'Validation failed',
					issues: parsed.error.issues
				}),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		// Write to static/games.json
		const gamesJsonPath = path.resolve(process.cwd(), 'static', 'games.json');
		const jsonContent = JSON.stringify(parsed.data, null, 4);

		fs.writeFileSync(gamesJsonPath, jsonContent, 'utf-8');

		return new Response(JSON.stringify({ ok: true, saved: parsed.data.games.length }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error('games-local write failed', error);
		return new Response(
			JSON.stringify({
				error: 'Failed to write games locally',
				message: error instanceof Error ? error.message : String(error)
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

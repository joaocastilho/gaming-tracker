import { json } from '@sveltejs/kit';
// Node imports must be dynamic to avoid breaking Cloudflare build
// They will only be loaded in dev mode

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	// Only allow this in development mode for safety
	if (import.meta.env.PROD) {
		return new Response('Not found', { status: 404 });
	}

	const fs = (await import('node:fs/promises')).default;
	const path = (await import('node:path')).default;

	try {
		const payload = await request.json();

		// Ensure the payload has the expected structure
		if (!payload || !Array.isArray(payload.games)) {
			return json({ error: 'Invalid payload: games array required' }, { status: 400 });
		}

		// Path to static/games.json
		const filePath = path.join(process.cwd(), 'static', 'games.json');

		// Write the updated games list to the file, transforming dates back to DD/MM/YYYY
		// to match user preference and existing file format.
		const gamesForFile = payload.games.map((g: Record<string, unknown>) => {
			// Clone to avoid mutating original payload
			const gameHeader = { ...g };

			if (gameHeader.finishedDate && typeof gameHeader.finishedDate === 'string') {
				// Check if it looks like an ISO date or YYYY-MM-DD
				// We want DD/MM/YYYY e.g. "18/06/2023"
				try {
					const d = new Date(gameHeader.finishedDate);
					if (!isNaN(d.getTime())) {
						const day = String(d.getUTCDate()).padStart(2, '0');
						const month = String(d.getUTCMonth() + 1).padStart(2, '0');
						const year = d.getUTCFullYear();
						gameHeader.finishedDate = `${day}/${month}/${year}`;
					}
				} catch {
					// Keep original if parsing fails
				}
			}

			// Remove computed fields that shouldn't be persisted
			delete gameHeader.mainTitle;
			delete gameHeader.subtitle;

			if (gameHeader.sortPriority === null || gameHeader.sortPriority === undefined) {
				delete gameHeader.sortPriority;
			}

			return gameHeader;
		});

		const outputPayload = {
			...payload,
			games: gamesForFile
		};

		await fs.writeFile(filePath, JSON.stringify(outputPayload, null, 4), 'utf-8');

		return json({ ok: true, saved: payload.games.length });
	} catch (error) {
		console.error('[Dev API] Error writing to games.json:', error);
		return json(
			{
				error: 'Failed to write games locally',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}

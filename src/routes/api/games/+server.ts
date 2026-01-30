import { json } from '@sveltejs/kit';
// Node imports must be dynamic to avoid breaking Cloudflare build
// They will only be loaded in dev mode

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	if (import.meta.env.PROD) {
		return new Response('Not found', { status: 404 });
	}

	const fs = (await import('node:fs/promises')).default;
	const path = (await import('node:path')).default;

	try {
		const payload = await request.json();

		if (!payload || !Array.isArray(payload.games)) {
			return json({ error: 'Invalid payload' }, { status: 400 });
		}

		const filePath = path.join(process.cwd(), 'static', 'games.json');

		const gamesForFile = payload.games.map((g) => {
			const gameHeader = { ...g };

			if (gameHeader.finishedDate && typeof gameHeader.finishedDate === 'string') {
				try {
					const d = new Date(gameHeader.finishedDate);
					if (!isNaN(d.getTime())) {
						const day = String(d.getUTCDate()).padStart(2, '0');
						const month = String(d.getUTCMonth() + 1).padStart(2, '0');
						const year = d.getUTCFullYear();
						gameHeader.finishedDate = `${day}/${month}/${year}`;
					}
				} catch {
					// Keep original finishedDate if parsing fails
				}
			}

			delete gameHeader.mainTitle;
			delete gameHeader.subtitle;

			return gameHeader;
		});

		// Sort games alphabetically by id
		gamesForFile.sort((a: { id: string }, b: { id: string }) => a.id.localeCompare(b.id));

		const outputPayload = {
			...payload,
			games: gamesForFile
		};

		await fs.writeFile(filePath, JSON.stringify(outputPayload, null, 4), 'utf-8');

		return json({ success: true, games: payload.games });
	} catch (error) {
		console.error('[Dev API] Error writing to games.json:', error);
		return json({ error: 'Failed to write file' }, { status: 500 });
	}
}

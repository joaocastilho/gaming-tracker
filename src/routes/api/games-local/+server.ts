import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }: { request: Request }) {
	// Only allow this in development mode for safety
	if (import.meta.env.PROD) {
		return new Response('Not found', { status: 404 });
	}

	const fs = (await import('node:fs/promises')).default;
	const path = (await import('node:path')).default;

	try {
		const contentType = request.headers.get('content-type') || '';
		let payload: unknown;

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const gamesJson = formData.get('games') as string;

			if (!gamesJson) {
				return json({ error: 'Invalid payload: games JSON required' }, { status: 400 });
			}
			payload = JSON.parse(gamesJson);

			// Handle multiple cover uploads
			// format: key = "cover_<gameId>"
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('cover_') && typeof value !== 'string') {
					const gameIdForCover = key.substring(6); // remove "cover_"
					const coverFile = value as File;

					if (gameIdForCover && coverFile) {
						const sanitizedGameId = gameIdForCover.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

						// Save to covers_raw directory
						const coversRawDir = path.join(process.cwd(), 'static', 'covers_raw');
						const rawOutputPath = path.join(coversRawDir, `${sanitizedGameId}.png`);

						await fs.mkdir(coversRawDir, { recursive: true });

						const buffer = await coverFile.arrayBuffer();
						await fs.writeFile(rawOutputPath, Buffer.from(buffer));

						// Run the optimization script synchronously
						const scriptPath = path.join(process.cwd(), 'scripts', 'optimize-covers-full.ts');

						console.info(`[Dev API] optimizing cover for ${sanitizedGameId}...`);

						try {
							await new Promise<void>((resolve, reject) => {
								const child = spawn('bun', ['run', scriptPath, sanitizedGameId], {
									cwd: process.cwd(),
									stdio: 'pipe'
								});

								let stderr = '';
								child.stderr?.on('data', (data) => {
									stderr += data.toString();
								});

								child.on('close', (code) => {
									if (code === 0) {
										resolve();
									} else {
										console.error(`[Dev API] Optimization script failed: ${stderr}`);
										reject(new Error(`Optimization script failed with code ${code}: ${stderr}`));
									}
								});

								child.on('error', (err) => {
									reject(err);
								});
							});
							console.info(`[Dev API] Optimization complete for ${sanitizedGameId}`);
						} catch (optErr) {
							console.error(`[Dev API] optimization failed for ${sanitizedGameId}`, optErr);
							// Don't fail the whole request, just log
						}
					}
				}
			}
		} else {
			payload = await request.json();
		}

		const data = payload as { games?: unknown[] };
		const games = data?.games;
		if (!games || !Array.isArray(games)) {
			return json({ error: 'Invalid payload: games array required' }, { status: 400 });
		}

		const filePath = path.join(process.cwd(), 'static', 'games.json');

		const gamesForFile = games.map((g) => {
			const gameHeader = { ...(g as Record<string, unknown>) };

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

			if (gameHeader.completionOrder === null || gameHeader.completionOrder === undefined) {
				delete gameHeader.completionOrder;
			}

			return gameHeader;
		});

		// Sort games alphabetically by id
		const sortedGames = (gamesForFile as { id: string }[]).sort((a, b) => a.id.localeCompare(b.id));

		const outputPayload = {
			...data,
			games: sortedGames
		};

		await fs.writeFile(filePath, JSON.stringify(outputPayload, null, 4), 'utf-8');

		return json({ ok: true, saved: games.length });
	} catch (error) {
		console.error('[Dev API] Error processing request:', error);
		return json(
			{
				error: 'Failed to save games',
				message: error instanceof Error ? error.message : String(error)
			},
			{ status: 500 }
		);
	}
}

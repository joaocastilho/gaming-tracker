import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import type { Plugin } from 'vite';

function normalizeGamesForFile(rawGames: Record<string, unknown>[]): Record<string, unknown>[] {
	const gamesForFile = rawGames.map((g) => {
		const gameHeader = { ...g };

		if (gameHeader.finishedDate && typeof gameHeader.finishedDate === 'string') {
			try {
				const d = new Date(gameHeader.finishedDate);
				if (!Number.isNaN(d.getTime())) {
					const day = String(d.getUTCDate()).padStart(2, '0');
					const month = String(d.getUTCMonth() + 1).padStart(2, '0');
					const year = d.getUTCFullYear();
					gameHeader.finishedDate = `${day}/${month}/${year}`;
				}
			} catch {
				// ignore parse errors for finishedDate
			}
		}

		delete gameHeader.mainTitle;
		delete gameHeader.subtitle;
		delete gameHeader.searchKey;

		if (gameHeader.completionOrder === null || gameHeader.completionOrder === undefined) {
			delete gameHeader.completionOrder;
		}

		return gameHeader;
	});

	gamesForFile.sort((a, b) =>
		String(a.title ?? '').localeCompare(String(b.title ?? ''), undefined, { sensitivity: 'base' })
	);

	return gamesForFile;
}

async function readRequestBody(req: IncomingMessage): Promise<Buffer> {
	const chunks: Buffer[] = [];
	for await (const chunk of req) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

function isBlobLike(value: unknown): value is { arrayBuffer(): Promise<ArrayBuffer> } {
	return typeof value === 'object' && value !== null && 'arrayBuffer' in value;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json; charset=utf-8');
	res.end(JSON.stringify(body));
}

async function optimizeCover(sanitizedGameId: string): Promise<void> {
	const scriptPath = path.join(process.cwd(), 'scripts', 'optimize-covers-full.ts');
	await new Promise<void>((resolve, reject) => {
		const child = spawn('bun', ['run', scriptPath, sanitizedGameId], {
			cwd: process.cwd(),
			stdio: 'pipe',
		});

		let stderr = '';
		child.stderr?.on('data', (data: Buffer) => {
			stderr += data.toString();
		});

		child.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`Optimization script failed with code ${code}: ${stderr}`));
		});
		child.on('error', reject);
	});
}

/**
 * Dev-only middleware replacing SvelteKit's src/routes/api/games and
 * src/routes/api/games-local endpoints. Production uses Cloudflare Pages
 * Functions under functions/api/.
 */
export function devApiPlugin(): Plugin {
	return {
		name: 'gaming-tracker-dev-api',
		apply: 'serve',
		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (req.method !== 'POST' || (req.url !== '/api/games' && req.url !== '/api/games-local')) {
					next();
					return;
				}

				try {
					const bodyBuffer = await readRequestBody(req);
					const contentType = req.headers['content-type'] || '';
					let payload: Record<string, unknown>;

					if (req.url === '/api/games-local' && contentType.includes('multipart/form-data')) {
						const webReq = new Request('http://localhost/api/games-local', {
							method: 'POST',
							headers: { 'content-type': contentType },
							body: new Uint8Array(bodyBuffer),
						});
						const formData = await webReq.formData();
						const gamesEntry = formData.get('games');
						if (!gamesEntry) {
							sendJson(res, 400, { error: 'Invalid payload: games JSON required' });
							return;
						}
						const gamesText = typeof gamesEntry === 'string' ? gamesEntry : await gamesEntry.text();
						payload = JSON.parse(gamesText) as Record<string, unknown>;

						for (const [key, value] of formData.entries()) {
							if (key.startsWith('cover_') && isBlobLike(value)) {
								const gameIdForCover = key.substring(6);
								if (gameIdForCover) {
									const sanitizedGameId = gameIdForCover.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
									const coversRawDir = path.join(process.cwd(), 'static', 'covers_raw');
									await fs.mkdir(coversRawDir, { recursive: true });
									await fs.writeFile(
										path.join(coversRawDir, `${sanitizedGameId}.png`),
										Buffer.from(await value.arrayBuffer())
									);
									await optimizeCover(sanitizedGameId).catch(() => {
										// Optimization failure is non-fatal in local dev
									});
								}
							}
						}
					} else {
						payload = JSON.parse(bodyBuffer.toString('utf-8')) as Record<string, unknown>;
					}

					if (!payload || !Array.isArray(payload.games)) {
						sendJson(res, 400, { error: 'Invalid payload: games array required' });
						return;
					}

					const gamesForFile = normalizeGamesForFile(payload.games as Record<string, unknown>[]);
					const outputPayload = { ...payload, games: gamesForFile };
					const filePath = path.join(process.cwd(), 'static', 'games.json');
					await fs.writeFile(filePath, JSON.stringify(outputPayload, null, 4), 'utf-8');

					sendJson(res, 200, { success: true, games: payload.games });
				} catch (error) {
					sendJson(res, 500, {
						error: error instanceof Error ? error.message : 'Failed to write file',
					});
				}
			});
		},
	};
}

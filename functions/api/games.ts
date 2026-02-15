import type { z } from 'zod';

import { computeScore, GamesPayloadSchema } from '../../src/lib/validation/game';

type Env = {
	SESSION_SECRET?: string;
	GITHUB_TOKEN?: string;
	GH_REPO_OWNER?: string;
	GH_REPO_NAME?: string;
	GH_FILE_PATH?: string;
	GH_BRANCH?: string;
};

type GamesPayload = z.infer<typeof GamesPayloadSchema>;

/**
 * Decode base64 string to UTF-8 text (Web API replacement for Buffer)
 */
function base64ToUtf8(base64: string): string {
	const cleaned = base64.replace(/\n/g, '');
	const binary = atob(cleaned);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Encode UTF-8 text to base64 string (Web API replacement for Buffer)
 */
function utf8ToBase64(text: string): string {
	const bytes = new TextEncoder().encode(text);
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

async function syncGamesToGitHub(data: GamesPayload, env: Env): Promise<void> {
	const token = env.GITHUB_TOKEN;
	const owner = env.GH_REPO_OWNER;
	const repo = env.GH_REPO_NAME;
	const path = env.GH_FILE_PATH;
	const branch = env.GH_BRANCH || 'main';

	if (!token || !owner || !repo || !path) {
		throw new Error(
			`GitHub sync not configured: token=${!!token}, owner=${owner}, repo=${repo}, path=${path}`
		);
	}

	const apiBase = 'https://api.github.com';

	const getRes = await fetch(
		`${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(
			branch
		)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'User-Agent': 'gaming-tracker-cloudflare'
			}
		}
	);

	if (!getRes.ok) {
		const errorBody = await getRes.text().catch(() => 'no body');
		throw new Error(`GitHub get contents failed: ${getRes.status} - ${errorBody}`);
	}

	const fileJson = (await getRes.json()) as { sha: string; content: string };
	const currentContent = base64ToUtf8(fileJson.content);

	const nextContent = JSON.stringify(data, null, 2);
	if (currentContent === nextContent) {
		return;
	}

	const putRes = await fetch(
		`${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'Content-Type': 'application/json',
				'User-Agent': 'gaming-tracker-cloudflare'
			},
			body: JSON.stringify({
				message: 'chore(data): update games.json via cloudflare editor',
				content: utf8ToBase64(nextContent),
				sha: fileJson.sha,
				branch
			})
		}
	);

	if (!putRes.ok) {
		const errorBody = await putRes.text().catch(() => 'no body');
		throw new Error(`GitHub update failed: ${putRes.status} - ${errorBody}`);
	}
}

async function verifySession(cookieHeader: string | null, secret: string): Promise<boolean> {
	if (!cookieHeader) return false;
	const cookies = cookieHeader.split(';').map((c) => c.trim());
	const token = cookies.find((c) => c.startsWith('gt_session='))?.split('=')[1];
	if (!token) return false;

	const [expiresRaw, sig] = token.split('.');
	if (!expiresRaw || !sig) return false;

	const expiresAt = Number(expiresRaw);
	if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresRaw));
	const bytes = new Uint8Array(signature);

	let base64 = '';
	for (let i = 0; i < bytes.length; i++) {
		base64 += String.fromCharCode(bytes[i]);
	}

	const expected = btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

	return sig === expected;
}

/**
 * Encode binary data to base64 string (Web API)
 */
function binaryToBase64(bytes: Uint8Array): string {
	let binary = '';
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Commit a file to GitHub via the Contents API
 */
async function commitFileToGitHub(
	filePath: string,
	content: Uint8Array,
	message: string,
	env: Env
): Promise<void> {
	const token = env.GITHUB_TOKEN;
	const owner = env.GH_REPO_OWNER;
	const repo = env.GH_REPO_NAME;
	const branch = env.GH_BRANCH || 'main';

	if (!token || !owner || !repo) {
		throw new Error('GitHub not configured');
	}

	const apiBase = 'https://api.github.com';

	// Get current file SHA if it exists
	let sha: string | undefined;
	const getRes = await fetch(
		`${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(
			branch
		)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'User-Agent': 'gaming-tracker-cloudflare'
			}
		}
	);

	if (getRes.ok) {
		const fileJson = (await getRes.json()) as { sha: string };
		sha = fileJson.sha;
	}

	// Create or update the file
	const putRes = await fetch(
		`${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'Content-Type': 'application/json',
				'User-Agent': 'gaming-tracker-cloudflare'
			},
			body: JSON.stringify({
				message,
				content: binaryToBase64(content),
				sha,
				branch
			})
		}
	);

	if (!putRes.ok) {
		const errorBody = await putRes.text().catch(() => 'no body');
		throw new Error(`GitHub update failed: ${putRes.status} - ${errorBody}`);
	}
}

/**
 * Trigger the optimize-covers GitHub Action workflow
 */
async function triggerOptimizeWorkflow(gameId: string, env: Env): Promise<void> {
	const token = env.GITHUB_TOKEN;
	const owner = env.GH_REPO_OWNER;
	const repo = env.GH_REPO_NAME;
	const branch = env.GH_BRANCH || 'main';

	if (!token || !owner || !repo) {
		console.warn('GitHub not configured, skipping workflow trigger');
		return;
	}

	const apiBase = 'https://api.github.com';

	const res = await fetch(
		`${apiBase}/repos/${owner}/${repo}/actions/workflows/optimize-covers.yml/dispatches`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json',
				'Content-Type': 'application/json',
				'User-Agent': 'gaming-tracker-cloudflare'
			},
			body: JSON.stringify({
				ref: branch,
				inputs: {
					game_id: gameId
				}
			})
		}
	);

	if (!res.ok) {
		const errorBody = await res.text().catch(() => 'no body');
		console.error(`Failed to trigger workflow: ${res.status} - ${errorBody}`);
		// Don't throw - we don't want to fail the upload if workflow trigger fails
	}
}

// POST /api/games - Push changes to GitHub
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
	try {
		const secret = env.SESSION_SECRET;
		if (!secret) {
			console.error(
				JSON.stringify({
					event: 'config_error',
					target: 'games_write',
					reason: 'missing_session_secret'
				})
			);
			return new Response(JSON.stringify({ error: 'Session not configured' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const cookieHeader = request.headers.get('cookie');
		if (!(await verifySession(cookieHeader, secret))) {
			console.warn(
				JSON.stringify({
					event: 'auth_failed',
					target: 'games_write',
					reason: 'invalid_session'
				})
			);
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const contentType = request.headers.get('content-type') || '';
		let body: GamesPayload | null = null;

		if (contentType.includes('multipart/form-data')) {
			const formData = await request.formData();
			const gamesJson = formData.get('games') as string;

			if (!gamesJson) {
				return new Response(JSON.stringify({ error: 'Invalid payload: games JSON required' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}
			body = JSON.parse(gamesJson);

			// Handle multiple cover uploads
			for (const [key, value] of formData.entries()) {
				if (key.startsWith('cover_') && typeof value !== 'string') {
					const gameIdForCover = key.substring(6); // remove "cover_"
					const coverFile = value as File;
					if (gameIdForCover && coverFile) {
						const sanitizedGameId = gameIdForCover.replace(/[^a-z0-9-]/gi, '-').toLowerCase();
						const imageData = new Uint8Array(await coverFile.arrayBuffer());

						// Commit PNG to covers_raw
						await commitFileToGitHub(
							`static/covers_raw/${sanitizedGameId}.png`,
							imageData,
							`chore(covers): add cover image for ${sanitizedGameId}`,
							env
						);

						// Trigger the optimize-covers workflow via GitHub API
						await triggerOptimizeWorkflow(sanitizedGameId, env);
					}
				}
			}
		} else if (contentType.includes('application/json')) {
			body = (await request.json().catch(() => null)) as GamesPayload | null;
		} else {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'games_write',
					reason: 'invalid_content_type',
					contentType
				})
			);
			return new Response(
				JSON.stringify({ error: 'Expected application/json or multipart/form-data' }),
				{
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				}
			);
		}

		if (!body || !Array.isArray(body.games)) {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'games_write',
					reason: 'missing_or_invalid_games_array'
				})
			);
			return new Response(JSON.stringify({ error: 'Invalid games payload' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const parsed = GamesPayloadSchema.safeParse(body);
		if (!parsed.success) {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'games_write',
					issues: parsed.error.issues
				})
			);
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

		const normalizedGames = parsed.data.games.map((g) => {
			// Clone to avoid mutating original
			const game = { ...g };

			// Compute score for completed games
			if (game.status === 'Completed') {
				if (
					game.ratingPresentation != null &&
					game.ratingStory != null &&
					game.ratingGameplay != null
				) {
					game.score = computeScore({
						ratingPresentation: game.ratingPresentation,
						ratingStory: game.ratingStory,
						ratingGameplay: game.ratingGameplay
					});
				}
			}

			// Convert finishedDate from ISO to DD/MM/YYYY for storage
			if (game.finishedDate && typeof game.finishedDate === 'string') {
				try {
					const d = new Date(game.finishedDate);
					if (!isNaN(d.getTime())) {
						const day = String(d.getUTCDate()).padStart(2, '0');
						const month = String(d.getUTCMonth() + 1).padStart(2, '0');
						const year = d.getUTCFullYear();
						game.finishedDate = `${day}/${month}/${year}`;
					}
				} catch {
					// Keep original if parsing fails
				}
			}

			// Remove computed fields that shouldn't be persisted
			delete (game as Record<string, unknown>).mainTitle;
			delete (game as Record<string, unknown>).subtitle;

			if (game.sortPriority === null || game.sortPriority === undefined) {
				delete game.sortPriority;
			}

			return game;
		});

		const nextData: GamesPayload = {
			games: normalizedGames,
			meta: {
				...parsed.data.meta,
				lastUpdated: new Date().toISOString()
			}
		};

		// Push to GitHub - this will trigger Cloudflare Pages redeploy
		await syncGamesToGitHub(nextData, env);

		return new Response(JSON.stringify({ ok: true, meta: nextData.meta }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		console.error(
			JSON.stringify({
				event: 'games_write_error',
				message: errorMessage
			})
		);
		return new Response(
			JSON.stringify({
				error: 'Failed to update games',
				details: errorMessage
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

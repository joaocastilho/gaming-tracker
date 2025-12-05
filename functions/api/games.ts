import type { z } from 'zod';

import { computeScore, GamesPayloadSchema } from '../../src/lib/validation/game';
import { checkRateLimit } from '../utils/rateLimit';

type KV = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
};

type Env = {
	GAMES_KV: KV;
	SESSION_SECRET?: string;
	GITHUB_TOKEN?: string;
	GH_REPO_OWNER?: string;
	GH_REPO_NAME?: string;
	GH_FILE_PATH?: string;
	GH_BRANCH?: string;
	ENABLE_RATE_LIMITING?: string;
};

type GamesPayload = z.infer<typeof GamesPayloadSchema>;

/**
 * Load games from KV if available, otherwise fall back to static JSON.
 * This makes /api/games work both:
 * - in Cloudflare Pages (with KV)
 * - and in plain Vite dev (bun run dev) where KV is absent but static files exist.
 */
async function loadGames(env: Env): Promise<GamesPayload | null> {
	if (env.GAMES_KV) {
		const stored = await env.GAMES_KV.get('games');
		if (stored) {
			try {
				return JSON.parse(stored) as GamesPayload;
			} catch {
				// If KV is corrupted, fall through to static
			}
		}
	}

	try {
		const res = await fetch('https://dummy.local/games.json');
		if (res.ok) {
			const data = (await res.json()) as unknown;
			const parsed = GamesPayloadSchema.safeParse(data);
			if (parsed.success) return parsed.data;
		}
	} catch {
		// Ignore; final result checked by caller
	}

	return null;
}

async function syncGamesToGitHub(data: GamesPayload, env: Env): Promise<void> {
	const token = env.GITHUB_TOKEN;
	const owner = env.GH_REPO_OWNER;
	const repo = env.GH_REPO_NAME;
	const path = env.GH_FILE_PATH;
	const branch = env.GH_BRANCH || 'main';

	if (!token || !owner || !repo || !path) {
		throw new Error('GitHub sync not configured');
	}

	const apiBase = 'https://api.github.com';

	const getRes = await fetch(
		`${apiBase}/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(
			branch
		)}`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github+json'
			}
		}
	);

	if (!getRes.ok) {
		throw new Error(`GitHub get contents failed: ${getRes.status}`);
	}

	const fileJson = (await getRes.json()) as { sha: string; content: string };
	const currentContent = Buffer.from(fileJson.content, 'base64').toString('utf-8');

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
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				message: 'chore(data): update games.json via cloudflare editor',
				content: Buffer.from(nextContent, 'utf-8').toString('base64'),
				sha: fileJson.sha,
				branch
			})
		}
	);

	if (!putRes.ok) {
		throw new Error(`GitHub update failed: ${putRes.status}`);
	}
}

// GET /api/games
export const onRequestGet = async ({ env }: { env: Env }) => {
	const data = await loadGames(env);

	if (!data) {
		return new Response(JSON.stringify({ error: 'No games data available' }), {
			status: 500,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache'
			}
		});
	}

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		}
	});
};

// POST /api/games (unchanged core logic, still requires valid session and KV/GitHub config)
export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
	try {
		if (env.ENABLE_RATE_LIMITING === 'true') {
			const ip =
				request.headers.get('cf-connecting-ip') ||
				request.headers.get('x-forwarded-for') ||
				'unknown';
			const rl = await checkRateLimit(env.GAMES_KV, ip, {
				windowMs: 60_000,
				max: 30,
				prefix: 'rl:games'
			});
			if (!rl.allowed) {
				console.log(
					JSON.stringify({
						event: 'rate_limit_denied',
						target: 'games_write',
						ip,
						remaining: rl.remaining
					})
				);
				return new Response(JSON.stringify({ error: 'Too many requests' }), {
					status: 429,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

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
		if (!contentType.includes('application/json')) {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'games_write',
					reason: 'invalid_content_type',
					contentType
				})
			);
			return new Response(JSON.stringify({ error: 'Expected application/json body' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const body = (await request.json().catch(() => null)) as GamesPayload | null;
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
			if (g.status === 'Completed') {
				if (g.ratingPresentation != null && g.ratingStory != null && g.ratingGameplay != null) {
					const score = computeScore({
						ratingPresentation: g.ratingPresentation,
						ratingStory: g.ratingStory,
						ratingGameplay: g.ratingGameplay
					});
					return { ...g, score };
				}
			}
			return g;
		});

		const nextData: GamesPayload = {
			games: normalizedGames,
			meta: {
				...(parsed.data.meta || {}),
				lastUpdated: new Date().toISOString()
			}
		};

		await syncGamesToGitHub(nextData, env);
		await env.GAMES_KV.put('games', JSON.stringify(nextData));
		console.log(
			JSON.stringify({
				event: 'games_write_success',
				count: nextData.games.length,
				meta: nextData.meta
			})
		);

		return new Response(JSON.stringify({ ok: true, meta: nextData.meta }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		console.error(
			JSON.stringify({
				event: 'games_write_error',
				message: error instanceof Error ? error.message : String(error)
			})
		);
		return new Response(
			JSON.stringify({
				error: 'Failed to update games'
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

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

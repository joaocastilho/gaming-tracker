// Minimal Env type for Cloudflare Pages Functions.
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
};

type Game = {
	id: string;
	title: string;
	platform: string;
	year: number;
	genre: string;
	coOp: string;
	status: 'Planned' | 'Completed';
	coverImage: string;
	timeToBeat: string;
	hoursPlayed: string | null;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | null;
};

type GamesPayload = {
	games: Game[];
	meta?: {
		lastUpdated?: string;
		[key: string]: unknown;
	};
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

async function loadGamesFromKV(env: Env): Promise<GamesPayload | null> {
	const stored = await env.GAMES_KV.get('games');
	if (!stored) return null;

	try {
		return JSON.parse(stored) as GamesPayload;
	} catch {
		return null;
	}
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

export const onRequestGet = async ({ env }: { env: Env }) => {
	const data = await loadGamesFromKV(env);
	if (!data) {
		return new Response(
			JSON.stringify({ error: 'No games data in KV; client should fall back to static file' }),
			{
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}

	return new Response(JSON.stringify(data), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
	try {
		const secret = env.SESSION_SECRET;
		if (!secret) {
			return new Response(JSON.stringify({ error: 'Session not configured' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const cookieHeader = request.headers.get('cookie');
		if (!(await verifySession(cookieHeader, secret))) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return new Response(JSON.stringify({ error: 'Expected application/json body' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const body = (await request.json().catch(() => null)) as GamesPayload | null;
		if (!body || !Array.isArray(body.games)) {
			return new Response(JSON.stringify({ error: 'Invalid games payload' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		// Minimal structural validation; full Zod validation can be added later.
		for (const g of body.games) {
			if (!g || typeof g.id !== 'string' || typeof g.title !== 'string') {
				return new Response(JSON.stringify({ error: 'Invalid game entry in payload' }), {
					status: 400,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}

		const nextData: GamesPayload = {
			games: body.games,
			meta: {
				...(body.meta || {}),
				lastUpdated: new Date().toISOString()
			}
		};

		// All-or-nothing: first sync GitHub; only on success write KV.
		await syncGamesToGitHub(nextData, env);
		await env.GAMES_KV.put('games', JSON.stringify(nextData));

		return new Response(JSON.stringify({ ok: true, meta: nextData.meta }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(
			JSON.stringify({
				error: 'Failed to update games',
				details: error instanceof Error ? error.message : String(error)
			}),
			{
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			}
		);
	}
};

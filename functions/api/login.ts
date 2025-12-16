import { checkRateLimit } from '../utils/rateLimit';

type Env = {
	EDITOR_USERNAME?: string;
	EDITOR_PASSWORD?: string;
	SESSION_SECRET?: string;
	GAMES_KV?: {
		get(key: string): Promise<string | null>;
		put(key: string, value: string): Promise<void>;
	};
	ENABLE_RATE_LIMITING?: string;
};

async function hmacSign(payload: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
	const bytes = new Uint8Array(signature);

	let base64 = '';
	for (let i = 0; i < bytes.length; i++) {
		base64 += String.fromCharCode(bytes[i]);
	}

	// URL-safe base64
	return btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
	try {
		if (env.ENABLE_RATE_LIMITING === 'true' && env.GAMES_KV) {
			const ip =
				request.headers.get('cf-connecting-ip') ||
				request.headers.get('x-forwarded-for') ||
				'unknown';

			const rl = await checkRateLimit(env.GAMES_KV, ip, {
				windowMs: 60_000,
				max: 20,
				prefix: 'rl:login'
			});

			if (!rl.allowed) {
				return new Response(JSON.stringify({ error: 'Too many requests' }), {
					status: 429,
					headers: { 'Content-Type': 'application/json' }
				});
			}
		}
		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'login',
					reason: 'invalid_content_type',
					contentType
				})
			);
			return new Response(JSON.stringify({ error: 'Expected application/json body' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const body = await request.json().catch(() => null);
		if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
			console.warn(
				JSON.stringify({
					event: 'validation_failed',
					target: 'login',
					reason: 'invalid_credentials_payload'
				})
			);
			return new Response(JSON.stringify({ error: 'Invalid credentials payload' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const username = env.EDITOR_USERNAME;
		const password = env.EDITOR_PASSWORD;
		const sessionSecret = env.SESSION_SECRET;

		if (!username || !password || !sessionSecret) {
			console.error(
				JSON.stringify({
					event: 'config_error',
					target: 'login',
					reason: 'missing_env'
				})
			);
			return new Response(JSON.stringify({ error: 'Login not configured' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (body.username !== username || body.password !== password) {
			console.warn(
				JSON.stringify({
					event: 'auth_failed',
					target: 'login',
					reason: 'invalid_credentials'
				})
			);
			return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const expiresAt = Date.now() + 12 * 60 * 60 * 1000; // 12h
		const payload = String(expiresAt);
		const signature = await hmacSign(payload, sessionSecret);
		const token = `${expiresAt}.${signature}`;

		const headers = new Headers();
		headers.set('Content-Type', 'application/json');
		headers.append(
			'Set-Cookie',
			`gt_session=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${12 * 60 * 60}`
		);

		return new Response(JSON.stringify({ ok: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error(
			JSON.stringify({
				event: 'login_error',
				message: error instanceof Error ? error.message : String(error)
			})
		);
		return new Response(JSON.stringify({ error: 'Unexpected error' }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
};

export const onRequestGet = async () => {
	return new Response(JSON.stringify({ error: 'Method not allowed' }), {
		status: 405,
		headers: { 'Content-Type': 'application/json' }
	});
};

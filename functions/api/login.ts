type Env = {
	EDITOR_USERNAME?: string;
	EDITOR_PASSWORD?: string;
	SESSION_SECRET?: string;
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
		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('application/json')) {
			return new Response(JSON.stringify({ error: 'Expected application/json body' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const body = await request.json().catch(() => null);
		if (!body || typeof body.username !== 'string' || typeof body.password !== 'string') {
			return new Response(JSON.stringify({ error: 'Invalid credentials payload' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		const username = env.EDITOR_USERNAME;
		const password = env.EDITOR_PASSWORD;
		const sessionSecret = env.SESSION_SECRET;

		if (!username || !password || !sessionSecret) {
			return new Response(JSON.stringify({ error: 'Login not configured' }), {
				status: 500,
				headers: { 'Content-Type': 'application/json' }
			});
		}

		if (body.username !== username || body.password !== password) {
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
	} catch {
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

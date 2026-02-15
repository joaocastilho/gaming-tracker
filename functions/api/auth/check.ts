type Env = {
	SESSION_SECRET?: string;
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

	// Timing-safe comparison: decode both base64 strings to bytes and compare
	if (sig.length !== expected.length) return false;
	const encoder2 = new TextEncoder();
	const sigBytes = encoder2.encode(sig);
	const expectedBytes = encoder2.encode(expected);
	let diff = 0;
	for (let i = 0; i < sigBytes.length; i++) {
		diff |= sigBytes[i] ^ expectedBytes[i];
	}
	return diff === 0;
}

// GET /api/auth/check - Lightweight session validation
export const onRequestGet = async ({ request, env }: { request: Request; env: Env }) => {
	const secret = env.SESSION_SECRET;
	if (!secret) {
		return new Response(JSON.stringify({ valid: false }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const cookieHeader = request.headers.get('cookie');
	const valid = await verifySession(cookieHeader, secret);

	return new Response(JSON.stringify({ valid }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
};

import { describe, expect, it } from 'vitest';
import { onRequestGet as checkSession } from '../functions/api/auth/check.js';
import { onRequestPost as logout } from '../functions/api/auth/logout.js';

async function signSessionToken(expiresAt: number, secret: string): Promise<string> {
	const expiresRaw = String(expiresAt);
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
	]);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(expiresRaw));
	const bytes = new Uint8Array(signature);
	let base64 = '';
	for (let i = 0; i < bytes.length; i++) {
		base64 += String.fromCharCode(bytes[i]);
	}
	const sig = btoa(base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
	return `${expiresRaw}.${sig}`;
}

describe('Auth endpoints (/api/auth/check & /api/auth/logout)', () => {
	const secret = 'test-session-secret-123';

	it('returns valid: true for a valid unexpired HMAC session cookie', async () => {
		const token = await signSessionToken(Date.now() + 60_000, secret);
		const res = await checkSession({
			request: new Request('https://example.com/api/auth/check', {
				headers: { cookie: `other=1; gt_session=${token}` },
			}),
			env: { SESSION_SECRET: secret },
		});

		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ valid: true });
	});

	it('returns valid: false for expired, tampered, missing, or unconfigured sessions', async () => {
		const expired = await signSessionToken(Date.now() - 10_000, secret);
		const expiredRes = await checkSession({
			request: new Request('https://example.com/api/auth/check', {
				headers: { cookie: `gt_session=${expired}` },
			}),
			env: { SESSION_SECRET: secret },
		});
		expect(await expiredRes.json()).toEqual({ valid: false });

		const tampered = `${await signSessionToken(Date.now() + 60_000, secret)}x`;
		const tamperedRes = await checkSession({
			request: new Request('https://example.com/api/auth/check', {
				headers: { cookie: `gt_session=${tampered}` },
			}),
			env: { SESSION_SECRET: secret },
		});
		expect(await tamperedRes.json()).toEqual({ valid: false });

		const noSecretRes = await checkSession({
			request: new Request('https://example.com/api/auth/check'),
			env: {},
		});
		expect(await noSecretRes.json()).toEqual({ valid: false });
	});

	it('clears the gt_session cookie on logout', async () => {
		const res = await logout();
		expect(res.status).toBe(200);
		expect(await res.json()).toEqual({ ok: true });
		const setCookie = res.headers.get('set-cookie') ?? '';
		expect(setCookie).toContain('gt_session=;');
		expect(setCookie).toContain('HttpOnly');
		expect(setCookie).toContain('Max-Age=0');
	});
});

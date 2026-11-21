import { describe, expect, it, vi } from 'vitest';
import { onRequest } from '../functions/_middleware.js';

function createHtmlResponse(body: string): Response {
	return new Response(body, {
		status: 200,
		headers: { 'content-type': 'text/html; charset=utf-8' },
	});
}

describe('Cloudflare Pages OG middleware', () => {
	it('passes through non-GET and non-HTML responses untouched', async () => {
		const postNext = vi.fn().mockResolvedValue(new Response('ok'));
		const postRes = await onRequest({
			request: new Request('https://example.com/?game=hades', { method: 'POST' }),
			env: { ASSETS: { fetch: vi.fn() } },
			next: postNext,
		});
		expect(await postRes.text()).toBe('ok');

		const jsonNext = vi
			.fn()
			.mockResolvedValue(new Response('{"ok":true}', { headers: { 'content-type': 'application/json' } }));
		const jsonRes = await onRequest({
			request: new Request('https://example.com/games.json?game=hades'),
			env: { ASSETS: { fetch: vi.fn() } },
			next: jsonNext,
		});
		expect(await jsonRes.text()).toBe('{"ok":true}');
	});

	it('injects escaped per-game OG and Twitter meta tags and strips default tags', async () => {
		const baseHtml =
			'<!doctype html><html><head><meta property="og:title" content="Default" /><meta name="twitter:title" content="Default" /></head><body></body></html>';
		const gamesJson = {
			games: [
				{
					title: 'Baldur\'s Gate 3 & "DLC"',
					status: 'Completed',
					ratingPresentation: 10,
					ratingStory: 10,
					ratingGameplay: 10,
					score: 20,
					tier: 'S - Masterpiece',
					coverImage: 'covers/bg3.webp',
				},
			],
		};

		const res = await onRequest({
			request: new Request('https://example.com/library?game=baldur-s-gate-3-dlc'),
			env: {
				ASSETS: {
					fetch: vi.fn().mockResolvedValue(new Response(JSON.stringify(gamesJson), { status: 200 })),
				},
			},
			next: vi.fn().mockResolvedValue(createHtmlResponse(baseHtml)),
		});

		const html = await res.text();
		expect(html).not.toContain('content="Default"');
		expect(html).toContain('property="og:title" content="Gaming Tracker - Baldur&#039;s Gate 3 &amp; &quot;DLC&quot;"');
		expect(html).toContain('property="og:image" content="https://example.com/covers/bg3.webp"');
		expect(html).toContain('name="twitter:card" content="summary_large_image"');
		expect(html).toContain('S - Masterpiece');
	});

	it('leaves HTML unchanged when game slug does not match', async () => {
		const baseHtml = '<html><head><meta property="og:title" content="Default" /></head><body></body></html>';
		const res = await onRequest({
			request: new Request('https://example.com/?game=nonexistent-game'),
			env: {
				ASSETS: {
					fetch: vi.fn().mockResolvedValue(new Response(JSON.stringify({ games: [] }), { status: 200 })),
				},
			},
			next: vi.fn().mockResolvedValue(createHtmlResponse(baseHtml)),
		});

		const html = await res.text();
		expect(html).toContain('content="Default"');
	});
});

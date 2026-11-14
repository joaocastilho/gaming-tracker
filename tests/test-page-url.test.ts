import { describe, expect, test } from 'vitest';
import { liveSearchParams } from '#lib/utils/pageUrl.js';

const origin = 'https://example.com';

describe('liveSearchParams', () => {
	test('falls back to page.url before any shallow navigation', () => {
		const page = { url: new URL('/library?game=inmost', origin), shallow: null };
		expect(liveSearchParams(page).get('game')).toBe('inmost');
	});

	test('prefers the shallow target once one has happened', () => {
		const page = {
			url: new URL('/library?game=inmost', origin),
			shallow: { url: new URL('/library', origin) },
		};
		expect(liveSearchParams(page).get('game')).toBeNull();
	});

	test('tracks a newly opened game', () => {
		const page = {
			url: new URL('/library', origin),
			shallow: { url: new URL('/library?game=ace-combat-04', origin) },
		};
		expect(liveSearchParams(page).get('game')).toBe('ace-combat-04');
	});
});

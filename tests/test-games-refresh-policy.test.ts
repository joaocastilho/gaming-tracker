import { describe, expect, test } from 'vitest';
import { decideGamesRefresh, readPayloadLastUpdated } from '#lib/utils/gamesRefreshPolicy.js';

describe('decideGamesRefresh', () => {
	test('applies when there is no cached marker yet (first visit)', () => {
		const payload = { games: [{ id: '1' }], meta: { lastUpdated: '2026-10-10T09:07:23.290Z' } };

		expect(decideGamesRefresh(payload, null)).toBe('apply');
	});

	test('skips when the payload marker matches the cached marker', () => {
		const payload = { games: [{ id: '1' }], meta: { lastUpdated: '2026-10-10T09:07:23.290Z' } };

		expect(decideGamesRefresh(payload, '2026-10-10T09:07:23.290Z')).toBe('skip');
	});

	test('applies when the payload marker is newer than the cached marker', () => {
		const payload = { games: [{ id: '1' }], meta: { lastUpdated: '2026-10-11T10:00:00.000Z' } };

		expect(decideGamesRefresh(payload, '2026-10-10T09:07:23.290Z')).toBe('apply');
	});

	test('applies when the payload has no marker to compare', () => {
		const payload = { games: [{ id: '1' }] };

		expect(decideGamesRefresh(payload, '2026-10-10T09:07:23.290Z')).toBe('apply');
		expect(decideGamesRefresh({ games: [{ id: '1' }], meta: {} }, null)).toBe('apply');
	});

	test('ignores payloads without a usable games array', () => {
		expect(decideGamesRefresh({ games: [] }, null)).toBe('ignore');
		expect(decideGamesRefresh({ games: [] }, '2026-10-10T09:07:23.290Z')).toBe('ignore');
		expect(decideGamesRefresh(null, null)).toBe('ignore');
		expect(decideGamesRefresh('nope', null)).toBe('ignore');
		expect(decideGamesRefresh({}, null)).toBe('ignore');
	});
});

describe('readPayloadLastUpdated', () => {
	test('returns the marker when present', () => {
		expect(readPayloadLastUpdated({ meta: { lastUpdated: '2026-10-10T09:07:23.290Z' } })).toBe(
			'2026-10-10T09:07:23.290Z'
		);
	});

	test('returns null when absent or malformed', () => {
		expect(readPayloadLastUpdated({ meta: {} })).toBeNull();
		expect(readPayloadLastUpdated({})).toBeNull();
		expect(readPayloadLastUpdated(null)).toBeNull();
		expect(readPayloadLastUpdated({ meta: { lastUpdated: 42 } })).toBeNull();
	});
});

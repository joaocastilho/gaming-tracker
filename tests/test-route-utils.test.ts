import { describe, expect, test } from 'vitest';
import { isGamesRoute, routeKeyFromPath } from '#lib/utils/routeUtils.js';

describe('routeKeyFromPath', () => {
	test.each([
		['/', 'home'],
		['/library', 'all'],
		['/completed', 'completed'],
		['/planned', 'planned'],
		['/tierlist', 'tierlist'],
		['/stats', 'stats'],
	] as const)('maps %s to %s', (pathname, expected) => {
		expect(routeKeyFromPath(pathname)).toBe(expected);
	});

	test.each(['/login', '/does-not-exist', '/api/games'])('gives known non-grid route %s its own key', (pathname) => {
		expect(routeKeyFromPath(pathname)).toBe('other');
	});

	test('treats only the three collection routes as games pages', () => {
		expect(isGamesRoute('all')).toBe(true);
		expect(isGamesRoute('completed')).toBe(true);
		expect(isGamesRoute('planned')).toBe(true);

		expect(isGamesRoute('home')).toBe(false);
		expect(isGamesRoute('stats')).toBe(false);
		expect(isGamesRoute('tierlist')).toBe(false);
		expect(isGamesRoute('other')).toBe(false);
	});
});

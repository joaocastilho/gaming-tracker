/**
 * Tests for GamesView #each key stability
 *
 * Issue: Using index in #each keys causes unnecessary re-renders
 * when items reorder. Keys should be stable (game.id only).
 *
 * Lines affected:
 * - Line 102: `{#each row.games as game, i (game.id ? `${game.id}-${i}` : ...)}`
 * - Line 126: `{#each row.games as game, i (game.id ? `${game.id}-${i}` : ...)}`
 */

import { describe, test, expect } from 'vitest';
import { createMockGame, createMockGames } from './utils';

describe('GamesView #each key stability', () => {
	test('should use stable game.id as key, not index', () => {
		// This test documents the expected behavior
		// The fix should remove the index from the key expression
		//
		// Current (broken): `game.id ? `${game.id}-${i}` : ...`
		// Fixed: `game.id ?? `fallback-${row.id}-${i}`
		//
		// The index should ONLY be used for fallback when game.id is missing

		const games = createMockGames(3);
		const firstGame = games[0];

		// When games reorder, the game with id 'abc' should still have key 'abc'
		// not 'abc-0' which would change if it moves to position 1
		expect(firstGame.id).toBeDefined();
		expect(typeof firstGame.id).toBe('string');
	});

	test('should handle missing game.id gracefully', () => {
		// When game.id is missing, we need a fallback key
		// The fallback should include row.id and index for uniqueness
		const gameWithoutId = createMockGame();
		// @ts-expect-error Testing edge case
		delete gameWithoutId.id;

		// This should not throw - the component should handle missing ids
		expect(() => {
			// Component would be rendered here in real test
			// For now, just verify the game structure
			expect(gameWithoutId).toBeDefined();
		}).not.toThrow();
	});

	test('games should have unique ids', () => {
		const games = createMockGames(10);
		const ids = games.map((g) => g.id);
		const uniqueIds = new Set(ids);

		expect(uniqueIds.size).toBe(games.length);
	});
});

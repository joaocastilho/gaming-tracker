import { describe, expect, it } from 'vitest';
import { getContinuumNeighbors, getContinuumPreviewCount } from '#lib/components/detail-modal/continuumNeighbors.js';
import { createTestGame } from './helpers/factories';

const games = Array.from({ length: 6 }, (_, index) =>
	createTestGame({ id: String(index + 1), title: `Game ${index + 1}` })
);

function titles(list: { title: string }[]): string[] {
	return list.map((game) => game.title);
}

describe('getContinuumPreviewCount', () => {
	it.each([
		[1024, 0],
		[1279, 0],
		[1280, 1],
		[1919, 1],
		[1920, 2],
		[2560, 2],
	])('returns %i previews per side at %ipx', (width, expected) => {
		expect(getContinuumPreviewCount(width)).toBe(expected);
	});
});

describe('getContinuumNeighbors', () => {
	it('returns the immediately adjacent games nearest first', () => {
		const neighbors = getContinuumNeighbors(games, 2, 2);

		expect(titles(neighbors.previous)).toEqual(['Game 2', 'Game 1']);
		expect(titles(neighbors.next)).toEqual(['Game 4', 'Game 5']);
	});

	it('stops at the ends instead of wrapping', () => {
		expect(getContinuumNeighbors(games, 0, 2).previous).toEqual([]);
		expect(titles(getContinuumNeighbors(games, 0, 2).next)).toEqual(['Game 2', 'Game 3']);

		expect(getContinuumNeighbors(games, games.length - 1, 2).next).toEqual([]);
		expect(titles(getContinuumNeighbors(games, games.length - 1, 2).previous)).toEqual(['Game 5', 'Game 4']);
	});

	it('returns nothing when there is no active game', () => {
		expect(getContinuumNeighbors(games, -1, 2)).toEqual({ previous: [], next: [] });
		expect(getContinuumNeighbors(games, games.length, 2)).toEqual({ previous: [], next: [] });
		expect(getContinuumNeighbors(games, 2, 0)).toEqual({ previous: [], next: [] });
	});
});

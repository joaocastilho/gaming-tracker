import { describe, expect, it } from 'bun:test';
import { filterGamesByTab } from './filtering';
import type { Game } from '$lib/types/game';

function makeGame(id: string, status: Game['status']): Game {
	return {
		id,
		title: `Game ${id}`,
		mainTitle: `Game ${id}`,
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'Action',
		coOp: 'No',
		status,
		coverImage: 'test.jpg',
		playtime: '0h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null,
	};
}

describe('filterGamesByTab', () => {
	it('should return only Completed games for completed tab', () => {
		const games = [
			makeGame('1', 'Completed'),
			makeGame('2', 'Playing'),
			makeGame('3', 'Planned'),
			makeGame('4', 'Completed'),
		];

		const result = filterGamesByTab(games, 'completed');
		expect(result).toHaveLength(2);
		expect(result.every((g) => g.status === 'Completed')).toBe(true);
	});

	it('should return Planned AND Playing games for planned tab', () => {
		const games = [
			makeGame('1', 'Completed'),
			makeGame('2', 'Playing'),
			makeGame('3', 'Planned'),
			makeGame('4', 'Playing'),
			makeGame('5', 'Completed'),
		];

		const result = filterGamesByTab(games, 'planned');
		expect(result).toHaveLength(3);
		expect(result.every((g) => g.status === 'Planned' || g.status === 'Playing')).toBe(true);
		expect(result.filter((g) => g.status === 'Playing')).toHaveLength(2);
		expect(result.filter((g) => g.status === 'Planned')).toHaveLength(1);
	});

	it('should return all games for all tab', () => {
		const games = [makeGame('1', 'Completed'), makeGame('2', 'Playing'), makeGame('3', 'Planned')];

		const result = filterGamesByTab(games, 'all');
		expect(result).toHaveLength(3);
	});

	it('should return empty array when no games match planned or playing', () => {
		const games = [makeGame('1', 'Completed'), makeGame('2', 'Completed')];

		const result = filterGamesByTab(games, 'planned');
		expect(result).toHaveLength(0);
	});
});

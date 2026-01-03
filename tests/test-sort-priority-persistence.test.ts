import { describe, expect, it } from 'vitest';

// We'll simulate the normalization logic from the API
function normalizeGame(g: any) {
	const game = { ...g };
	// Simulate the deletions that happen in the API
	delete (game as any).mainTitle;
	delete (game as any).subtitle;

	if (game.sortPriority === null || game.sortPriority === undefined) {
		delete game.sortPriority;
	}
	return game;
}

describe('sortPriority Transformation', () => {
	it('should strip sortPriority when it is null', () => {
		const gameWithNull = {
			id: 'test',
			title: 'Test',
			sortPriority: null
		};
		const normalized = normalizeGame(gameWithNull);
		expect(normalized).not.toHaveProperty('sortPriority');
	});

	it('should strip sortPriority when it is undefined', () => {
		const gameWithUndefined = {
			id: 'test',
			title: 'Test',
			sortPriority: undefined
		};
		const normalized = normalizeGame(gameWithUndefined);
		expect(normalized).not.toHaveProperty('sortPriority');
	});

	it('should keep sortPriority when it has a value', () => {
		const gameWithPriority = {
			id: 'test',
			title: 'Test',
			sortPriority: 5
		};
		const normalized = normalizeGame(gameWithPriority);
		expect(normalized).toHaveProperty('sortPriority', 5);
	});

	it('should keep sortPriority when it is 0', () => {
		const gameWithZero = {
			id: 'test',
			title: 'Test',
			sortPriority: 0
		};
		const normalized = normalizeGame(gameWithZero);
		expect(normalized).toHaveProperty('sortPriority', 0);
	});
});

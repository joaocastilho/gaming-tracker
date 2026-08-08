import { describe, expect, it } from 'vitest';
import { computeScore, formatRating, GameSchema, GamesPayloadSchema } from '$lib/validation/game';
import { createTestGame } from './helpers/factories';
import type { Game } from '$lib/types/game';

function createValidCompletedGame(overrides: Partial<Game> = {}): Game {
	return createTestGame({
		status: 'Completed',
		finishedDate: '2024-01-15T00:00:00.000Z',
		ratingPresentation: 9,
		ratingStory: 8,
		ratingGameplay: 10,
		score: 18,
		tier: 'S - Masterpiece',
		...overrides,
	});
}

describe('computeScore', () => {
	it('computes (P + S + G) / 3 * 2', () => {
		expect(computeScore({ ratingPresentation: 9, ratingStory: 8, ratingGameplay: 10 })).toBe(18);
	});

	it('returns 0 when all ratings are 0', () => {
		expect(computeScore({ ratingPresentation: 0, ratingStory: 0, ratingGameplay: 0 })).toBe(0);
	});

	it('returns 20 for perfect ratings', () => {
		expect(computeScore({ ratingPresentation: 10, ratingStory: 10, ratingGameplay: 10 })).toBe(20);
	});

	it('rounds the result', () => {
		expect(computeScore({ ratingPresentation: 8, ratingStory: 8, ratingGameplay: 9 })).toBe(17);
		expect(computeScore({ ratingPresentation: 7, ratingStory: 8, ratingGameplay: 9 })).toBe(16);
	});
});

describe('formatRating', () => {
	it('returns a dash for null/undefined', () => {
		expect(formatRating(null)).toBe('-');
		expect(formatRating(undefined)).toBe('-');
	});

	it('returns the rating as a string', () => {
		expect(formatRating(9)).toBe('9');
		expect(formatRating(0)).toBe('0');
	});
});

describe('GameSchema', () => {
	it('accepts a valid completed game', () => {
		const result = GameSchema.safeParse(createValidCompletedGame());
		expect(result.success).toBe(true);
	});

	it('accepts a valid planned game with null completion fields', () => {
		const result = GameSchema.safeParse(createTestGame({ status: 'Planned' }));
		expect(result.success).toBe(true);
	});

	it('rejects a planned game with a finishedDate set', () => {
		const game = createTestGame({
			status: 'Planned',
			finishedDate: '2024-01-15T00:00:00.000Z',
		});
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a planned game with ratings set', () => {
		const game = createTestGame({ status: 'Planned', ratingPresentation: 9 });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a planned game with a tier set', () => {
		const game = createTestGame({ status: 'Planned', tier: 'A - Amazing' });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a completed game without a finishedDate', () => {
		const game = createValidCompletedGame({ finishedDate: null });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a completed game without ratings', () => {
		const game = createValidCompletedGame({ ratingPresentation: null });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a completed game without a tier', () => {
		const game = createValidCompletedGame({ tier: null });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});

	it('rejects a completed game whose score does not match the computed value', () => {
		const game = createValidCompletedGame({ score: 10 });
		const result = GameSchema.safeParse(game);
		expect(result.success).toBe(false);
	});
});

describe('GamesPayloadSchema', () => {
	it('accepts a payload with games and ISO meta', () => {
		const result = GamesPayloadSchema.safeParse({
			games: [createValidCompletedGame()],
			meta: { lastUpdated: '2025-01-01T12:00:00.000Z' },
		});
		expect(result.success).toBe(true);
	});

	it('rejects a payload with an invalid game', () => {
		const result = GamesPayloadSchema.safeParse({
			games: [createTestGame({ status: 'Planned', ratingStory: 5 })],
		});
		expect(result.success).toBe(false);
	});
});

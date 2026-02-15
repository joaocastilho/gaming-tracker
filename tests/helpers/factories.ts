import type { Game, GameStatus, TierValue, CoOpStatus } from '$lib/types/game';

/**
 * Creates a fully-typed Game object with sensible defaults.
 * Override any field by passing partial overrides.
 */
export function createTestGame(overrides: Partial<Game> = {}): Game {
	const title = overrides.title ?? 'Test Game';
	return {
		id: crypto.randomUUID(),
		title,
		mainTitle: title.split(':')[0].trim(),
		subtitle: title.includes(':') ? title.split(':').slice(1).join(':').trim() : null,
		platform: 'PC',
		year: 2024,
		genre: 'Action',
		coOp: 'No' as CoOpStatus,
		status: 'Planned' as GameStatus,
		coverImage: 'covers/test.webp',
		playtime: '10h 0m',
		finishedDate: null,
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: null,
		...overrides
	};
}

/**
 * Creates a completed Game with ratings and tier set.
 */
export function createCompletedGame(overrides: Partial<Game> = {}): Game {
	return createTestGame({
		status: 'Completed' as GameStatus,
		finishedDate: '2024-01-15',
		ratingPresentation: 8,
		ratingStory: 7,
		ratingGameplay: 9,
		score: 8,
		tier: 'A - Amazing' as TierValue,
		...overrides
	});
}

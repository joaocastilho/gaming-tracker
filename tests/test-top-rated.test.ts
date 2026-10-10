import { describe, expect, test } from 'vitest';
import { computeTopRated } from '#lib/utils/statsAggregates.js';
import type { Game } from '#lib/types/game.js';

function game(id: string, overrides: Partial<Game>): Game {
	return {
		id,
		title: `Game ${id}`,
		mainTitle: `Game ${id}`,
		subtitle: null,
		platform: 'PC',
		year: 2024,
		genre: 'RPG',
		coOp: 'No',
		status: 'Completed',
		coverImage: `covers/${id}.webp`,
		playtime: '10h 0m',
		finishedDate: '2024-01-15T00:00:00.000Z',
		ratingPresentation: null,
		ratingStory: null,
		ratingGameplay: null,
		score: null,
		tier: 'B - Great',
		...overrides,
	};
}

// Reference implementation matching the previous per-category
// sort + slice + filter derivations exactly.
function referenceTopRated(games: Game[]) {
	const by = (key: 'ratingPresentation' | 'ratingStory' | 'ratingGameplay' | 'score') =>
		[...games]
			.toSorted((a, b) => (b[key] ?? 0) - (a[key] ?? 0))
			.slice(0, 10)
			.filter((g) => g[key] != null);
	return {
		presentation: by('ratingPresentation'),
		story: by('ratingStory'),
		gameplay: by('ratingGameplay'),
		score: by('score'),
	};
}

describe('computeTopRated', () => {
	test('returns top 10 per category sorted descending, nulls excluded', () => {
		const games = [
			game('1', { ratingPresentation: 9, score: 18 }),
			game('2', { ratingPresentation: 10, score: 19 }),
			game('3', { ratingPresentation: null, score: 12 }),
			game('4', { ratingPresentation: 7, score: null }),
		];

		const top = computeTopRated(games);

		expect(top.presentation.map((g) => g.id)).toEqual(['2', '1', '4']);
		expect(top.score.map((g) => g.id)).toEqual(['2', '1', '3']);
	});

	test('matches the reference sort/slice/filter semantics for ties, nulls, and overflow', () => {
		// 25 games: nulls interleaved, many ties, more than the 10 limit
		const games = Array.from({ length: 25 }, (_, i) =>
			game(String(i), {
				ratingPresentation: i % 4 === 0 ? null : i % 5,
				ratingStory: i % 3,
				ratingGameplay: i % 7 === 0 ? null : 10 - (i % 5),
				score: i % 2 === 0 ? null : (i % 6) * 3,
			})
		);

		expect(computeTopRated(games)).toEqual(referenceTopRated(games));
	});

	test('empty input yields empty categories', () => {
		expect(computeTopRated([])).toEqual({ presentation: [], story: [], gameplay: [], score: [] });
	});
});

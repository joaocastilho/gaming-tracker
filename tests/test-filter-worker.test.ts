import { describe, it, expect } from 'bun:test';
import { applySortOption } from '../src/lib/workers/filterWorker';
import type { Game } from '../src/lib/types/game';

const mockGames: Game[] = [
	{
		id: '1',
		title: 'Game A',
		score: 90,
		ratingPresentation: 5,
		ratingGameplay: 5,
		ratingStory: 5,
		finishedDate: '2023-01-01',
		status: 'Completed',
		coOp: 'No'
	} as Game,
	{
		id: '2',
		title: 'Game B',
		score: null,
		ratingPresentation: null,
		ratingGameplay: null,
		ratingStory: null,
		finishedDate: null,
		status: 'Planned',
		coOp: 'Yes'
	} as Game,
	{
		id: '3',
		title: 'Game C',
		score: 80,
		ratingPresentation: 4,
		ratingGameplay: 4,
		ratingStory: 4,
		finishedDate: '2023-02-01',
		status: 'Completed',
		coOp: 'Yes'
	} as Game,
	{
		id: '4',
		title: 'Game D',
		score: undefined,
		ratingPresentation: undefined,
		ratingGameplay: undefined,
		ratingStory: undefined,
		finishedDate: null,
		status: 'Planned',
		coOp: 'No'
	} as Game
];

describe('Filter Worker Sorting Logic', () => {
	it('should put games with data first when sorting by score ASC', () => {
		const sorted = applySortOption([...mockGames], { key: 'score', direction: 'asc' });
		// Expected order: Game C (80), Game A (90), then Game B/D (no data)
		expect(sorted[0].id).toBe('3');
		expect(sorted[1].id).toBe('1');
		expect(['2', '4']).toContain(sorted[2].id);
		expect(['2', '4']).toContain(sorted[3].id);
	});

	it('should put games with data first when sorting by score DESC', () => {
		const sorted = applySortOption([...mockGames], { key: 'score', direction: 'desc' });
		// Expected order: Game A (90), Game C (80), then Game B/D
		expect(sorted[0].id).toBe('1');
		expect(sorted[1].id).toBe('3');
		expect(['2', '4']).toContain(sorted[2].id);
		expect(['2', '4']).toContain(sorted[3].id);
	});

	it('should put games with data first when sorting by presentation ASC', () => {
		const sorted = applySortOption([...mockGames], { key: 'presentation', direction: 'asc' });
		// Expected order: Game C (4), Game A (5), then Game B/D
		expect(sorted[0].id).toBe('3');
		expect(sorted[1].id).toBe('1');
		expect(['2', '4']).toContain(sorted[2].id);
		expect(['2', '4']).toContain(sorted[3].id);
	});
});

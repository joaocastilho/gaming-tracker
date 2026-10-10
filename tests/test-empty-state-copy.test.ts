import { describe, expect, test } from 'vitest';
import { tabEmptyState } from '#lib/utils/emptyState.js';

describe('tabEmptyState', () => {
	test('gives each games tab its own empty-state copy', () => {
		expect(tabEmptyState('all')).toEqual({
			message: 'Your library is empty',
			description: 'Add your first game to see it here.',
		});
		expect(tabEmptyState('completed')).toEqual({
			message: 'No completed games yet',
			description: 'Mark a planned game as completed to fill this shelf.',
		});
		expect(tabEmptyState('planned')).toEqual({
			message: 'No planned games yet',
			description: 'Add a game to your backlog to see it here.',
		});
	});

	test('falls back to library copy for non-games tabs', () => {
		// currentPage only ever returns these on home/tierlist/stats routes,
		// where the empty state is never rendered — the copy is a safety net.
		expect(tabEmptyState('home')).toEqual(tabEmptyState('all'));
		expect(tabEmptyState('')).toEqual(tabEmptyState('all'));
	});
});

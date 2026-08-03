import { describe, expect, test } from 'vitest';
import { buildOgDescription } from '$lib/utils/ogDescription';

describe('buildOgDescription', () => {
	test('completed game returns two lines with ratings, score, and tier', () => {
		const desc = buildOgDescription({
			status: 'Completed',
			ratingPresentation: 8,
			ratingStory: 9,
			ratingGameplay: 7,
			score: 16,
			tier: 'A - Amazing',
		});

		const lines = desc.split('\n');
		expect(lines).toHaveLength(2);
		expect(lines[0]).toBe('Presentation: 8/10 · Story: 9/10 · Gameplay: 7/10');
		expect(lines[1]).toBe('Score: 16/20 · Tier: A - Amazing');
	});

	test('completed game without tier shows only score on second line', () => {
		const desc = buildOgDescription({
			status: 'Completed',
			ratingPresentation: 5,
			ratingStory: 6,
			ratingGameplay: 4,
			score: 10,
			tier: null,
		});

		expect(desc).toBe('Presentation: 5/10 · Story: 6/10 · Gameplay: 4/10\nScore: 10/20');
	});

	test('completed game with missing ratings uses dash placeholders', () => {
		const desc = buildOgDescription({
			status: 'Completed',
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null,
		});

		expect(desc).toBe('Presentation: -/10 · Story: -/10 · Gameplay: -/10\nScore: -/20');
	});

	test('planned game without tier returns empty string', () => {
		const desc = buildOgDescription({
			status: 'Planned',
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null,
		});

		expect(desc).toBe('');
	});

	test('playing game without tier returns empty string', () => {
		const desc = buildOgDescription({
			status: 'Playing',
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null,
		});

		expect(desc).toBe('');
	});

	test('non-completed game with tier shows tier-only second line', () => {
		const desc = buildOgDescription({
			status: 'Planned',
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: 'C - Good',
		});

		expect(desc).toBe('Tier: C - Good');
	});
});

import { describe, expect, it } from 'vitest';
import { createShareData } from '$lib/utils/share';

describe('createShareData', () => {
	it('keeps the current route and query string when sharing', () => {
		const data = createShareData('https://example.com/stats?genre=RPG&view=charts', 'Gaming Tracker - Stats');

		expect(data).toEqual({
			title: 'Gaming Tracker - Stats',
			url: 'https://example.com/stats?genre=RPG&view=charts',
		});
	});
});

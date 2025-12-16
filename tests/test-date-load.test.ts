import { describe, expect, it } from 'vitest';
import { transformGameData } from '$lib/utils/dataTransformer';

describe('Data Transformer - Date Loading', () => {
	it('should transform DD/MM/YYYY to ISO on load', () => {
		const input = {
			id: 'test-game',
			title: 'Test Game',
			finishedDate: '16/11/2025' // Format seen in games.json
		};

		const result = transformGameData(input);

		// Expecting YYYY-MM-DDTHH...
		// 16/11/2025 -> 2025-11-16
		expect(result.finishedDate).toMatch(/^2025-11-16T\d{2}:\d{2}:\d{2}/);
	});

	it('should handle already ISO dates', () => {
		const input = {
			id: 'test-game-iso',
			title: 'Test ISO',
			finishedDate: '2023-06-18T00:00:00.000Z'
		};
		const result = transformGameData(input);
		expect(result.finishedDate).toBe('2023-06-18T00:00:00.000Z');
	});
});

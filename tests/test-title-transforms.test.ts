import { describe, test, expect } from 'bun:test';
import { transformGameData } from '$lib/utils/dataTransformer';

describe('Title Transforms & Data Normalization', () => {
	test('Title Parsing', () => {
		const gameWithSubtitle = { title: 'The Legend of Zelda: Breath of the Wild (Switch)' };
		const transformed1 = transformGameData(gameWithSubtitle);
		expect(transformed1.mainTitle).toBe('The Legend of Zelda: Breath of the Wild');
		expect(transformed1.subtitle).toBe('(Switch)');

		const gameSimple = { title: 'God of War' };
		const transformed2 = transformGameData(gameSimple);
		expect(transformed2.mainTitle).toBe('God of War');
		expect(transformed2.subtitle).toBeNull();
	});

	test('Date Formatting', () => {
		const gameWithDate = { finishedDate: '15/01/2024' };
		const transformed3 = transformGameData(gameWithDate);
		expect(transformed3.finishedDate).toBe('2024-01-15T00:00:00.000Z');

		const gameWithISODate = { finishedDate: '2024-02-20T00:00:00.000Z' };
		const transformed4 = transformGameData(gameWithISODate);
		expect(transformed4.finishedDate).toBe('2024-02-20T00:00:00.000Z');
	});

	test('Hours Played Formatting', () => {
		const gameWithDecimalHours = { hoursPlayed: 10.5 };
		const transformed5 = transformGameData(gameWithDecimalHours);
		expect(transformed5.hoursPlayed).toBe('10h 30m');

		const gameWithStringHours = { hoursPlayed: '20h 15m' };
		const transformed6 = transformGameData(gameWithStringHours);
		expect(transformed6.hoursPlayed).toBe('20h 15m');
	});

	test('UUID Generation', () => {
		const gameNoId = { title: 'Unique Game Title' };
		const transformed7 = transformGameData(gameNoId);
		expect(transformed7.id).toBeDefined();

		const transformed8 = transformGameData(gameNoId);
		expect(transformed7.id).toBe(transformed8.id);

		const gameWithId = { id: 'existing-id', title: 'Another Game' };
		const transformed9 = transformGameData(gameWithId);
		// 'existing-id' is NOT a valid UUID, so it SHOULD be replaced.
		expect(transformed9.id).not.toBe('existing-id');
	});

	test('Co-op Defaults', () => {
		const gameNoCoop = { title: 'Solo Game' };
		const transformed10 = transformGameData(gameNoCoop);
		expect(transformed10.coOp).toBe('No');

		const gameWithCoop = { title: 'Coop Game', coOp: 'Yes' };
		const transformed11 = transformGameData(gameWithCoop);
		expect(transformed11.coOp).toBe('Yes');
	});
});

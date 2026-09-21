import { describe, expect, it } from 'vitest';
import type { Game } from '$lib/types/game';
import { computeBacklogStats } from '$lib/utils/backlogUtils';
import { createTestGame } from './helpers/factories';

describe('Backlog Utils', () => {
	it('returns zeros for empty library', () => {
		const stats = computeBacklogStats([]);
		expect(stats.completed.count).toBe(0);
		expect(stats.playing.count).toBe(0);
		expect(stats.planned.count).toBe(0);
		expect(stats.total.count).toBe(0);
		expect(stats.backlog.count).toBe(0);
		expect(stats.completed.minutes).toBe(0);
		expect(stats.completed.pctHours).toBe(0);
		expect(stats.completed.pctCount).toBe(0);
		expect(stats.total.minutes).toBe(0);
	});

	it('computes counts and minutes per status', () => {
		const games: Game[] = [
			createTestGame({ status: 'Completed', playtime: '10h 0m' }),
			createTestGame({ status: 'Completed', playtime: '5h 30m' }),
			createTestGame({ status: 'Playing', playtime: '2h 0m' }),
			createTestGame({ status: 'Planned', playtime: '20h 0m' }),
			createTestGame({ status: 'Planned', playtime: '0h 45m' }),
		];
		const stats = computeBacklogStats(games);

		expect(stats.completed.count).toBe(2);
		expect(stats.playing.count).toBe(1);
		expect(stats.planned.count).toBe(2);
		expect(stats.total.count).toBe(5);
		expect(stats.backlog.count).toBe(3);

		// 10h = 600, 5h30m=330 => 930
		expect(stats.completed.minutes).toBe(930);
		// 2h =120
		expect(stats.playing.minutes).toBe(120);
		// 20h=1200 +45=1245
		expect(stats.planned.minutes).toBe(1245);
		// total 2295
		expect(stats.total.minutes).toBe(2295);
		expect(stats.backlog.minutes).toBe(1365);
	});

	it('computes pctHours and pctCount correctly', () => {
		const games: Game[] = [
			createTestGame({ status: 'Completed', playtime: '10h 0m' }), // 600
			createTestGame({ status: 'Playing', playtime: '5h 0m' }), // 300
			createTestGame({ status: 'Planned', playtime: '5h 0m' }), // 300
		];
		const stats = computeBacklogStats(games);
		// total 1200
		expect(stats.completed.pctHours).toBeCloseTo(50, 1);
		expect(stats.playing.pctHours).toBeCloseTo(25, 1);
		expect(stats.planned.pctHours).toBeCloseTo(25, 1);
		expect(stats.backlog.pctHours).toBeCloseTo(50, 1);

		expect(stats.completed.pctCount).toBeCloseTo(33.33, 1);
		expect(stats.playing.pctCount).toBeCloseTo(33.33, 1);
		expect(stats.planned.pctCount).toBeCloseTo(33.33, 1);
		expect(stats.backlog.pctCount).toBeCloseTo(66.67, 1);
	});

	it('playing counts as backlog (planned + playing) but separated', () => {
		const games: Game[] = [
			createTestGame({ status: 'Completed', playtime: '10h 0m' }),
			createTestGame({ status: 'Playing', playtime: '10h 0m' }),
			createTestGame({ status: 'Planned', playtime: '10h 0m' }),
		];
		const stats = computeBacklogStats(games);
		expect(stats.backlog.count).toBe(2);
		expect(stats.backlog.minutes).toBe(1200);
		// ensure hours sum to 100
		expect(stats.completed.pctHours + stats.playing.pctHours + stats.planned.pctHours).toBeCloseTo(100, 5);
		expect(stats.completed.pctCount + stats.playing.pctCount + stats.planned.pctCount).toBeCloseTo(100, 5);
	});

	it('handles real-world scale (mirrors static/games.json totals approximately)', () => {
		// 213 completed + 2 playing + 355 planned = 570
		const completed = Array.from({ length: 213 }, () => createTestGame({ status: 'Completed', playtime: '17h 30m' }));
		const playing = Array.from({ length: 2 }, () => createTestGame({ status: 'Playing', playtime: '9h 30m' }));
		const planned = Array.from({ length: 355 }, () => createTestGame({ status: 'Planned', playtime: '15h 15m' }));
		const stats = computeBacklogStats([...completed, ...playing, ...planned]);
		expect(stats.total.count).toBe(570);
		expect(stats.total.pctHours).toBe(100);
		expect(stats.backlog.count).toBe(357);
		expect(stats.completed.pctHours + stats.backlog.pctHours).toBeCloseTo(100, 5);
	});

	it('treats invalid playtime as 0 minutes', () => {
		const games: Game[] = [
			createTestGame({ status: 'Completed', playtime: '' }),
			createTestGame({ status: 'Planned', playtime: 'invalid' }),
		];
		const stats = computeBacklogStats(games);
		expect(stats.completed.minutes).toBe(0);
		expect(stats.planned.minutes).toBe(0);
		expect(stats.total.minutes).toBe(0);
		expect(stats.completed.pctHours).toBe(0);
	});
});

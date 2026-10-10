import { describe, expect, it } from 'vitest';
import type { TooltipItem } from 'chart.js';
import type { Game } from '#lib/types/game.js';
import {
	buildGenreChart,
	buildPlaytimeChart,
	buildScoreChart,
	buildTierChart,
	buildYearChart,
	type ChartConfig,
} from '#lib/utils/statsCharts.js';
import { createTestGame } from './helpers/factories';

function completed(overrides: Partial<Game> = {}): Game {
	return createTestGame({ status: 'Completed', ...overrides });
}

function barItem(label: string, raw: number, dataIndex = 0): TooltipItem<'bar'> {
	return { label, raw, dataIndex } as unknown as TooltipItem<'bar'>;
}

function tooltipLabel(config: ChartConfig): (item: TooltipItem<'bar'>) => string | string[] {
	const callbacks = config.options.plugins?.tooltip?.callbacks as
		| { label?: (item: TooltipItem<'bar'>) => string | string[] }
		| undefined;
	return callbacks?.label ?? (() => []);
}

function tooltipAfterBody(config: ChartConfig): (items: TooltipItem<'bar'>[]) => string | string[] {
	const callbacks = config.options.plugins?.tooltip?.callbacks as
		| { afterBody?: (items: TooltipItem<'bar'>[]) => string | string[] }
		| undefined;
	return callbacks?.afterBody ?? (() => []);
}

function datalabelsFormatter(config: ChartConfig): (value: number) => string | number {
	const datalabels = config.options.plugins?.datalabels as
		| { formatter?: (value: number) => string | number }
		| undefined;
	return datalabels?.formatter ?? ((value) => value);
}

describe('buildTierChart', () => {
	it('counts completed games per tier in tier order', () => {
		const config = buildTierChart([
			completed({ tier: 'A - Amazing' }),
			completed({ tier: 'A - Amazing' }),
			completed({ tier: 'C - Good' }),
			completed({ tier: null }),
			createTestGame({ status: 'Playing', tier: 'S - Masterpiece' }),
		]);

		expect(config.data.labels).toEqual(['S', 'A', 'B', 'C', 'D', 'E']);
		expect(config.data.datasets?.[0]?.data).toEqual([0, 2, 0, 1, 0, 0]);
	});

	it('uses a horizontal bar layout with datalabels and no legend', () => {
		const config = buildTierChart([completed({ tier: 'A - Amazing' })]);

		expect(config.options.indexAxis).toBe('y');
		expect(config.options.plugins?.legend?.display).toBe(false);
		expect(config.options.layout?.padding).toMatchObject({ right: 40 });
		expect(datalabelsFormatter(config)(0)).toBe('');
		expect(datalabelsFormatter(config)(3)).toBe(3);
		expect(tooltipLabel(config)(barItem('A', 4))).toBe('4 games');
	});

	it('handles an empty library', () => {
		const config = buildTierChart([]);

		expect(config.data.labels).toEqual(['S', 'A', 'B', 'C', 'D', 'E']);
		expect(config.data.datasets?.[0]?.data).toEqual([0, 0, 0, 0, 0, 0]);
	});
});

describe('buildGenreChart', () => {
	it('ranks genres by count and tints backgrounds with the genre color', () => {
		const config = buildGenreChart(
			[
				completed({ genre: 'Action', score: 12 }),
				completed({ genre: 'Action', score: 16 }),
				completed({ genre: 'Puzzle', score: 14 }),
			],
			'dark'
		);

		expect(config.data.labels).toEqual(['Action', 'Puzzle']);
		expect(config.data.datasets?.[0]?.data).toEqual([2, 1]);
		expect(config.data.datasets?.[0]?.borderColor).toEqual(['#E6194B', '#42D4F4']);
		expect(config.data.datasets?.[0]?.backgroundColor).toEqual(['#E6194B44', '#42D4F444']);
	});

	it('tooltip shows count, share of completed and average score', () => {
		const config = buildGenreChart(
			[completed({ genre: 'Action', score: 16 }), completed({ genre: 'Action', score: 12 })],
			'light'
		);

		expect(tooltipLabel(config)(barItem('Action', 2))).toBe('2 games · 100% of completed · avg 14/20');
	});

	it('tooltip omits the average when the genre has no rated games', () => {
		const config = buildGenreChart([completed({ genre: 'Action', score: null })], 'dark');

		expect(tooltipLabel(config)(barItem('Action', 1))).toBe('1 games · 100% of completed');
	});

	it('uses horizontal bars with datalabels anchored at the end', () => {
		const config = buildGenreChart([completed({ genre: 'Action' })], 'dark');

		expect(config.options.indexAxis).toBe('y');
		expect(config.options.plugins?.legend?.display).toBe(false);
		expect(datalabelsFormatter(config)(0)).toBe('');
		expect(datalabelsFormatter(config)(5)).toBe(5);
	});
});

describe('buildPlaytimeChart', () => {
	it('buckets completed games by playtime range', () => {
		const config = buildPlaytimeChart([
			completed({ playtime: '3h 0m' }),
			completed({ playtime: '7h 30m' }),
			completed({ playtime: '45h 0m' }),
			completed({ playtime: '0h 0m' }),
		]);

		expect(config.data.labels).toEqual(['0-5h', '5-10h', '10-20h', '20-40h', '40h+']);
		expect(config.data.datasets?.[0]?.data).toEqual([2, 1, 0, 0, 1]);
	});

	it('tooltip shows the game count and total hours in the bucket', () => {
		const config = buildPlaytimeChart([completed({ playtime: '3h 0m' }), completed({ playtime: '1h 30m' })]);

		expect(tooltipLabel(config)(barItem('0-5h', 2, 0))).toBe('2 games · 4h 30m total');
	});

	it('tooltip singularizes the count when a bucket holds one game', () => {
		const config = buildPlaytimeChart([completed({ playtime: '1h 30m' })]);

		expect(tooltipLabel(config)(barItem('0-5h', 1, 0))).toBe('1 game · 1h 30m total');
	});

	it('hides the legend and zero datalabels', () => {
		const config = buildPlaytimeChart([]);

		expect(config.options.plugins?.legend?.display).toBe(false);
		expect(datalabelsFormatter(config)(0)).toBe('');
		expect(datalabelsFormatter(config)(3)).toBe(3);
	});
});

describe('buildScoreChart', () => {
	it('groups rated completed games into score bands', () => {
		const config = buildScoreChart([
			completed({ score: 4 }),
			completed({ score: 8 }),
			completed({ score: 12 }),
			completed({ score: 16 }),
			completed({ score: 20 }),
			completed({ score: null }),
		]);

		expect(config.data.labels).toEqual(['0–4', '5–8', '9–12', '13–16', '17–20']);
		expect(config.data.datasets?.[0]?.data).toEqual([1, 1, 1, 1, 1]);
	});

	it('tooltip shows the share of rated games and pluralizes correctly', () => {
		const config = buildScoreChart([completed({ score: 20 }), completed({ score: 4 })]);

		expect(tooltipLabel(config)(barItem('0–4', 1))).toBe('1 game · 50% of rated games');
		expect(tooltipLabel(config)(barItem('17–20', 1))).toBe('1 game · 50% of rated games');
	});

	it('hides the legend and zero datalabels', () => {
		const config = buildScoreChart([]);

		expect(config.options.plugins?.legend?.display).toBe(false);
		expect(datalabelsFormatter(config)(0)).toBe('');
	});
});

describe('buildYearChart', () => {
	const games = [
		completed({ finishedDate: '2021-06-01', playtime: '2h 0m' }),
		completed({ finishedDate: '2022-06-01', playtime: '3h 0m' }),
		completed({ finishedDate: '2022-09-01', playtime: '1h 0m' }),
	];

	it('plots annual counts with a cumulative dashed line', () => {
		const config = buildYearChart(games, 'dark');

		expect(config.data.labels).toEqual(['2021', '2022']);
		const datasets = config.data.datasets ?? [];
		expect(datasets[0]?.type).toBe('bar');
		expect(datasets[0]?.data).toEqual([1, 2]);
		expect(datasets[1]?.type).toBe('line');
		expect(datasets[1]).toMatchObject({ borderDash: [6, 4] });
		expect(datasets[1]?.data).toEqual([1, 3]);
	});

	it('shows hours per year in the tooltip after body', () => {
		const config = buildYearChart(games, 'dark');

		expect(tooltipAfterBody(config)([barItem('2022', 2, 1)])).toBe('Hours: 4h');
	});

	it('shows counts on the bar dataset only', () => {
		const config = buildYearChart(games, 'light');
		const display = config.options.plugins?.datalabels?.display as
			| ((ctx: { datasetIndex: number }) => boolean)
			| undefined;

		expect(display?.({ datasetIndex: 0 })).toBe(true);
		expect(display?.({ datasetIndex: 1 })).toBe(false);
		expect(datalabelsFormatter(config)(2)).toBe('2');
		expect(datalabelsFormatter(config)(0)).toBe('');
	});

	it('handles games without finished dates', () => {
		const config = buildYearChart([completed({ finishedDate: null }), completed({ finishedDate: '' })], 'dark');

		expect(config.data.labels).toEqual([]);
		expect(config.data.datasets?.[0]?.data).toEqual([]);
	});
});

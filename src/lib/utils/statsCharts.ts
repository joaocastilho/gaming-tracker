import type { ChartData, ChartOptions, TooltipItem } from 'chart.js';

import type { Game } from '#lib/types/game.js';
import { getGenreChartColor, type ColorTheme } from '#lib/utils/colorConstants.js';
import { parsePlaytimeToMinutes, formatMinutes } from '#lib/utils/playtimeUtils.js';
import { computeGenreStats, computeScoreDistribution } from '#lib/utils/statsUtils.js';
import { TIER_BAR_COLORS, TIER_BG_COLORS, TIER_LETTERS, TIER_ORDER } from '#lib/utils/tierUtils.js';

const PLAYTIME_BUCKETS = [
	{ label: '0-5h', min: 0, max: 300 },
	{ label: '5-10h', min: 301, max: 600 },
	{ label: '10-20h', min: 601, max: 1200 },
	{ label: '20-40h', min: 1201, max: 2400 },
	{ label: '40h+', min: 2401, max: Infinity },
] as const;

const PLAYTIME_COLORS = ['#06b6d4', '#22c55e', '#6366f1', '#f59e0b', '#ef4444'];
const PLAYTIME_BGS = [
	'rgba(6,182,212,0.22)',
	'rgba(34,197,94,0.22)',
	'rgba(99,102,241,0.22)',
	'rgba(245,158,11,0.22)',
	'rgba(239,68,68,0.22)',
];

const SCORE_COLORS = ['#64748b', '#06b6d4', '#6366f1', '#8b5cf6', '#f59e0b'];
const SCORE_BGS = [
	'rgba(100,116,139,0.18)',
	'rgba(6,182,212,0.2)',
	'rgba(99,102,241,0.2)',
	'rgba(139,92,246,0.2)',
	'rgba(245,158,11,0.22)',
];

export interface ChartConfig {
	data: ChartData;
	options: ChartOptions<'bar'>;
}

export function buildTierChart(games: Game[]): ChartConfig {
	const completed = games.filter((game) => game.status === 'Completed');
	const counts: number[] = TIER_ORDER.map((tier) => completed.filter((game) => game.tier === tier).length);
	return {
		data: {
			labels: [...TIER_LETTERS],
			datasets: [
				{
					label: 'Games',
					data: counts,
					backgroundColor: TIER_BG_COLORS,
					borderColor: TIER_BAR_COLORS,
					borderWidth: 2,
					borderRadius: 4,
					clip: false as const,
				},
			],
		},
		options: {
			indexAxis: 'y' as const,
			clip: false,
			plugins: {
				legend: { display: false },
				datalabels: {
					font: { weight: 'bold' as const, size: 15 },
					anchor: 'end' as const,
					align: 'end' as const,
					offset: 4,
					formatter: (value: number) => value || '',
				},
				tooltip: {
					callbacks: {
						label: (item: TooltipItem<'bar'>) => `${item.raw} game${Number(item.raw) !== 1 ? 's' : ''}`,
					},
				},
			},
			layout: { padding: { right: 40 } },
			scales: {
				x: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
				y: { grid: { display: false }, ticks: { font: { size: 15, weight: 'bold' as const } } },
			},
		},
	};
}

export function buildGenreChart(games: Game[], theme: ColorTheme): ChartConfig {
	const genreStats = computeGenreStats(games);
	const colors = genreStats.map((genre) => getGenreChartColor(genre.name, theme));
	return {
		data: {
			labels: genreStats.map((genre) => genre.name),
			datasets: [
				{
					label: 'Games',
					data: genreStats.map((genre) => genre.count),
					backgroundColor: colors.map((color) => `${color}44`),
					borderColor: colors,
					borderWidth: 2,
					borderRadius: 6,
					clip: false as const,
				},
			],
		},
		options: {
			indexAxis: 'y' as const,
			plugins: {
				legend: { display: false },
				datalabels: {
					font: { weight: 'bold' as const, size: 13 },
					anchor: 'end' as const,
					align: 'end' as const,
					offset: 5,
					formatter: (value: number) => value || '',
				},
				tooltip: {
					callbacks: {
						label: (item: TooltipItem<'bar'>) => {
							const genre = genreStats.find((entry) => entry.name === item.label);
							if (!genre) return `${item.raw} games`;
							const score = genre.ratedCount > 0 ? ` · avg ${genre.averageScore}/20` : '';
							return `${genre.count} games · ${genre.percentage}% of completed${score}`;
						},
					},
				},
			},
			layout: { padding: { right: 40 } },
			scales: {
				x: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
				y: {
					grid: { display: false },
					ticks: {
						autoSkip: false,
						font: { size: 12 },
						padding: 8,
					},
				},
			},
		},
	};
}

export function buildPlaytimeChart(games: Game[]): ChartConfig {
	const completed = games.filter((game) => game.status === 'Completed');
	const playtimeCounts = PLAYTIME_BUCKETS.map(
		(b) => completed.filter((g) => playtimeOf(g) >= b.min && playtimeOf(g) <= b.max).length
	);
	const playtimeTotals = PLAYTIME_BUCKETS.map((b) =>
		completed.filter((g) => playtimeOf(g) >= b.min && playtimeOf(g) <= b.max).reduce((s, g) => s + playtimeOf(g), 0)
	);

	return {
		data: {
			labels: PLAYTIME_BUCKETS.map((b) => b.label),
			datasets: [
				{
					label: 'Games',
					data: playtimeCounts,
					backgroundColor: PLAYTIME_BGS,
					borderColor: PLAYTIME_COLORS,
					borderWidth: 2,
					borderRadius: 4,
				},
			],
		},
		options: {
			plugins: {
				legend: { display: false },
				datalabels: {
					color: '#ffffff',
					font: { weight: 'bold' as const, size: 14 },
					anchor: 'center' as const,
					align: 'center' as const,
					formatter: (value: number) => value || '',
				},
				tooltip: {
					callbacks: {
						label: (item: TooltipItem<'bar'>) => {
							const count = Number(item.raw);
							const idx = item.dataIndex;
							const totalMins = playtimeTotals[idx] ?? 0;
							const hoursLabel = totalMins ? ` · ${formatMinutes(totalMins)} total` : '';
							return `${count} game${count !== 1 ? 's' : ''}${hoursLabel}`;
						},
					},
				},
			},
			scales: {
				x: { grid: { display: false }, ticks: { font: { size: 13 } } },
				y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
			},
		},
	};
}

export function buildScoreChart(games: Game[]): ChartConfig {
	const scoreDistribution = computeScoreDistribution(games);
	return {
		data: {
			labels: scoreDistribution.map((band) => band.label),
			datasets: [
				{
					label: 'Games',
					data: scoreDistribution.map((band) => band.count),
					backgroundColor: SCORE_BGS,
					borderColor: SCORE_COLORS,
					borderWidth: 2,
					borderRadius: 7,
					clip: false as const,
				},
			],
		},
		options: {
			plugins: {
				legend: { display: false },
				datalabels: {
					color: '#ffffff',
					font: { weight: 'bold' as const, size: 13 },
					anchor: 'center' as const,
					align: 'center' as const,
					formatter: (value: number) => value || '',
				},
				tooltip: {
					callbacks: {
						label: (item: TooltipItem<'bar'>) => {
							const band = scoreDistribution[item.dataIndex];
							if (!band) return `${item.raw} games`;
							return `${band.count} game${band.count === 1 ? '' : 's'} · ${band.percentage}% of rated games`;
						},
					},
				},
			},
			layout: { padding: { top: 18 } },
			scales: {
				x: { grid: { display: false }, ticks: { font: { size: 12, weight: 'bold' as const } } },
				y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
			},
		},
	};
}

export function buildYearChart(games: Game[], theme: ColorTheme): ChartConfig {
	const yearMap = new Map<number, number>();
	const hoursMap = new Map<number, number>();
	for (const g of games) {
		if (g.status !== 'Completed' || !g.finishedDate) continue;
		const year = new Date(g.finishedDate).getFullYear();
		yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
		hoursMap.set(year, (hoursMap.get(year) ?? 0) + playtimeOf(g));
	}
	const sorted = [...yearMap.entries()].toSorted((a, b) => a[0] - b[0]);
	const labels = sorted.map(([y]) => String(y));
	const counts = sorted.map(([, c]) => c);
	const yearHours = sorted.map(([y]) => Math.round(((hoursMap.get(y) ?? 0) / 60) * 10) / 10);
	let cumulative = 0;
	const cumulData = counts.map((c) => (cumulative += c));

	return {
		data: {
			labels,
			datasets: [
				{
					type: 'bar' as const,
					label: 'Games',
					data: counts,
					backgroundColor: theme === 'dark' ? 'rgba(99,102,241,0.62)' : 'rgba(99,102,241,0.52)',
					borderColor: theme === 'dark' ? 'rgba(99,102,241,0.95)' : 'rgba(99,102,241,0.85)',
					borderWidth: 1.5,
					borderRadius: 6,
					clip: false as const,
					order: 2,
					yAxisID: 'y',
					barPercentage: 0.75,
					categoryPercentage: 0.85,
					maxBarThickness: 72,
				},
				{
					type: 'line' as const,
					label: 'Cumulative',
					data: cumulData,
					borderColor: theme === 'dark' ? '#f59e0b' : '#92400e',
					backgroundColor: 'transparent',
					borderWidth: 2,
					pointRadius: 3,
					pointBackgroundColor: theme === 'dark' ? '#fbbf24' : '#92400e',
					pointBorderColor: theme === 'dark' ? '#1a1c23' : '#fbfaf7',
					pointBorderWidth: 1.5,
					tension: 0.35,
					yAxisID: 'y1',
					order: 1,
					borderDash: [6, 4],
				},
			],
		},
		options: {
			plugins: {
				legend: {
					display: true,
					position: 'bottom' as const,
					labels: { boxWidth: 14, font: { size: 11 }, padding: 12, usePointStyle: true },
				},
				datalabels: {
					display: (ctx: { datasetIndex: number }) => ctx.datasetIndex === 0,
					// Labels sit ABOVE the bars (not inside) so long "count · hours"
					// strings can never overflow a narrow bar. Count only — hours live
					// in the tooltip.
					color: theme === 'dark' ? '#e5e7eb' : '#1c1917',
					font: { weight: 'bold' as const, size: 11 },
					anchor: 'end' as const,
					align: 'end' as const,
					offset: 4,
					clip: false,
					formatter: (value: number) => (value ? String(value) : ''),
				},
				tooltip: {
					mode: 'index' as const,
					intersect: false,
					callbacks: {
						label: (item: TooltipItem<'bar'>) =>
							item.datasetIndex === 0 ? `Games: ${item.raw}` : `Cumulative: ${item.raw}`,
						afterBody: (items: TooltipItem<'bar'>[]) => {
							const idx = items[0]?.dataIndex;
							if (idx == null) return '';
							const h = yearHours[idx];
							return h ? `Hours: ${h}h` : '';
						},
					},
				},
			},
			layout: { padding: { top: 22, right: 8, bottom: 0 } },
			scales: {
				x: {
					grid: { display: false },
					ticks: {
						font: { size: 11 },
						color: theme === 'dark' ? '#a0a8b8' : '#57534e',
						maxRotation: 45,
						minRotation: 0,
						autoSkip: false,
					},
				},
				y: {
					grid: {
						display: true,
						color: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(62,52,40,0.09)',
						drawTicks: false,
					},
					ticks: {
						display: true,
						font: { size: 10 },
						color: theme === 'dark' ? '#717684' : '#6b665d',
						maxTicksLimit: 5,
						precision: 0,
					},
					beginAtZero: true,
					grace: '15%',
					title: { display: false },
				},
				y1: {
					position: 'right' as const,
					grid: { display: false },
					ticks: { display: false },
					beginAtZero: true,
					grace: '15%',
				},
			},
		},
	};
}

function playtimeOf(game: Game): number {
	return parsePlaytimeToMinutes(game.playtime);
}

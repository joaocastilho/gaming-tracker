<script lang="ts">
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore } from '$lib/stores/app.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { parsePlaytimeToMinutes, formatMinutes } from '$lib/utils/playtimeUtils';
import Chart from '$lib/components/Chart.svelte';
import type { TooltipItem } from 'chart.js';
import { Clock, Trophy, Star, Calendar, Presentation, NotebookPen, Gamepad2 } from 'lucide-svelte';

const TIER_ORDER = ['S - Masterpiece', 'A - Amazing', 'B - Great', 'C - Good', 'D - Decent', 'E - Bad'] as const;
const TIER_LABELS = ['S', 'A', 'B', 'C', 'D', 'E'];
const TIER_BAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6b7280'];
const TIER_BG_COLORS = [
	'rgba(239,68,68,0.25)',
	'rgba(249,115,22,0.25)',
	'rgba(234,179,8,0.25)',
	'rgba(34,197,94,0.25)',
	'rgba(6,182,212,0.25)',
	'rgba(107,114,128,0.25)',
];

const GENRE_COLORS = [
	'#6366f1',
	'#ec4899',
	'#14b8a6',
	'#f59e0b',
	'#8b5cf6',
	'#06b6d4',
	'#84cc16',
	'#f97316',
	'#22d3ee',
	'#a78bfa',
	'#fb7185',
	'#34d399',
	'#fbbf24',
	'#60a5fa',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SCORE_RANGES = [
	{ label: '0-5', min: 0, max: 5, color: '#6b7280', bg: 'rgba(107,114,128,0.25)' },
	{ label: '6-8', min: 6, max: 8, color: '#f97316', bg: 'rgba(249,115,22,0.25)' },
	{ label: '9-11', min: 9, max: 11, color: '#eab308', bg: 'rgba(234,179,8,0.25)' },
	{ label: '12-14', min: 12, max: 14, color: '#22c55e', bg: 'rgba(34,197,94,0.25)' },
	{ label: '15-17', min: 15, max: 17, color: '#06b6d4', bg: 'rgba(6,182,212,0.25)' },
	{ label: '18-20', min: 18, max: 20, color: '#8b5cf6', bg: 'rgba(139,92,246,0.25)' },
];

let games = $derived(gamesStore.games);

let completedGames = $derived(games.filter((g) => g.status === 'Completed'));

let totalPlaytimeMinutes = $derived(completedGames.reduce((sum, g) => sum + parsePlaytimeToMinutes(g.playtime), 0));
let totalPlaytimeFormatted = $derived(formatMinutes(totalPlaytimeMinutes));
let totalDays = $derived(Math.round((totalPlaytimeMinutes / 1440) * 10) / 10);
let totalWeeks = $derived(Math.round((totalPlaytimeMinutes / 10080) * 10) / 10);
let totalYears = $derived(Math.round((totalPlaytimeMinutes / 525600) * 100) / 100);

let completedCount = $derived(completedGames.length);
let plannedCount = $derived(games.filter((g) => g.status === 'Planned').length);

let avgScore = $derived.by(() => {
	if (completedGames.length === 0) return 0;
	const total = completedGames.reduce((sum, g) => sum + (g.score ?? 0), 0);
	return Math.round((total / completedGames.length) * 10) / 10;
});

let currentYear = new Date().getFullYear();
let gamesThisYear = $derived(
	completedGames.filter((g) => {
		if (!g.finishedDate) return false;
		const d = new Date(g.finishedDate);
		return d.getFullYear() === currentYear;
	})
);
let playtimeThisYear = $derived(
	formatMinutes(gamesThisYear.reduce((sum, g) => sum + parsePlaytimeToMinutes(g.playtime), 0))
);
let playtimeThisYearMinutes = $derived(gamesThisYear.reduce((sum, g) => sum + parsePlaytimeToMinutes(g.playtime), 0));
let yearDays = $derived(Math.round((playtimeThisYearMinutes / 1440) * 10) / 10);
let yearWeeks = $derived(Math.round((playtimeThisYearMinutes / 10080) * 10) / 10);

let tierData = $derived.by(() => {
	const counts: number[] = TIER_ORDER.map((tier) => completedGames.filter((g) => g.tier === tier).length);
	return {
		labels: [...TIER_LABELS],
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
	};
});

let genreData = $derived.by(() => {
	const genreCount = new Map<string, number>();
	for (const g of completedGames) {
		genreCount.set(g.genre, (genreCount.get(g.genre) ?? 0) + 1);
	}
	const sorted = [...genreCount.entries()].toSorted((a, b) => b[1] - a[1]).slice(0, 8);
	return {
		labels: sorted.map(([name]) => name),
		datasets: [
			{
				label: 'Games',
				data: sorted.map(([, count]) => count),
				backgroundColor: GENRE_COLORS.slice(0, sorted.length),
				borderColor: GENRE_COLORS.slice(0, sorted.length),
				borderWidth: 2,
				borderRadius: 4,
				clip: false as const,
			},
		],
	};
});

let scoreData = $derived.by(() => ({
	labels: SCORE_RANGES.map((r) => r.label),
	datasets: [
		{
			label: 'Games',
			data: SCORE_RANGES.map(
				(r) =>
					completedGames.filter((g) => {
						const s = g.score ?? -1;
						return s >= r.min && s <= r.max;
					}).length
			),
			backgroundColor: SCORE_RANGES.map((r) => r.bg),
			borderColor: SCORE_RANGES.map((r) => r.color),
			borderWidth: 2,
			borderRadius: 4,
		},
	],
}));

let yearData = $derived.by(() => {
	const yearMap = new Map<number, number>();
	for (const g of completedGames) {
		if (!g.finishedDate) continue;
		const year = new Date(g.finishedDate).getFullYear();
		yearMap.set(year, (yearMap.get(year) ?? 0) + 1);
	}
	const sorted = [...yearMap.entries()].toSorted((a, b) => a[0] - b[0]);
	return {
		labels: sorted.map(([y]) => String(y)),
		datasets: [
			{
				label: 'Games',
				data: sorted.map(([, c]) => c),
				backgroundColor: appStore.theme === 'dark' ? 'rgba(99,102,241,0.55)' : 'rgba(99,102,241,0.45)',
				borderColor: appStore.theme === 'dark' ? 'rgba(99,102,241,0.85)' : 'rgba(99,102,241,0.75)',
				borderWidth: 1,
				borderRadius: 4,
				clip: false as const,
			},
		],
	};
});

let textColor = $derived(appStore.theme === 'dark' ? '#a0a0a0' : '#666666');

let yearlyMonthData = $derived.by(() => {
	const yearMonth = new Map<number, number[]>();
	for (const g of completedGames) {
		if (!g.finishedDate) continue;
		const d = new Date(g.finishedDate);
		const y = d.getFullYear();
		const m = d.getMonth();
		if (!yearMonth.has(y)) yearMonth.set(y, new Array(12).fill(0));
		yearMonth.get(y)![m]++;
	}
	return [...yearMonth.entries()].map(([year, months]) => ({ year, data: months })).toSorted((a, b) => a.year - b.year);
});

let tierOptions = $derived({
	indexAxis: 'y' as const,
	clip: false,
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 14 },
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
		y: { grid: { display: false }, ticks: { color: textColor, font: { size: 14, weight: 'bold' as const } } },
	},
});

let genreOptions = $derived({
	indexAxis: 'y' as const,
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 14 },
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
		y: { grid: { display: false }, ticks: { color: textColor, font: { size: 13 } } },
	},
});

let scoreOptions = $derived({
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
				label: (item: TooltipItem<'bar'>) => `${item.raw} game${Number(item.raw) !== 1 ? 's' : ''}`,
			},
		},
	},
	scales: {
		x: { grid: { display: false }, ticks: { color: textColor, font: { size: 12 } } },
		y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
	},
});

let yearOptions = $derived({
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 13 },
			anchor: 'end' as const,
			align: 'end' as const,
			offset: 2,
			formatter: (value: number) => value || '',
		},
		tooltip: {
			callbacks: {
				label: (item: TooltipItem<'bar'>) => `${item.raw} game${Number(item.raw) !== 1 ? 's' : ''}`,
			},
		},
	},
	layout: { padding: { top: 20, right: 30 } },
	scales: {
		x: { grid: { display: false }, ticks: { color: textColor, font: { size: 12 } } },
		y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
	},
});

let top10Presentation = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingPresentation ?? 0) - (a.ratingPresentation ?? 0))
		.slice(0, 10)
		.filter((g) => g.ratingPresentation != null)
);
let top10Story = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingStory ?? 0) - (a.ratingStory ?? 0))
		.slice(0, 10)
		.filter((g) => g.ratingStory != null)
);
let top10Gameplay = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingGameplay ?? 0) - (a.ratingGameplay ?? 0))
		.slice(0, 10)
		.filter((g) => g.ratingGameplay != null)
);
let top10Score = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.score ?? 0) - (a.score ?? 0))
		.slice(0, 10)
		.filter((g) => g.score != null)
);
</script>

<div class="stats-page">
	<div class="stats-content">

		<section class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">
					<Clock size={16} />
				</div>
				<div class="stat-body">
					<div class="stat-value">{totalPlaytimeFormatted}</div>
					<div class="stat-label">Total Played</div>
					<div class="stat-pills">
						<span class="stat-pill">{totalDays} days</span>
						<span class="stat-pill">{totalWeeks} weeks</span>
						<span class="stat-pill">{totalYears} years</span>
					</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Trophy size={16} />
				</div>
				<div class="stat-body">
					<div class="stat-value">{completedCount}</div>
					<div class="stat-label">Completed</div>
					<div class="stat-pills">
						<span class="stat-pill">{plannedCount} planned</span>
					</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Star size={16} />
				</div>
				<div class="stat-body">
					<div class="stat-value">{avgScore}</div>
					<div class="stat-label">Average Score</div>
					<div class="stat-pills">
						<span class="stat-pill">of 20</span>
					</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Calendar size={16} />
				</div>
				<div class="stat-body">
					<div class="stat-value">{playtimeThisYear}</div>
					<div class="stat-label">Played in {currentYear}</div>
					<div class="stat-pills">
						<span class="stat-pill">{yearDays} days</span>
						<span class="stat-pill">{yearWeeks} weeks</span>
					</div>
				</div>
			</div>
		</section>

		<section class="charts-grid">
			<div class="chart-card span-2">
				<h3 class="chart-title">Tier Distribution</h3>
				<p class="chart-sub">{completedCount} completed games</p>
				<div class="chart-body">
					<Chart type="bar" data={tierData} options={tierOptions} height={200} />
				</div>
			</div>
			<div class="chart-card span-2">
				<h3 class="chart-title">Genre Breakdown</h3>
				<p class="chart-sub">Top genres played</p>
				<div class="chart-body">
					<Chart type="bar" data={genreData} options={genreOptions} height={200} />
				</div>
			</div>
			<div class="chart-card span-2">
				<h3 class="chart-title">Score Distribution</h3>
				<p class="chart-sub">How scores are spread</p>
				<div class="chart-body">
					<Chart type="bar" data={scoreData} options={scoreOptions} height={200} />
				</div>
			</div>
			<div class="chart-card span-4 hide-mobile">
				<h3 class="chart-title">Monthly Breakdown by Year</h3>
				<p class="chart-sub">Completions per month</p>
				<div class="monthly-table">
					<div class="mt-row mt-header">
						<span class="mt-year"></span>
						{#each MONTHS as m}<span class="mt-cell mt-header-cell">{m}</span>{/each}
						<span class="mt-cell mt-header-cell mt-total">Total</span>
					</div>
					{#each yearlyMonthData as ym}
						<div class="mt-row">
							<span class="mt-year">{ym.year}</span>
							{#each ym.data as val}
								<span class="mt-cell" class:mt-positive={val > 0}>{val}</span>
							{/each}
							<span class="mt-cell mt-total">{ym.data.reduce((a, b) => a + b, 0)}</span>
						</div>
					{/each}
				</div>
			</div>
			<div class="chart-card span-2 hide-mobile">
				<h3 class="chart-title">Year Over Year</h3>
				<p class="chart-sub">Completions per year</p>
				<div class="chart-body">
					<Chart type="bar" data={yearData} options={yearOptions} height={200} />
				</div>
			</div>
		</section>

		<section class="ratings-section">
			<h3 class="section-title">Top Rated</h3>
			<div class="ratings-categories">
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #f43f5e;">
						<Presentation size={16} style="color: #f43f5e;" />
						Presentation
					</h4>
					<div class="rating-list">
						{#each top10Presentation as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value">{game.ratingPresentation}/10</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #0ea5e9;">
						<NotebookPen size={16} style="color: #0ea5e9;" />
						Story
					</h4>
					<div class="rating-list">
						{#each top10Story as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value">{game.ratingStory}/10</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #10b981;">
						<Gamepad2 size={16} style="color: #10b981;" />
						Gameplay
					</h4>
					<div class="rating-list">
						{#each top10Gameplay as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value">{game.ratingGameplay}/10</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #f59e0b;">
						<Star size={16} style="color: #f59e0b;" />
						Score
					</h4>
					<div class="rating-list">
						{#each top10Score as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value">{game.score}/20</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.stats-page {
		padding-bottom: 16px;
	}

	@media (max-width: 767px) {
		.stats-page {
			padding-bottom: 96px;
		}
	}

	.stats-content {
		max-width: 1600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.section-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}

	@media (min-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.stat-card {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 14px;
		border-radius: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		flex-shrink: 0;
		color: var(--color-accent);
		background: var(--color-accent-bg, rgba(99, 102, 241, 0.1));
	}

	:global(.light) .stat-icon {
		background: rgba(194, 65, 12, 0.1);
	}

	.stat-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.stat-value {
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.2;
	}

	.stat-label {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.75;
	}

	.stat-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 6px;
	}

	.stat-pill {
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--color-text-primary);
		background: var(--color-accent-bg, rgba(99, 102, 241, 0.15));
		padding: 2px 10px;
		border-radius: 6px;
		line-height: 1.5;
		border: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent);
	}

	:global(.light) .stat-pill {
		background: rgba(194, 65, 12, 0.12);
		border-color: rgba(194, 65, 12, 0.25);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	@media (min-width: 900px) {
		.charts-grid {
			grid-template-columns: 1fr 1fr;
		}
	}

	@media (min-width: 1400px) {
		.charts-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	.chart-card {
		display: flex;
		flex-direction: column;
		padding: 20px;
		border-radius: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.chart-card.span-2 {
		grid-column: span 2;
	}

	.chart-card.span-4 {
		grid-column: span 4;
	}

	@media (max-width: 1399px) {
		.chart-card.span-2,
		.chart-card.span-4 {
			grid-column: span 1;
		}
	}

	.chart-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.chart-sub {
		margin: 4px 0 0 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.chart-body {
		flex: 1;
		margin-top: 12px;
		min-height: 0;
	}

	.monthly-table {
		margin-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 0.78rem;
		overflow-x: auto;
	}

	.mt-row {
		display: grid;
		grid-template-columns: 50px repeat(12, 1fr) 50px;
		gap: 2px;
		align-items: center;
	}

	.mt-header {
		position: sticky;
		top: 0;
	}

	.mt-year {
		font-weight: 700;
		color: var(--color-text-primary);
		text-align: right;
		padding-right: 6px;
		font-size: 0.8rem;
	}

	.mt-cell {
		text-align: center;
		padding: 4px 2px;
		border-radius: 4px;
		font-weight: 600;
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		font-size: 0.82rem;
	}

	.mt-header-cell {
		font-weight: 700;
		color: var(--color-text-primary);
		background: var(--color-surface);
		font-size: 0.72rem;
		text-transform: uppercase;
	}

	.mt-positive {
		color: var(--color-accent);
		font-weight: 700;
	}

	.mt-total {
		font-weight: 700;
		color: var(--color-text-primary);
	}

	@media (max-width: 1399px) {
		.mt-row {
			grid-template-columns: 40px repeat(12, 1fr) 40px;
		}
		.mt-cell {
			font-size: 0.75rem;
			padding: 3px 1px;
		}
	}

	@media (max-width: 767px) {
		.hide-mobile {
			display: none;
		}
		.charts-grid {
			gap: 12px;
		}
		.chart-card {
			padding: 14px;
		}
		.chart-card .chart-body :global(.chart-wrapper) {
			height: 180px !important;
		}
		.chart-card .chart-body :global(canvas) {
			max-height: 180px;
		}
	}

	.ratings-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	.ratings-categories {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 640px) {
		.ratings-categories {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.ratings-categories {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.rating-category {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.rating-cat-title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-text-primary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
		padding-bottom: 6px;
		border-bottom: 2px solid var(--color-accent);
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.rating-list {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 4px;
	}

	.rating-entry {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 5px 7px;
		border-radius: 7px;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background var(--transition-fast);
		text-align: left;
		width: 100%;
		font-family: inherit;
		font-size: inherit;
	}

	@media (hover: hover) {
		.rating-entry:hover {
			background: var(--color-hover);
		}
	}

	.rating-entry:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}

	.rating-pos {
		width: 18px;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--color-text-secondary);
		text-align: center;
		flex-shrink: 0;
	}

	.rating-cover {
		width: 26px;
		height: 37px;
		border-radius: 4px;
		object-fit: cover;
		flex-shrink: 0;
		background: var(--color-surface-elevated);
	}

	.rating-game {
		flex: 1;
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.rating-value {
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--color-accent);
		flex-shrink: 0;
	}

	@media (max-width: 639px) {
		.rating-cover {
			width: 20px;
			height: 28px;
		}
		.rating-list {
			padding: 3px;
			gap: 1px;
		}
		.rating-entry {
			padding: 3px 5px;
			gap: 5px;
		}
		.rating-pos {
			width: 14px;
			font-size: 0.65rem;
		}
		.rating-game {
			font-size: 0.72rem;
		}
		.rating-value {
			font-size: 0.72rem;
		}
	}
</style>

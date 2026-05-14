<script lang="ts">
import { goto } from '$app/navigation';
import { gamesStore } from '$lib/stores/games.svelte';
import { appStore } from '$lib/stores/app.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { parsePlaytimeToMinutes, formatMinutes } from '$lib/utils/playtimeUtils';
import GameCard from '$lib/components/GameCard.svelte';
import Chart from '$lib/components/Chart.svelte';
import type { Game } from '$lib/types/game';
import type { TooltipItem } from 'chart.js';
import {
	Clock,
	Trophy,
	Star,
	Calendar,
	Sparkles,
	ChevronRight,
	Hourglass,
	Presentation,
	NotebookPen,
	Gamepad2,
} from 'lucide-svelte';

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
let playingGame = $derived(games.filter((g) => g.status === 'Playing'));

let currentSession = $derived(playingGame.length > 0 ? playingGame[0] : null);

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

let recentCompletions = $derived(
	[...completedGames]
		.toSorted((a, b) => {
			if (!a.finishedDate && !b.finishedDate) return 0;
			if (!a.finishedDate) return 1;
			if (!b.finishedDate) return -1;
			return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
		})
		.slice(0, 5)
);

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
			},
		],
	};
});

let monthlyData = $derived.by(() => {
	const monthMap = new Map<string, number>();
	for (const g of completedGames) {
		if (!g.finishedDate) continue;
		const d = new Date(g.finishedDate);
		const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
		monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
	}
	const sorted = [...monthMap.entries()].toSorted((a, b) => a[0].localeCompare(b[0]));
	return {
		labels: sorted.map(([key]) => {
			const [y, m] = key.split('-');
			return `${MONTHS[parseInt(m, 10) - 1]} ${y}`;
		}),
		datasets: [
			{
				label: 'Games',
				data: sorted.map(([, c]) => c),
				backgroundColor: appStore.theme === 'dark' ? 'rgba(99,102,241,0.55)' : 'rgba(99,102,241,0.45)',
				borderColor: appStore.theme === 'dark' ? 'rgba(99,102,241,0.85)' : 'rgba(99,102,241,0.75)',
				borderWidth: 1,
				borderRadius: 4,
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

let textColor = $derived(appStore.theme === 'dark' ? '#a0a0a0' : '#666666');

let tierOptions = $derived({
	indexAxis: 'y' as const,
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 13 },
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
		y: { grid: { display: false }, ticks: { color: textColor, font: { size: 13, weight: 'bold' as const } } },
	},
});

let genreOptions = $derived({
	indexAxis: 'y' as const,
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 13 },
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
		y: { grid: { display: false }, ticks: { color: textColor, font: { size: 11 } } },
	},
});

let monthlyOptions = $derived({
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 12 },
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
	layout: { padding: { top: 20 } },
	scales: {
		x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
		y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
	},
});

let scoreOptions = $derived({
	plugins: {
		legend: { display: false },
		datalabels: {
			color: '#ffffff',
			font: { weight: 'bold' as const, size: 12 },
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
		x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
		y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
	},
});

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
			},
		],
	};
});

let yearOptions = $derived({
	plugins: {
		legend: { display: false },
		datalabels: {
			color: textColor,
			font: { weight: 'bold' as const, size: 12 },
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
	layout: { padding: { top: 20 } },
	scales: {
		x: { grid: { display: false }, ticks: { color: textColor, font: { size: 10 } } },
		y: { grid: { display: false }, ticks: { display: false }, beginAtZero: true },
	},
});

let top3Presentation = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingPresentation ?? 0) - (a.ratingPresentation ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingPresentation != null)
);
let bottom3Presentation = $derived(
	[...completedGames]
		.toSorted((a, b) => (a.ratingPresentation ?? 0) - (b.ratingPresentation ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingPresentation != null)
);
let top3Story = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingStory ?? 0) - (a.ratingStory ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingStory != null)
);
let bottom3Story = $derived(
	[...completedGames]
		.toSorted((a, b) => (a.ratingStory ?? 0) - (b.ratingStory ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingStory != null)
);
let top3Gameplay = $derived(
	[...completedGames]
		.toSorted((a, b) => (b.ratingGameplay ?? 0) - (a.ratingGameplay ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingGameplay != null)
);
let bottom3Gameplay = $derived(
	[...completedGames]
		.toSorted((a, b) => (a.ratingGameplay ?? 0) - (b.ratingGameplay ?? 0))
		.slice(0, 3)
		.filter((g) => g.ratingGameplay != null)
);

function handleRecentOpen(game: Game) {
	modalStore.openViewModal(game, recentCompletions);
}

function viewAllCompleted() {
	goto('/completed');
}
</script>

<div class="homepage">
	<div class="home-content">

		{#if currentSession}
			<section class="now-playing-section">
				<button type="button" class="np-card" onclick={() => modalStore.openViewModal(currentSession, [currentSession])}>
					<img class="np-cover" src="/{currentSession.coverImage}" alt="" />
					<div class="np-info">
						<div class="np-badge-row">
							<span class="np-badge">
								<Sparkles size={14} />
								Now Playing
							</span>
						</div>
						<h2 class="np-title">{currentSession.title}</h2>
						<div class="np-meta">
							<span class="np-chip">{currentSession.platform}</span>
							<span class="np-chip">{currentSession.genre}</span>
						</div>
						<div class="np-playtime">
							<Hourglass size={16} />
							<span>{currentSession.playtime}</span>
						</div>
					</div>
				</button>
			</section>
		{/if}

		<section class="stats-grid">
			<div class="stat-card">
				<div class="stat-icon">
					<Clock size={22} />
				</div>
				<div class="stat-value">{totalPlaytimeFormatted}</div>
				<div class="stat-label">Total Played</div>
				<div class="stat-breakdown">
					<div class="stat-unit-wrap">
						<span class="stat-unit">{totalDays}</span>
						<span class="stat-unit-label">days</span>
					</div>
					<div class="stat-unit-wrap">
						<span class="stat-unit">{totalWeeks}</span>
						<span class="stat-unit-label">weeks</span>
					</div>
					<div class="stat-unit-wrap">
						<span class="stat-unit">{totalYears}</span>
						<span class="stat-unit-label">years</span>
					</div>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Trophy size={22} />
				</div>
				<div class="stat-value">{completedCount}</div>
				<div class="stat-label">Completed games</div>
				<div class="stat-sub-row">
					<span class="stat-sub-badge">{plannedCount} planned</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Star size={22} />
				</div>
				<div class="stat-value">{avgScore}</div>
				<div class="stat-label">Average score</div>
				<div class="stat-sub-row">
					<span class="stat-sub-badge">of 20</span>
				</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">
					<Calendar size={22} />
				</div>
				<div class="stat-value">{playtimeThisYear}</div>
				<div class="stat-label">Played in {currentYear}</div>
				<div class="stat-breakdown">
					<div class="stat-unit-wrap">
						<span class="stat-unit">{yearDays}</span>
						<span class="stat-unit-label">days</span>
					</div>
					<div class="stat-unit-wrap">
						<span class="stat-unit">{yearWeeks}</span>
						<span class="stat-unit-label">weeks</span>
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
			<div class="chart-card span-3">
				<h3 class="chart-title">Monthly Completions</h3>
				<p class="chart-sub">Games finished per month</p>
				<div class="chart-body">
					<Chart type="bar" data={monthlyData} options={monthlyOptions} height={200} />
				</div>
			</div>
			<div class="chart-card span-3">
				<h3 class="chart-title">Year Over Year</h3>
				<p class="chart-sub">Completions per year</p>
				<div class="chart-body">
					<Chart type="bar" data={yearData} options={yearOptions} height={200} />
				</div>
			</div>
		</section>

		<section class="ratings-section">
			<h3 class="section-title">Highest & Lowest Rated</h3>
			<div class="ratings-categories">
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #f43f5e;">
						<Presentation size={16} style="color: #f43f5e;" />
						Presentation
					</h4>
					<div class="rating-list">
						{#each top3Presentation as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-accent">{game.ratingPresentation}/10</span>
							</button>
						{/each}
						<div class="rating-divider"></div>
						{#each bottom3Presentation as game, i}
							<button type="button" class="rating-entry worst" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos worst">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-worst">{game.ratingPresentation}/10</span>
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
						{#each top3Story as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-accent">{game.ratingStory}/10</span>
							</button>
						{/each}
						<div class="rating-divider"></div>
						{#each bottom3Story as game, i}
							<button type="button" class="rating-entry worst" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos worst">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-worst">{game.ratingStory}/10</span>
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
						{#each top3Gameplay as game, i}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-accent">{game.ratingGameplay}/10</span>
							</button>
						{/each}
						<div class="rating-divider"></div>
						{#each bottom3Gameplay as game, i}
							<button type="button" class="rating-entry worst" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos worst">{i + 1}</span>
								<img class="rating-cover" src="/{game.coverImage}" alt="" loading="lazy" />
								<span class="rating-game">{game.title}</span>
								<span class="rating-value-worst">{game.ratingGameplay}/10</span>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<section class="recent-section">
			<div class="section-header">
				<div class="section-header-left">
					<h3 class="section-title">Recent Completions</h3>
					<p class="section-sub">Last {recentCompletions.length} games finished</p>
				</div>
				<button type="button" class="view-all-btn" onclick={viewAllCompleted}>
					View All
					<ChevronRight size={16} />
				</button>
			</div>
			<div class="recent-grid">
				{#each recentCompletions as game (game.id)}
					<GameCard
						{game}
						size="small"
						showTierBadge={true}
						onOpenModal={handleRecentOpen}
						displayedGames={recentCompletions}
					/>
				{/each}
			</div>
		</section>

	</div>
</div>

<style>
	.homepage {
		padding-bottom: 16px;
	}

	.home-content {
		max-width: 1600px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.now-playing-section {
		width: 100%;
	}

	.np-card {
		display: flex;
		gap: 0;
		width: 100%;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-lg);
		cursor: pointer;
		padding: 0;
		font-family: inherit;
		text-align: left;
		transition: box-shadow var(--transition-normal), transform var(--transition-normal);
	}

	@media (hover: hover) {
		.np-card:hover {
			box-shadow: var(--shadow-xl);
			transform: translateY(-2px);
		}
	}

	.np-card:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.np-cover {
		width: 160px;
		min-height: 200px;
		object-fit: cover;
		flex-shrink: 0;
		background: var(--color-surface-elevated);
	}

	@media (min-width: 640px) {
		.np-cover {
			width: 200px;
		}
	}

	.np-info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
		padding: 24px;
		flex: 1;
	}

	.np-badge-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.np-badge {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 14px;
		border-radius: 20px;
		background: var(--color-accent);
		color: #ffffff;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
	}

	:global(.light) .np-badge {
		box-shadow: 0 0 20px rgba(194, 65, 12, 0.25);
	}

	.np-title {
		margin: 0;
		font-size: 1.4rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.25;
	}

	@media (min-width: 640px) {
		.np-title {
			font-size: 1.75rem;
		}
	}

	.np-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.np-chip {
		display: inline-flex;
		padding: 3px 10px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
	}

	.np-playtime {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
	}

	@media (min-width: 768px) {
		.stats-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
		padding: 18px 12px 16px;
		border-radius: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
		transition: transform var(--transition-normal), box-shadow var(--transition-normal);
	}

	@media (hover: hover) {
		.stat-card:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-md);
		}
	}

	.stat-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		color: var(--color-accent);
		background: var(--color-accent-bg, rgba(99, 102, 241, 0.1));
	}

	:global(.light) .stat-icon {
		background: rgba(194, 65, 12, 0.1);
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.stat-breakdown {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}

	.stat-unit-wrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
	}

	.stat-unit {
		font-size: 0.95rem;
		font-weight: 800;
		color: var(--color-accent);
		background: var(--color-accent-bg, rgba(99, 102, 241, 0.12));
		padding: 2px 8px;
		border-radius: 6px;
		line-height: 1.3;
		letter-spacing: 0.01em;
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, transparent);
		min-width: 40px;
		text-align: center;
	}

	.stat-unit-label {
		font-size: 0.6rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		opacity: 0.75;
	}

	.stat-sub-row {
		display: flex;
		gap: 6px;
		margin-top: 2px;
	}

	.stat-sub-badge {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		padding: 3px 12px;
		border-radius: 6px;
		border: 1px solid var(--color-border);
		line-height: 1.4;
	}

	:global(.light) .stat-unit {
		background: rgba(194, 65, 12, 0.1);
		border-color: rgba(194, 65, 12, 0.2);
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

	.chart-card.span-3 {
		grid-column: span 3;
	}

	@media (max-width: 1399px) {
		.chart-card.span-2,
		.chart-card.span-3 {
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

	.recent-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 16px;
		border-top: 1px solid var(--color-border);
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

	@media (min-width: 768px) {
		.ratings-categories {
			grid-template-columns: repeat(3, 1fr);
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
		gap: 4px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 10px;
		padding: 6px;
	}

	.rating-entry {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
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
		width: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--color-accent);
		text-align: center;
		flex-shrink: 0;
	}

	.rating-pos.worst {
		color: #ef4444;
	}

	.rating-cover {
		width: 30px;
		height: 42px;
		border-radius: 4px;
		object-fit: cover;
		flex-shrink: 0;
		background: var(--color-surface-elevated);
	}

	.rating-game {
		flex: 1;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		min-width: 0;
	}

	.rating-value-accent {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-accent);
		flex-shrink: 0;
	}

	.rating-value-worst {
		font-size: 0.85rem;
		font-weight: 700;
		color: #ef4444;
		flex-shrink: 0;
	}

	.rating-divider {
		height: 1px;
		background: var(--color-border);
		margin: 2px 8px;
		opacity: 0.6;
	}

	.section-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.section-header-left {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.section-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.section-sub {
		margin: 0;
		font-size: 0.8rem;
		color: var(--color-text-secondary);
	}

	.view-all-btn {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 8px 16px;
		border: 1px solid var(--color-border);
		border-radius: 8px;
		background: var(--color-surface);
		color: var(--color-accent);
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	@media (hover: hover) {
		.view-all-btn:hover {
			background: var(--color-accent-bg, rgba(99, 102, 241, 0.08));
			border-color: var(--color-accent);
			transform: translateY(-1px);
		}
	}

	.recent-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 12px;
		width: 100%;
	}

	@media (min-width: 640px) {
		.recent-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (min-width: 900px) {
		.recent-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	@media (min-width: 1200px) {
		.recent-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	@media (min-width: 768px) {
		.np-card {
			min-height: unset;
		}
		.np-title {
			font-size: 1.75rem;
		}
	}
</style>

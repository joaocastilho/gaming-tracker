<script lang="ts">
import {
	BarChart3,
	Calendar,
	Clock,
	Disc3,
	Gamepad2,
	Hourglass,
	Library,
	NotebookPen,
	Play,
	Presentation,
	Star,
	Timer,
	TrendingUp,
	Trophy,
} from '@lucide/svelte';

import Chart from '#lib/components/Chart.svelte';
import { appStore } from '#lib/stores/app.svelte.js';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { modalStore } from '#lib/stores/modal.svelte.js';
import { imageErrorStore } from '#lib/stores/imageErrors.svelte.js';
import { computeBacklogStats } from '#lib/utils/backlogUtils.js';
import { getMonthlyHeatClass, getMonthlyMax } from '#lib/utils/heatmapUtils.js';
import {
	computeAveragePlaytimeMinutes,
	computeMedianPlaytimeMinutes,
	computeTotalPlaytimeMinutes,
	formatMinutes,
} from '#lib/utils/playtimeUtils.js';
import {
	buildGenreChart,
	buildPlaytimeChart,
	buildScoreChart,
	buildTierChart,
	buildYearChart,
} from '#lib/utils/statsCharts.js';
import { computeAverageScore, computeGenreStats, getNextMilestone, type GenreStat } from '#lib/utils/statsUtils.js';
import { computeTopRated, computeYearMonthAggregates, countInYear, minutesInYear } from '#lib/utils/statsAggregates.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

let games = $derived(gamesStore.games);

let completedGames = $derived(games.filter((g) => g.status === 'Completed'));

let totalPlaytimeMinutes = $derived(computeTotalPlaytimeMinutes(completedGames));
let totalPlaytimeFormatted = $derived(formatMinutes(totalPlaytimeMinutes));

let completedCount = $derived(completedGames.length);
let plannedCount = $derived(games.filter((g) => g.status === 'Planned').length);
let playingCount = $derived(games.filter((g) => g.status === 'Playing').length);

// Average and median both ignore games without playtime so the two pills
// always describe the same population.
let avgPlaytimeMinutes = $derived(computeAveragePlaytimeMinutes(completedGames));
let medianPlaytimeMinutes = $derived(computeMedianPlaytimeMinutes(completedGames));

let backlogStats = $derived(computeBacklogStats(games));
let nextBacklogMilestone = $derived(getNextMilestone(backlogStats.completed.pctHours));
let backlogMilestoneGap = $derived(Math.max(0, nextBacklogMilestone - backlogStats.completed.pctHours));
let backlogPctHoursLabel = $derived(
	backlogStats.total.minutes === 0 ? '0%' : `${backlogStats.completed.pctHours.toFixed(1)}%`
);
let backlogRemainingLabel = $derived(
	backlogStats.backlog.minutes === 0 ? '0h' : formatMinutes(backlogStats.backlog.minutes)
);
let backlogHoursPctCompleted = $derived(backlogStats.completed.pctHours);
let backlogHoursPctPlaying = $derived(backlogStats.playing.pctHours);
let backlogHoursPctPlanned = $derived(backlogStats.planned.pctHours);

// Ensure tiny Playing slices remain visible (at least ~1% when present) by stealing from Planned
let displayHoursPctPlaying = $derived(
	backlogStats.playing.minutes > 0 && backlogHoursPctPlaying > 0 && backlogHoursPctPlaying < 1
		? 1
		: backlogHoursPctPlaying
);
let displayHoursPctPlanned = $derived(
	Math.max(0, backlogHoursPctPlanned - (displayHoursPctPlaying - backlogHoursPctPlaying))
);

let avgScore = $derived(computeAverageScore(completedGames));

let now = $state(new Date());
$effect(() => {
	// Keep "{year} playtime" honest on tabs left open across New Year's.
	const interval = setInterval(() => {
		now = new Date();
	}, 60_000);
	return () => clearInterval(interval);
});
let currentYear = $derived(now.getFullYear());

// One pass over completedGames replaces the previous per-derivation date
// work (gamesThisYear, yearAllStats, backlogEta, yearlyMonthData each used
// to re-filter the array and re-parse every finishedDate).
let yearAggregates = $derived(computeYearMonthAggregates(completedGames));

let gamesThisYearCount = $derived(countInYear(yearAggregates, currentYear));
let playtimeThisYear = $derived(formatMinutes(minutesInYear(yearAggregates, currentYear)));

let genreStats = $derived(computeGenreStats(completedGames));
let scoreChart = $derived(buildScoreChart(completedGames));
let ratedCount = $derived(
	completedGames.filter((game) => game.score != null && game.score >= 0 && game.score <= 20).length
);
let topGenreByAvg = $derived.by(() => {
	const wellRated = genreStats.filter((genre) => genre.ratedCount >= 3);
	return (wellRated.length > 0 ? wellRated : genreStats).reduce<GenreStat | null>((best, genre) => {
		if (!best || genre.averageScore > best.averageScore) return genre;
		return best;
	}, null);
});

let backlogEta = $derived.by(() => {
	const lastYears = [currentYear - 1, currentYear - 2, currentYear - 3];
	const perYear: number[] = [];
	for (const y of lastYears) {
		const c = countInYear(yearAggregates, y);
		if (c > 0) perYear.push(c);
	}
	const avg = perYear.length === 0 ? 0 : perYear.reduce((a, b) => a + b, 0) / perYear.length;
	if (avg === 0 || backlogStats.backlog.count === 0) return null;
	const years = backlogStats.backlog.count / avg;
	return {
		avgPerYear: Math.round(avg * 10) / 10,
		years: Math.round(years * 10) / 10,
		label: years < 1 ? `${Math.round(years * 12)} months` : `${years.toFixed(1)} years`,
	};
});

let tierChart = $derived(buildTierChart(completedGames));

let genreChart = $derived(buildGenreChart(completedGames, appStore.theme));

let playtimeChart = $derived(buildPlaytimeChart(completedGames));

let yearChart = $derived(buildYearChart(completedGames, appStore.theme));

// Number of year bars — drives the scrollable minimum width so bars keep a
// readable minimum width on narrow viewports instead of squeezing together.
let yearCount = $derived(yearChart.data.labels?.length ?? 0);

let yearlyMonthData = $derived(
	yearAggregates.years.map((yearData) => ({ year: yearData.year, data: yearData.months }))
);

let maxMonthly = $derived(getMonthlyMax(yearlyMonthData));

let topRated = $derived(computeTopRated(completedGames));

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';

// Same fallback as the home and grid cards: a cover whose generated assets
// don't exist yet (optimize-covers still running) must show the no-cover
// placeholder instead of a broken image.
function coverSource(coverImage: string): string {
	if (!coverImage || imageErrorStore.hasFailed(`/${coverImage}`)) {
		return PLACEHOLDER_SRC;
	}
	return `/${coverImage}`;
}

function handleCoverError(event: Event) {
	const target = event.currentTarget;
	if (!(target instanceof HTMLImageElement)) return;
	// Already on the placeholder; don't re-request a URL that just failed.
	if (target.getAttribute('src')?.includes('placeholder_cover')) return;

	const failedSrc = target.currentSrc || target.src;
	if (failedSrc && !failedSrc.includes('placeholder_cover')) {
		imageErrorStore.markFailed(failedSrc);
	}
	target.src = PLACEHOLDER_SRC;
}
</script>

<div class="stats-page">
	<div class="stats-content">
		<header class="stats-intro">
			<div class="stats-intro-copy">
				<div class="stats-eyebrow"><Disc3 size={14} /> Collection insights</div>
				<h1>Your gaming, in numbers.</h1>
				<p>A clear look at what you play, how much you play, and how your library is changing.</p>
			</div>
			<div class="library-total" aria-label="{backlogStats.total.count} games in your library">
				<span class="library-total-label">Library</span>
				<strong>{backlogStats.total.count}</strong>
				<span class="library-total-caption">tracked games</span>
			</div>
		</header>

		<section class="stats-grid" aria-label="Library summary">
			<article class="stat-card stat-card--playtime">
				<div class="stat-card-head">
					<div class="stat-icon" aria-hidden="true"><Clock size={17} /></div>
					<div>
						<p class="stat-label">Total played</p>
						<p class="stat-context">Across {completedCount} completed games</p>
					</div>
				</div>
				<div class="stat-value">{totalPlaytimeFormatted}</div>
				<div class="stat-pills">
					<span class="stat-pill"><Timer size={12} /> {formatMinutes(avgPlaytimeMinutes)} avg</span>
					<span class="stat-pill">{formatMinutes(medianPlaytimeMinutes)} median</span>
				</div>
			</article>

			<article class="stat-card stat-card--progress">
				<div class="stat-card-head">
					<div class="stat-icon" aria-hidden="true"><Trophy size={17} /></div>
					<div>
						<p class="stat-label">Completed</p>
						<p class="stat-context">{backlogStats.completed.pctCount.toFixed(1)}% of your library</p>
					</div>
				</div>
				<div class="stat-value">{completedCount}<span class="stat-value-suffix">/{backlogStats.total.count}</span></div>
				<div class="stat-pills">
					<span class="stat-pill">{playingCount} playing</span>
					<span class="stat-pill">{plannedCount} planned</span>
				</div>
			</article>

			<article class="stat-card stat-card--score">
				<div class="stat-card-head">
					<div class="stat-icon" aria-hidden="true"><Star size={17} /></div>
					<div>
						<p class="stat-label">Average score</p>
						<p class="stat-context">Your personal ratings</p>
					</div>
				</div>
				<div class="stat-value">{avgScore}<span class="stat-value-suffix">/20</span></div>
				<div class="stat-pills">
					{#if topGenreByAvg}
						<span class="stat-pill">Top: {topGenreByAvg.name} · {topGenreByAvg.averageScore}</span>
					{:else}
						<span class="stat-pill">{ratedCount} rated</span>
					{/if}
				</div>
			</article>

			<article class="stat-card stat-card--year">
				<div class="stat-card-head">
					<div class="stat-icon" aria-hidden="true"><Calendar size={17} /></div>
					<div>
						<p class="stat-label">{currentYear} playtime</p>
						<p class="stat-context">{gamesThisYearCount} games finished</p>
					</div>
				</div>
				<div class="stat-value">{playtimeThisYear}</div>
				<div class="stat-pills">
					{#if yearAggregates.totalYears > 0}
						<span class="stat-pill">{yearAggregates.firstYear}–{yearAggregates.lastYear}</span>
						<span class="stat-pill">Peak: {yearAggregates.bestYear}</span>
					{/if}
				</div>
			</article>
		</section>

		<section class="backlog-card" aria-labelledby="backlog-title">
			<div class="backlog-header">
				<div class="backlog-title-wrap">
					<div class="backlog-icon" aria-hidden="true">
						<Hourglass size={16} />
					</div>
					<div class="backlog-heading">
						<h3 id="backlog-title" class="backlog-title">Backlog Journey</h3>
						<p class="backlog-sub">Hours converting from planned to played — <span class="backlog-highlight-playing"><Play size={10} /> playing</span> is backlog in progress</p>
					</div>
				</div>
				<div class="journey-progress-summary">
					<div
						class="journey-ring"
						style="--journey-progress: {backlogStats.completed.pctHours}%"
						role="progressbar"
						aria-valuenow={Math.round(backlogStats.completed.pctHours)}
						aria-valuemin={0}
						aria-valuemax={100}
						aria-label="{backlogStats.completed.pctHours.toFixed(1)}% of planned hours cleared"
					>
						<div class="journey-ring-inner">
							<strong>{backlogPctHoursLabel}</strong>
							<span>cleared</span>
						</div>
					</div>
					<div class="journey-next-milestone">
						<span>Next milestone</span>
						{#if backlogStats.total.count === 0}
							<strong>—</strong>
							<small>No games tracked yet</small>
						{:else}
							<strong>{nextBacklogMilestone}%</strong>
							<small>{nextBacklogMilestone === 100 ? 'All milestones reached' : `${backlogMilestoneGap.toFixed(1)}% of hours to go`}</small>
						{/if}
					</div>
				</div>
			</div>

			<div class="backlog-unified">
				<div class="backlog-metric-head">
					<span class="backlog-metric-label"><Library size={11} /> Library progress</span>
					<span class="backlog-metric-total">
						{formatMinutes(backlogStats.total.minutes)} total · {backlogStats.total.count} games
						{#if playingCount > 0}
							<small class="backlog-playing-total">Includes {formatMinutes(backlogStats.playing.minutes)} currently playing</small>
						{/if}
					</span>
				</div>
				<div
					class="backlog-bar backlog-unified-bar"
					role="progressbar"
					aria-valuenow={Math.round(backlogStats.completed.pctHours)}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="Library progress: {backlogStats.completed.pctHours.toFixed(1)}% of hours completed, {backlogStats.completed.pctCount.toFixed(1)}% of games completed"
					title="Completed {formatMinutes(backlogStats.completed.minutes)} · {backlogStats.completed.count} games"
				>
					{#if backlogHoursPctCompleted > 0}
						<div
							class="backlog-seg seg-completed"
							style="width: {backlogHoursPctCompleted}%"
							title="Completed — {formatMinutes(backlogStats.completed.minutes)} · {backlogStats.completed.count} games ({backlogStats.completed.pctHours.toFixed(1)}% of hours)"
						>
							{#if backlogHoursPctCompleted >= 10}
								<span class="seg-label"><strong>{formatMinutes(backlogStats.completed.minutes)}</strong><small>{backlogStats.completed.count} games</small></span>
							{:else if backlogHoursPctCompleted >= 7}
								<span class="seg-label">{backlogStats.completed.pctHours.toFixed(0)}%</span>
							{/if}
						</div>
					{/if}
					{#if backlogHoursPctPlaying > 0}
						<div
							class="backlog-seg seg-playing"
							style="width: {displayHoursPctPlaying}%"
							title="Playing — {formatMinutes(backlogStats.playing.minutes)} · {backlogStats.playing.count} games ({backlogStats.playing.pctHours.toFixed(1)}% of hours)"
						>
							{#if displayHoursPctPlaying >= 10}
								<span class="seg-label seg-label-playing"><strong>{formatMinutes(backlogStats.playing.minutes)}</strong><small>{backlogStats.playing.count} games</small></span>
							{:else if displayHoursPctPlaying >= 4}
								<span class="seg-label seg-label-playing">{backlogStats.playing.pctHours.toFixed(0)}%</span>
							{/if}
						</div>
					{/if}
					{#if backlogHoursPctPlanned > 0}
						<div
							class="backlog-seg seg-planned"
							style="width: {displayHoursPctPlanned}%"
							title="Planned — {formatMinutes(backlogStats.planned.minutes)} · {backlogStats.planned.count} games ({backlogStats.planned.pctHours.toFixed(1)}% of hours)"
						>
							{#if backlogHoursPctPlanned >= 10}
								<span class="seg-label seg-label-planned"><strong>{formatMinutes(backlogStats.planned.minutes)}</strong><small>{backlogStats.planned.count} games</small></span>
							{:else if backlogHoursPctPlanned >= 7}
								<span class="seg-label seg-label-planned">{backlogStats.planned.pctHours.toFixed(0)}%</span>
							{/if}
						</div>
					{/if}
				</div>
			</div>

			<div class="backlog-legend">
				<div class="legend-item">
					<span class="legend-dot dot-completed" aria-hidden="true"></span>
					<span class="legend-key">
						<span class="legend-label">Completed</span>
						<span class="legend-value">{formatMinutes(backlogStats.completed.minutes)} · {backlogStats.completed.count} games · {backlogStats.completed.pctHours.toFixed(1)}% of hours</span>
					</span>
				</div>
				<div class="legend-item">
					<span class="legend-dot dot-playing" aria-hidden="true"></span>
					<span class="legend-key">
						<span class="legend-label">Playing</span>
						<span class="legend-value">{formatMinutes(backlogStats.playing.minutes)} · {backlogStats.playing.count} games · {backlogStats.playing.pctHours.toFixed(1)}% of hours</span>
					</span>
				</div>
				<div class="legend-item">
					<span class="legend-dot dot-planned" aria-hidden="true"></span>
					<span class="legend-key">
						<span class="legend-label">Planned</span>
						<span class="legend-value">{formatMinutes(backlogStats.planned.minutes)} · {backlogStats.planned.count} games · {backlogStats.planned.pctHours.toFixed(1)}% of hours</span>
					</span>
				</div>
			</div>

			<div class="backlog-footer">
				<span class="backlog-footer-main">
					<Hourglass size={12} />
					{backlogRemainingLabel} · {backlogStats.backlog.count} games remaining
				</span>
				<span class="backlog-footer-sep" aria-hidden="true">·</span>
				<span class="backlog-footer-secondary">{backlogStats.completed.count} of {backlogStats.total.count} games cleared · {backlogStats.completed.pctCount.toFixed(1)}% of games</span>
				{#if backlogEta}
					<span class="backlog-footer-sep" aria-hidden="true">·</span>
					<span class="backlog-footer-eta" title="Based on avg {backlogEta.avgPerYear}/year last 3 years">
						<TrendingUp size={12} /> ~{backlogEta.label} at {backlogEta.avgPerYear}/yr
					</span>
				{/if}
			</div>
		</section>

		<section class="analysis-section" aria-labelledby="analysis-title">
			<div class="section-header">
				<div>
					<span class="section-eyebrow">Collection patterns</span>
					<h2 id="analysis-title">How your library breaks down</h2>
				</div>
				<p>Compare ratings, genres, playtime, and completion habits across your collection.</p>
			</div>

			<div class="charts-grid">
				<article class="chart-card">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon tier-icon" aria-hidden="true"><Trophy size={16} /></div>
							<div>
								<h3 class="chart-title">Tier distribution</h3>
								<p class="chart-sub">How your completed games fall across each tier</p>
							</div>
						</div>
						<span class="chart-badge">{completedCount} games</span>
					</div>
					<div class="chart-body">
						<Chart type="bar" data={tierChart.data} options={tierChart.options} height={360} />
					</div>
				</article>

				<article class="chart-card">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon genre-icon" aria-hidden="true"><Disc3 size={16} /></div>
							<div>
								<h3 class="chart-title">Genre breakdown</h3>
								<p class="chart-sub">Every completed genre, ranked by game count</p>
							</div>
						</div>
						<span class="chart-badge">{genreStats.length} genres</span>
					</div>
					<div class="chart-body">
						<Chart type="bar" data={genreChart.data} options={genreChart.options} height={360} />
					</div>
				</article>

				<article class="chart-card chart-card--wide">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon playtime-icon" aria-hidden="true"><Timer size={16} /></div>
							<div>
								<h3 class="chart-title">Playtime distribution</h3>
								<p class="chart-sub">The game-length ranges that define your year</p>
							</div>
						</div>
						<span class="chart-badge">{formatMinutes(medianPlaytimeMinutes)} median</span>
					</div>
					<div class="chart-body">
						<Chart type="bar" data={playtimeChart.data} options={playtimeChart.options} height={360} />
					</div>
				</article>

				<article class="chart-card chart-card--year">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon year-icon" aria-hidden="true"><TrendingUp size={16} /></div>
							<div>
								<h3 class="chart-title">Year over year</h3>
								<p class="chart-sub">Annual completions with your cumulative total</p>
							</div>
						</div>
						<span class="chart-badge">Peak {yearAggregates.bestYear || '—'}</span>
					</div>
					<div class="chart-body chart-body-year">
						<div class="year-scroll">
							<div class="year-scroll-inner" style="min-width: {Math.max(yearCount * 64, 280)}px;">
								<Chart type="bar" data={yearChart.data} options={yearChart.options} height={300} />
							</div>
						</div>
					</div>
				</article>

				<article class="chart-card">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon rating-icon" aria-hidden="true"><BarChart3 size={16} /></div>
							<div>
								<h3 class="chart-title">Rating distribution</h3>
								<p class="chart-sub">See how your personal scores cluster</p>
							</div>
						</div>
						<span class="chart-badge">{ratedCount} rated</span>
					</div>
					<div class="chart-body">
						<Chart type="bar" data={scoreChart.data} options={scoreChart.options} height={300} />
					</div>
				</article>

				<article class="chart-card chart-card--months">
					<div class="chart-header">
						<div class="chart-heading">
							<div class="chart-icon months-icon" aria-hidden="true"><Calendar size={16} /></div>
							<div>
								<h3 class="chart-title">Monthly breakdown</h3>
								<p class="chart-sub">A completion heatmap for every month on record</p>
							</div>
						</div>
						<span class="chart-badge">Peak {maxMonthly > 0 ? `${maxMonthly}/mo` : '—'}</span>
					</div>
					<div class="monthly-table-scroll">
						<div class="monthly-table">
							<div class="mt-row mt-header">
								<span class="mt-year"></span>
								{#each MONTHS as month}<span class="mt-cell mt-header-cell">{month}</span>{/each}
								<span class="mt-cell mt-header-cell mt-total">Total</span>
							</div>
							{#each yearlyMonthData as yearData}
								<div class="mt-row">
									<span class="mt-year">{yearData.year}</span>
									{#each yearData.data as value}
										<span class="mt-cell {getMonthlyHeatClass(value, maxMonthly)}">{value}</span>
									{/each}
									<span class="mt-cell mt-total">{yearData.data.reduce((total, value) => total + value, 0)}</span>
								</div>
							{/each}
						</div>
					</div>
				</article>
			</div>
		</section>

		<section class="ratings-section" aria-labelledby="ratings-title">
			<div class="section-header">
				<div>
					<span class="section-eyebrow">Personal bests</span>
					<h2 id="ratings-title">Top rated games</h2>
				</div>
				<p>Your ten highest-rated titles across each scoring category.</p>
			</div>
			<div class="ratings-categories">
				<div class="rating-category">
					<h4 class="rating-cat-title" style="border-bottom-color: #f43f5e;">
						<Presentation size={16} style="color: #f43f5e;" />
						Presentation
					</h4>
					<div class="rating-list">
						{#each topRated.presentation as game, i}
							{@const ratingCover = coverSource(game.coverImage)}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src={ratingCover} alt="" loading="lazy" onerror={handleCoverError} />
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
						{#each topRated.story as game, i}
							{@const ratingCover = coverSource(game.coverImage)}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src={ratingCover} alt="" loading="lazy" onerror={handleCoverError} />
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
						{#each topRated.gameplay as game, i}
							{@const ratingCover = coverSource(game.coverImage)}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src={ratingCover} alt="" loading="lazy" onerror={handleCoverError} />
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
						{#each topRated.score as game, i}
							{@const ratingCover = coverSource(game.coverImage)}
							<button type="button" class="rating-entry" onclick={() => modalStore.openViewModal(game, [game])}>
								<span class="rating-pos">{i + 1}</span>
								<img class="rating-cover" src={ratingCover} alt="" loading="lazy" onerror={handleCoverError} />
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

	.stats-intro {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24px;
		padding: 28px;
		border: 1px solid var(--color-border);
		border-radius: 18px;
		background:
			radial-gradient(circle at 88% 20%, color-mix(in srgb, var(--color-accent) 16%, transparent), transparent 34%),
			var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.stats-intro-copy {
		max-width: 760px;
	}

	.stats-eyebrow,
	.section-eyebrow {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--color-accent);
	}

	.stats-intro h1 {
		margin: 8px 0 6px;
		font-size: clamp(1.8rem, 4vw, 3rem);
		line-height: 1.08;
		letter-spacing: -0.035em;
		color: var(--color-text-primary);
	}

	.stats-intro p {
		max-width: 680px;
		margin: 0;
		font-size: 0.96rem;
		line-height: 1.6;
		color: var(--color-text-secondary);
	}

	.library-total {
		display: flex;
		flex: 0 0 148px;
		flex-direction: column;
		align-items: center;
		padding: 16px;
		border: 1px solid color-mix(in srgb, var(--color-accent) 20%, var(--color-border));
		border-radius: 14px;
		background: color-mix(in srgb, var(--color-surface-elevated) 84%, transparent);
	}

	.library-total-label,
	.library-total-caption {
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}

	.library-total strong {
		margin: 2px 0;
		font-size: 2.2rem;
		line-height: 1;
		color: var(--color-text-primary);
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 14px;
		align-items: stretch;
	}

	.stat-card {
		--stat-color: var(--color-accent);
		position: relative;
		display: flex;
		min-width: 0;
		min-height: 178px;
		flex-direction: column;
		gap: 18px;
		padding: 20px;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		inset: 0 0 auto;
		height: 3px;
		background: linear-gradient(90deg, var(--stat-color), color-mix(in srgb, var(--stat-color) 28%, transparent));
	}

	.stat-card--playtime {
		--stat-color: #06b6d4;
	}

	.stat-card--progress {
		--stat-color: #22c55e;
	}

	.stat-card--score {
		--stat-color: #f59e0b;
	}

	.stat-card--year {
		--stat-color: #8b5cf6;
	}

	.stat-card-head,
	.stat-icon,
	.stat-pill {
		display: flex;
		align-items: center;
	}

	.stat-card-head {
		gap: 11px;
	}

	.stat-icon {
		justify-content: center;
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		border: 1px solid color-mix(in srgb, var(--stat-color) 22%, transparent);
		border-radius: 10px;
		color: var(--stat-color);
		background: color-mix(in srgb, var(--stat-color) 11%, transparent);
	}

	.stat-label,
	.stat-context,
	.stat-value {
		margin: 0;
	}

	.stat-label {
		font-size: 0.84rem;
		font-weight: 750;
		line-height: 1.3;
		color: var(--color-text-primary);
	}

	.stat-context {
		margin-top: 2px;
		font-size: 0.76rem;
		line-height: 1.4;
		color: var(--color-text-secondary);
	}

	.stat-value {
		font-size: clamp(1.55rem, 2.5vw, 2.15rem);
		font-weight: 780;
		line-height: 1.1;
		letter-spacing: -0.035em;
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.stat-value-suffix {
		margin-left: 3px;
		font-size: 0.95rem;
		font-weight: 650;
		letter-spacing: 0;
		color: var(--color-text-tertiary);
	}

	.stat-pills {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-top: auto;
	}

	.stat-pill {
		min-height: 27px;
		gap: 5px;
		padding: 3px 9px;
		border: 1px solid color-mix(in srgb, var(--stat-color) 18%, transparent);
		border-radius: 999px;
		font-size: 0.75rem;
		font-weight: 700;
		line-height: 1.3;
		color: var(--color-text-secondary);
		background: color-mix(in srgb, var(--stat-color) 7%, var(--color-surface-elevated));
	}

	.analysis-section,
	.ratings-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 18px;
		border-top: 1px solid var(--color-border);
	}

	.section-header {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
	}

	.section-header h2 {
		margin: 4px 0 0;
		font-size: clamp(1.2rem, 2vw, 1.5rem);
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--color-text-primary);
	}

	.section-header > p {
		max-width: 520px;
		margin: 0;
		font-size: 0.86rem;
		line-height: 1.5;
		text-align: right;
		color: var(--color-text-secondary);
	}

	.charts-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
	}

	@media (min-width: 900px) {
		.charts-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}

		.chart-card--wide {
			grid-column: 1 / -1;
		}
	}

	@media (min-width: 1400px) {
		.charts-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.chart-card--wide {
			grid-column: auto;
		}

		.chart-card--year {
			grid-column: span 2;
		}
	}

	@media (max-width: 767px) {
		.stats-intro {
			align-items: flex-start;
			padding: 20px;
		}

		.library-total {
			flex-basis: 116px;
			padding: 12px;
		}

		.library-total strong {
			font-size: 1.8rem;
		}

		.section-header {
			align-items: flex-start;
			flex-direction: column;
			gap: 8px;
		}

		.section-header > p {
			text-align: left;
		}
	}

	@media (max-width: 479px) {
		.stats-intro {
			flex-direction: column;
		}

		.library-total {
			width: 100%;
			flex-basis: auto;
			flex-direction: row;
			justify-content: space-between;
		}

		.stats-grid {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.stat-card {
			min-height: 164px;
			padding: 16px;
		}
	}

	.chart-card {
		display: flex;
		min-width: 0;
		flex-direction: column;
		padding: 20px;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: var(--color-surface);
		box-shadow: var(--shadow-sm);
	}

	.chart-card--months {
		grid-column: 1 / -1;
	}

	.chart-header,
	.chart-heading,
	.chart-icon,
	.chart-badge {
		display: flex;
		align-items: center;
	}

	.chart-header {
		justify-content: space-between;
		gap: 16px;
	}

	.chart-heading {
		min-width: 0;
		gap: 11px;
	}

	.chart-icon {
		justify-content: center;
		width: 36px;
		height: 36px;
		flex: 0 0 36px;
		border-radius: 10px;
	}

	.tier-icon {
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.12);
	}

	.genre-icon {
		color: #ec4899;
		background: rgba(236, 72, 153, 0.12);
	}

	.playtime-icon {
		color: #06b6d4;
		background: rgba(6, 182, 212, 0.12);
	}

	.year-icon {
		color: #6366f1;
		background: rgba(99, 102, 241, 0.12);
	}

	.months-icon {
		color: #8b5cf6;
		background: rgba(139, 92, 246, 0.12);
	}

	.rating-icon {
		color: #f59e0b;
		background: rgba(245, 158, 11, 0.12);
	}

	.chart-title,
	.chart-sub {
		margin: 0;
	}

	.chart-title {
		font-size: 1rem;
		font-weight: 750;
		line-height: 1.3;
		color: var(--color-text-primary);
	}

	.chart-sub {
		margin-top: 3px;
		font-size: 0.78rem;
		line-height: 1.4;
		color: var(--color-text-secondary);
	}

	.chart-badge {
		min-height: 28px;
		flex: 0 0 auto;
		padding: 4px 10px;
		border: 1px solid var(--color-border);
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 750;
		white-space: nowrap;
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
	}

	.chart-body {
		min-height: 0;
		margin-top: 18px;
		flex: 1;
	}

	.chart-body-year {
		min-width: 0;
	}

	.year-scroll {
		overflow-x: auto;
		overflow-y: hidden;
		-webkit-overflow-scrolling: touch;
		scrollbar-width: thin;
		margin: 0 -4px;
		padding: 0 4px 4px 4px;
	}

	.year-scroll-inner {
		width: 100%;
	}

	.monthly-table-scroll {
		margin-top: 18px;
		overflow-x: auto;
		padding-bottom: 4px;
	}

	.monthly-table {
		display: flex;
		min-width: 700px;
		flex-direction: column;
		gap: 3px;
		font-size: 0.83rem;
	}

	.mt-row {
		display: grid;
		grid-template-columns: 52px repeat(12, minmax(34px, 1fr)) 52px;
		gap: 3px;
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
		font-size: 0.85rem;
	}

	.mt-cell {
		text-align: center;
		padding: 4px 2px;
		border-radius: 4px;
		font-weight: 600;
		color: var(--color-text-secondary);
		background: var(--color-surface-elevated);
		font-size: 0.87rem;
	}

	.mt-header-cell {
		font-weight: 700;
		color: var(--color-text-primary);
		background: var(--color-surface);
		font-size: 0.76rem;
		text-transform: uppercase;
	}

	.mt-heat-1 {
		background: var(--heat-1-bg);
		color: var(--heat-1-text);
		font-weight: 700;
	}

	.mt-heat-2 {
		background: var(--heat-2-bg);
		color: var(--heat-2-text);
		font-weight: 700;
	}

	.mt-heat-3 {
		background: var(--heat-3-bg);
		color: var(--heat-3-text);
		font-weight: 700;
	}

	.mt-heat-4 {
		background: var(--heat-4-bg);
		color: #ffffff;
		font-weight: 800;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
	}

	.mt-heat-5 {
		background: var(--heat-5-bg);
		color: #ffffff;
		font-weight: 800;
		box-shadow:
			inset 0 0 0 1px rgba(255, 255, 255, 0.18),
			0 0 10px rgba(239, 68, 68, 0.35);
	}

	:global(.light) .mt-heat-4 {
		color: #ffffff;
	}

	:global(.light) .mt-heat-5 {
		color: #ffffff;
	}

	.mt-total {
		font-weight: 700;
		color: var(--color-text-primary);
	}

	@media (max-width: 767px) {
		.chart-card--months {
			display: none;
		}

		.charts-grid {
			gap: 12px;
		}

		.chart-card {
			padding: 14px;
		}

		.chart-header {
			align-items: flex-start;
		}

		.chart-icon {
			width: 32px;
			height: 32px;
			flex-basis: 32px;
		}

		.chart-badge {
			padding-inline: 8px;
			font-size: 0.68rem;
		}

		.mt-cell {
			padding: 3px 1px;
			font-size: 0.8rem;
		}
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
		font-size: 0.90rem;
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

	.rating-empty {
		font-size: 0.78rem;
		color: var(--color-text-muted);
		text-align: center;
		padding: 8px;
		font-style: italic;
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
		font-size: 0.74rem;
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
		font-size: 0.83rem;
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
			font-size: 0.69rem;
		}
		.rating-game {
			font-size: 0.76rem;
		}
		.rating-value {
			font-size: 0.72rem;
		}
	}

	.backlog-card {
		display: flex;
		flex-direction: column;
		gap: 18px;
		padding: 20px;
		border-radius: 12px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		box-shadow: var(--shadow-sm);
	}

	.backlog-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
	}

	.backlog-title-wrap {
		display: flex;
		gap: 12px;
		align-items: flex-start;
	}

	.backlog-icon {
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

	:global(.light) .backlog-icon {
		background: rgba(194, 65, 12, 0.1);
	}

	.backlog-heading {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.backlog-title {
		margin: 0;
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.backlog-sub {
		margin: 2px 0 0 0;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.backlog-highlight-playing {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		color: #f59e0b;
		font-weight: 700;
	}

	:global(.light) .backlog-highlight-playing {
		color: #d97706;
	}

	.journey-progress-summary {
		display: flex;
		align-items: center;
		gap: 12px;
		flex-shrink: 0;
	}

	.journey-ring {
		--journey-progress: 0%;
		display: grid;
		width: 104px;
		height: 104px;
		padding: 5px;
		place-items: center;
		border-radius: 50%;
		background: conic-gradient(var(--color-accent) var(--journey-progress), var(--color-surface-elevated) 0);
		box-shadow: 0 0 0 1px var(--color-border), 0 0 20px color-mix(in srgb, var(--color-accent) 16%, transparent);
	}

	.journey-ring-inner {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		border-radius: 50%;
		background: var(--color-surface);
	}

	.journey-ring-inner strong {
		font-size: 1.45rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-text-primary);
	}

	.journey-ring-inner span {
		margin-top: 4px;
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
	}

	.journey-next-milestone {
		display: flex;
		min-width: 112px;
		flex-direction: column;
		gap: 2px;
	}

	.journey-next-milestone span,
	.journey-next-milestone small {
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	.journey-next-milestone strong {
		font-size: 1.6rem;
		line-height: 1;
		color: var(--color-accent);
	}

	.journey-next-milestone small {
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
	}

	.backlog-unified {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.backlog-unified-bar {
		width: calc(100% + 16px);
		height: 68px;
		margin-left: -8px;
	}

	.backlog-unified-bar .seg-label {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		gap: 2px;
		padding: 0 6px;
		font-size: 0.9rem;
		line-height: 1.05;
	}

	.backlog-unified-bar .seg-label strong {
		font-size: 1rem;
		font-weight: 800;
	}

	.backlog-unified-bar .seg-label small {
		font-size: 0.8rem;
		font-weight: 750;
		white-space: nowrap;
	}

	.backlog-metric-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.backlog-metric-label {
		display: flex;
		align-items: center;
		gap: 5px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		font-size: 0.83rem;
		font-weight: 700;
		color: var(--color-text-primary);
		opacity: 0.9;
	}

	.backlog-metric-total {
		display: flex;
		align-items: flex-end;
		flex-direction: column;
		gap: 2px;
		font-weight: 700;
		color: var(--color-text-primary);
		font-size: 0.9rem;
		text-align: right;
	}

	.backlog-playing-total {
		font-size: 0.68rem;
		font-weight: 700;
		color: #f59e0b;
	}

	:global(.light) .backlog-playing-total {
		color: #d97706;
	}

	.backlog-bar {
		display: flex;
		height: 68px;
		border-radius: 999px;
		overflow: hidden;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		position: relative;
	}

	.backlog-seg {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: width 900ms cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		min-width: 0;
	}

	.backlog-seg.seg-completed {
		background: linear-gradient(90deg, var(--color-accent), #818cf8);
	}

	.backlog-seg.seg-playing {
		background: linear-gradient(90deg, #f59e0b, #fbbf24);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
	}

	.backlog-seg.seg-planned {
		background: linear-gradient(90deg, #334155, #475569);
		border-left: 1px solid rgba(255, 255, 255, 0.08);
	}

	:global(.light) .backlog-seg.seg-completed {
		background: linear-gradient(90deg, #4f46e5, #6366f1);
	}

	:global(.light) .backlog-seg.seg-playing {
		background: linear-gradient(90deg, #d97706, #f59e0b);
	}

	:global(.light) .backlog-seg.seg-planned {
		background: linear-gradient(90deg, #64748b, #94a3b8);
	}

	.seg-label {
		font-size: 0.82rem;
		font-weight: 800;
		color: #ffffff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
		white-space: nowrap;
		padding: 0 8px;
		letter-spacing: 0.02em;
	}

	.seg-label-playing {
		color: #ffffff;
	}

	.seg-label-planned {
		color: #ffffff;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
	}

	:global(.light) .seg-label-planned {
		color: #ffffff;
	}

	.backlog-legend {
		display: grid;
		grid-template-columns: 1fr;
		gap: 10px;
		padding-top: 14px;
		border-top: 1px solid var(--color-border);
	}

	@media (min-width: 640px) {
		.backlog-legend {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	.legend-item {
		display: flex;
		gap: 8px;
		align-items: flex-start;
	}

	.legend-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 3px;
	}

	.legend-dot.dot-completed {
		background: var(--color-accent);
		box-shadow: 0 0 8px color-mix(in srgb, var(--color-accent) 28%, transparent);
	}

	.legend-dot.dot-playing {
		background: #f59e0b;
		box-shadow: 0 0 8px rgba(245, 158, 11, 0.35);
	}

	:global(.light) .legend-dot.dot-playing {
		background: #d97706;
	}

	.legend-dot.dot-planned {
		background: #475569;
		border: 1px solid rgba(255, 255, 255, 0.12);
		box-shadow: 0 0 8px rgba(71, 85, 105, 0.35);
	}

	:global(.light) .legend-dot.dot-planned {
		background: #64748b;
		border-color: #cbd5e1;
	}

	.legend-key {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.legend-label {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.legend-value {
		font-size: 0.82rem;
		color: var(--color-text-secondary);
		line-height: 1.4;
	}

	.backlog-footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
		padding-top: 14px;
		border-top: 1px solid var(--color-border);
		font-size: 0.9rem;
		color: var(--color-text-secondary);
	}

	.backlog-footer-main {
		display: flex;
		align-items: center;
		gap: 6px;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.backlog-footer-secondary {
		color: var(--color-text-secondary);
	}

	.backlog-footer-sep {
		opacity: 0.35;
	}

	.backlog-footer-eta {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-weight: 700;
		color: var(--color-accent);
		background: var(--color-accent-bg, rgba(99, 102, 241, 0.12));
		padding: 2px 8px;
		border-radius: 6px;
		font-size: 0.82rem;
		border: 1px solid color-mix(in srgb, var(--color-accent) 18%, transparent);
	}

	@media (max-width: 639px) {
		.backlog-card {
			padding: 14px;
			gap: 14px;
		}
		.backlog-metric-head {
			flex-wrap: wrap;
			gap: 4px 10px;
		}

		.backlog-metric-total {
			align-items: flex-start;
			text-align: left;
		}

		.backlog-header {
			align-items: stretch;
			flex-direction: column;
		}

		.journey-progress-summary {
			align-self: flex-start;
		}

		.journey-ring {
			width: 88px;
			height: 88px;
		}

		.journey-ring-inner strong {
			font-size: 1.3rem;
		}

		.journey-next-milestone {
			min-width: 100px;
		}

		.journey-milestone {
			font-size: 0.6rem;
		}

		.journey-milestone-dot {
			width: 23px;
			height: 23px;
			border-width: 2px;
			font-size: 0.5rem;
		}

		.backlog-bar {
			height: 28px;
		}
		.backlog-unified-bar {
			width: calc(100% + 12px);
			height: 62px;
			margin-left: -6px;
		}
		.legend-value {
			font-size: 0.8rem;
		}
	}
</style>

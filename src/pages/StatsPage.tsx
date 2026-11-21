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
} from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, createSignal, For, onSettled, Show } from 'solid-js';
import Chart from '#lib/components/Chart.js';
import { appStore } from '#lib/stores/app.js';
import { gamesStore } from '#lib/stores/games.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { modalStore } from '#lib/stores/modal.js';
import { computeBacklogStats } from '#lib/utils/backlogUtils.js';
import { getMonthlyHeatClass, getMonthlyMax } from '#lib/utils/heatmapUtils.js';
import {
	computeAveragePlaytimeMinutes,
	computeMedianPlaytimeMinutes,
	computeTotalPlaytimeMinutes,
	formatMinutes,
} from '#lib/utils/playtimeUtils.js';
import { computeTopRated, computeYearMonthAggregates, countInYear, minutesInYear } from '#lib/utils/statsAggregates.js';
import {
	buildGenreChart,
	buildPlaytimeChart,
	buildScoreChart,
	buildTierChart,
	buildYearChart,
} from '#lib/utils/statsCharts.js';
import { computeAverageScore, computeGenreStats, type GenreStat, getNextMilestone } from '#lib/utils/statsUtils.js';
import './StatsPage.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';

export default function StatsPage(): JSX.Element {
	const [now, setNow] = createSignal(new Date());

	onSettled(() => {
		const interval = setInterval(() => setNow(new Date()), 60_000);
		return () => clearInterval(interval);
	});

	const games = createMemo(() => gamesStore.games);
	const completedGames = createMemo(() => games().filter((g) => g.status === 'Completed'));

	const totalPlaytimeMinutes = createMemo(() => computeTotalPlaytimeMinutes(completedGames()));
	const totalPlaytimeFormatted = createMemo(() => formatMinutes(totalPlaytimeMinutes()));

	const completedCount = createMemo(() => completedGames().length);
	const plannedCount = createMemo(() => games().filter((g) => g.status === 'Planned').length);
	const playingCount = createMemo(() => games().filter((g) => g.status === 'Playing').length);

	const avgPlaytimeMinutes = createMemo(() => computeAveragePlaytimeMinutes(completedGames()));
	const medianPlaytimeMinutes = createMemo(() => computeMedianPlaytimeMinutes(completedGames()));

	const backlogStats = createMemo(() => computeBacklogStats(games()));
	const nextBacklogMilestone = createMemo(() => getNextMilestone(backlogStats().completed.pctHours));
	const backlogMilestoneGap = createMemo(() => Math.max(0, nextBacklogMilestone() - backlogStats().completed.pctHours));
	const backlogPctHoursLabel = createMemo(() =>
		backlogStats().total.minutes === 0 ? '0%' : `${backlogStats().completed.pctHours.toFixed(1)}%`
	);
	const backlogRemainingLabel = createMemo(() =>
		backlogStats().backlog.minutes === 0 ? '0h' : formatMinutes(backlogStats().backlog.minutes)
	);
	const backlogHoursPctCompleted = createMemo(() => backlogStats().completed.pctHours);
	const backlogHoursPctPlaying = createMemo(() => backlogStats().playing.pctHours);
	const backlogHoursPctPlanned = createMemo(() => backlogStats().planned.pctHours);

	const displayHoursPctPlaying = createMemo(() =>
		backlogStats().playing.minutes > 0 && backlogHoursPctPlaying() > 0 && backlogHoursPctPlaying() < 1
			? 1
			: backlogHoursPctPlaying()
	);
	const displayHoursPctPlanned = createMemo(() =>
		Math.max(0, backlogHoursPctPlanned() - (displayHoursPctPlaying() - backlogHoursPctPlaying()))
	);

	const avgScore = createMemo(() => computeAverageScore(completedGames()));
	const currentYear = createMemo(() => now().getFullYear());
	const yearAggregates = createMemo(() => computeYearMonthAggregates(completedGames()));
	const gamesThisYearCount = createMemo(() => countInYear(yearAggregates(), currentYear()));
	const playtimeThisYear = createMemo(() => formatMinutes(minutesInYear(yearAggregates(), currentYear())));

	const genreStats = createMemo(() => computeGenreStats(completedGames()));
	const scoreChart = createMemo(() => buildScoreChart(completedGames()));
	const ratedCount = createMemo(
		() => completedGames().filter((game) => game.score != null && game.score >= 0 && game.score <= 20).length
	);
	const topGenreByAvg = createMemo(() => {
		const stats = genreStats();
		const wellRated = stats.filter((genre) => genre.ratedCount >= 3);
		return (wellRated.length > 0 ? wellRated : stats).reduce<GenreStat | null>((best, genre) => {
			if (!best || genre.averageScore > best.averageScore) return genre;
			return best;
		}, null);
	});

	const backlogEta = createMemo(() => {
		const yr = currentYear();
		const agg = yearAggregates();
		const lastYears = [yr - 1, yr - 2, yr - 3];
		const perYear: number[] = [];
		for (const y of lastYears) {
			const c = countInYear(agg, y);
			if (c > 0) perYear.push(c);
		}
		const avg = perYear.length === 0 ? 0 : perYear.reduce((a, b) => a + b, 0) / perYear.length;
		const backlogCount = backlogStats().backlog.count;
		if (avg === 0 || backlogCount === 0) return null;
		const years = backlogCount / avg;
		return {
			avgPerYear: Math.round(avg * 10) / 10,
			years: Math.round(years * 10) / 10,
			label: years < 1 ? `${Math.round(years * 12)} months` : `${years.toFixed(1)} years`,
		};
	});

	const tierChart = createMemo(() => buildTierChart(completedGames()));
	const genreChart = createMemo(() => buildGenreChart(completedGames(), appStore.theme));
	const playtimeChart = createMemo(() => buildPlaytimeChart(completedGames()));
	const yearChart = createMemo(() => buildYearChart(completedGames(), appStore.theme));
	const yearCount = createMemo(() => yearChart().data.labels?.length ?? 0);

	const yearlyMonthData = createMemo(() =>
		yearAggregates().years.map((yearData) => ({ year: yearData.year, data: yearData.months }))
	);
	const maxMonthly = createMemo(() => getMonthlyMax(yearlyMonthData()));
	const topRated = createMemo(() => computeTopRated(completedGames()));

	function coverSource(coverImage: string): string {
		if (!coverImage || imageErrorStore.hasFailed(`/${coverImage}`)) {
			return PLACEHOLDER_SRC;
		}
		return `/${coverImage}`;
	}

	function handleCoverError(event: Event): void {
		const target = event.currentTarget;
		if (!(target instanceof HTMLImageElement)) return;
		if (target.getAttribute('src')?.includes('placeholder_cover')) return;

		const failedSrc = target.currentSrc || target.src;
		if (failedSrc && !failedSrc.includes('placeholder_cover')) {
			imageErrorStore.markFailed(failedSrc);
		}
		target.src = PLACEHOLDER_SRC;
	}

	return (
		<div class="stats-page">
			<div class="stats-content">
				<header class="stats-intro">
					<div class="stats-intro-copy">
						<div class="stats-eyebrow">
							<Disc3 size={14} /> Collection insights
						</div>
						<h1>Your gaming, in numbers.</h1>
						<p>A clear look at what you play, how much you play, and how your library is changing.</p>
					</div>
					<div class="library-total" role="status" aria-label={`${backlogStats().total.count} games in your library`}>
						<span class="library-total-label">Library</span>
						<strong>{backlogStats().total.count}</strong>
						<span class="library-total-caption">tracked games</span>
					</div>
				</header>

				<section class="stats-grid" aria-label="Library summary">
					<article class="stat-card stat-card--playtime">
						<div class="stat-card-head">
							<div class="stat-icon" aria-hidden="true">
								<Clock size={17} />
							</div>
							<div>
								<p class="stat-label">Total played</p>
								<p class="stat-context">Across {completedCount()} completed games</p>
							</div>
						</div>
						<div class="stat-value">{totalPlaytimeFormatted()}</div>
						<div class="stat-pills">
							<span class="stat-pill">
								<Timer size={12} /> {formatMinutes(avgPlaytimeMinutes())} avg
							</span>
							<span class="stat-pill">{formatMinutes(medianPlaytimeMinutes())} median</span>
						</div>
					</article>

					<article class="stat-card stat-card--progress">
						<div class="stat-card-head">
							<div class="stat-icon" aria-hidden="true">
								<Trophy size={17} />
							</div>
							<div>
								<p class="stat-label">Completed</p>
								<p class="stat-context">{backlogStats().completed.pctCount.toFixed(1)}% of your library</p>
							</div>
						</div>
						<div class="stat-value">
							{completedCount()}
							<span class="stat-value-suffix">/{backlogStats().total.count}</span>
						</div>
						<div class="stat-pills">
							<span class="stat-pill">{playingCount()} playing</span>
							<span class="stat-pill">{plannedCount()} planned</span>
						</div>
					</article>

					<article class="stat-card stat-card--score">
						<div class="stat-card-head">
							<div class="stat-icon" aria-hidden="true">
								<Star size={17} />
							</div>
							<div>
								<p class="stat-label">Average score</p>
								<p class="stat-context">Your personal ratings</p>
							</div>
						</div>
						<div class="stat-value">
							{avgScore()}
							<span class="stat-value-suffix">/20</span>
						</div>
						<div class="stat-pills">
							<Show when={topGenreByAvg()} fallback={<span class="stat-pill">{ratedCount()} rated</span>}>
								{(top) => (
									<span class="stat-pill">
										Top: {top().name} · {top().averageScore}
									</span>
								)}
							</Show>
						</div>
					</article>

					<article class="stat-card stat-card--year">
						<div class="stat-card-head">
							<div class="stat-icon" aria-hidden="true">
								<Calendar size={17} />
							</div>
							<div>
								<p class="stat-label">{currentYear()} playtime</p>
								<p class="stat-context">{gamesThisYearCount()} games finished</p>
							</div>
						</div>
						<div class="stat-value">{playtimeThisYear()}</div>
						<div class="stat-pills">
							<Show when={yearAggregates().totalYears > 0}>
								<span class="stat-pill">
									{yearAggregates().firstYear}–{yearAggregates().lastYear}
								</span>
								<span class="stat-pill">Peak: {yearAggregates().bestYear}</span>
							</Show>
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
								<h3 id="backlog-title" class="backlog-title">
									Backlog Journey
								</h3>
								<p class="backlog-sub">
									Hours converting from planned to played —{' '}
									<span class="backlog-highlight-playing">
										<Play size={10} /> playing
									</span>{' '}
									is backlog in progress
								</p>
							</div>
						</div>
						<div class="journey-progress-summary">
							<div
								class="journey-ring"
								style={{ '--journey-progress': `${backlogStats().completed.pctHours}%` }}
								role="progressbar"
								aria-valuenow={Math.round(backlogStats().completed.pctHours)}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-label={`${backlogStats().completed.pctHours.toFixed(1)}% of planned hours cleared`}
							>
								<div class="journey-ring-inner">
									<strong>{backlogPctHoursLabel()}</strong>
									<span>cleared</span>
								</div>
							</div>
							<div class="journey-next-milestone">
								<span>Next milestone</span>
								<Show
									when={backlogStats().total.count > 0}
									fallback={
										<>
											<strong>—</strong>
											<small>No games tracked yet</small>
										</>
									}
								>
									<strong>{nextBacklogMilestone()}%</strong>
									<small>
										{nextBacklogMilestone() === 100
											? 'All milestones reached'
											: `${backlogMilestoneGap().toFixed(1)}% of hours to go`}
									</small>
								</Show>
							</div>
						</div>
					</div>

					<div class="backlog-unified">
						<div class="backlog-metric-head">
							<span class="backlog-metric-label">
								<Library size={11} /> Library progress
							</span>
							<span class="backlog-metric-total">
								{formatMinutes(backlogStats().total.minutes)} total · {backlogStats().total.count} games
								<Show when={playingCount() > 0}>
									<small class="backlog-playing-total">
										Includes {formatMinutes(backlogStats().playing.minutes)} currently playing
									</small>
								</Show>
							</span>
						</div>
						<div
							class="backlog-bar backlog-unified-bar"
							role="progressbar"
							aria-valuenow={Math.round(backlogStats().completed.pctHours)}
							aria-valuemin={0}
							aria-valuemax={100}
							aria-label={`Library progress: ${backlogStats().completed.pctHours.toFixed(1)}% of hours completed, ${backlogStats().completed.pctCount.toFixed(1)}% of games completed`}
							title={`Completed ${formatMinutes(backlogStats().completed.minutes)} · ${backlogStats().completed.count} games`}
						>
							<Show when={backlogHoursPctCompleted() > 0}>
								<div
									class="backlog-seg seg-completed"
									style={{ width: `${backlogHoursPctCompleted()}%` }}
									title={`Completed — ${formatMinutes(backlogStats().completed.minutes)} · ${backlogStats().completed.count} games (${backlogStats().completed.pctHours.toFixed(1)}% of hours)`}
								>
									<Show
										when={backlogHoursPctCompleted() >= 10}
										fallback={
											<Show when={backlogHoursPctCompleted() >= 7}>
												<span class="seg-label">{backlogStats().completed.pctHours.toFixed(0)}%</span>
											</Show>
										}
									>
										<span class="seg-label">
											<strong>{formatMinutes(backlogStats().completed.minutes)}</strong>
											<small>{backlogStats().completed.count} games</small>
										</span>
									</Show>
								</div>
							</Show>
							<Show when={backlogHoursPctPlaying() > 0}>
								<div
									class="backlog-seg seg-playing"
									style={{ width: `${displayHoursPctPlaying()}%` }}
									title={`Playing — ${formatMinutes(backlogStats().playing.minutes)} · ${backlogStats().playing.count} games (${backlogStats().playing.pctHours.toFixed(1)}% of hours)`}
								>
									<Show
										when={displayHoursPctPlaying() >= 10}
										fallback={
											<Show when={displayHoursPctPlaying() >= 4}>
												<span class="seg-label seg-label-playing">{backlogStats().playing.pctHours.toFixed(0)}%</span>
											</Show>
										}
									>
										<span class="seg-label seg-label-playing">
											<strong>{formatMinutes(backlogStats().playing.minutes)}</strong>
											<small>{backlogStats().playing.count} games</small>
										</span>
									</Show>
								</div>
							</Show>
							<Show when={backlogHoursPctPlanned() > 0}>
								<div
									class="backlog-seg seg-planned"
									style={{ width: `${displayHoursPctPlanned()}%` }}
									title={`Planned — ${formatMinutes(backlogStats().planned.minutes)} · ${backlogStats().planned.count} games (${backlogStats().planned.pctHours.toFixed(1)}% of hours)`}
								>
									<Show
										when={backlogHoursPctPlanned() >= 10}
										fallback={
											<Show when={backlogHoursPctPlanned() >= 7}>
												<span class="seg-label seg-label-planned">{backlogStats().planned.pctHours.toFixed(0)}%</span>
											</Show>
										}
									>
										<span class="seg-label seg-label-planned">
											<strong>{formatMinutes(backlogStats().planned.minutes)}</strong>
											<small>{backlogStats().planned.count} games</small>
										</span>
									</Show>
								</div>
							</Show>
						</div>
					</div>

					<div class="backlog-legend">
						<div class="legend-item">
							<span class="legend-dot dot-completed" aria-hidden="true" />
							<span class="legend-key">
								<span class="legend-label">Completed</span>
								<span class="legend-value">
									{formatMinutes(backlogStats().completed.minutes)} · {backlogStats().completed.count} games ·{' '}
									{backlogStats().completed.pctHours.toFixed(1)}% of hours
								</span>
							</span>
						</div>
						<div class="legend-item">
							<span class="legend-dot dot-playing" aria-hidden="true" />
							<span class="legend-key">
								<span class="legend-label">Playing</span>
								<span class="legend-value">
									{formatMinutes(backlogStats().playing.minutes)} · {backlogStats().playing.count} games ·{' '}
									{backlogStats().playing.pctHours.toFixed(1)}% of hours
								</span>
							</span>
						</div>
						<div class="legend-item">
							<span class="legend-dot dot-planned" aria-hidden="true" />
							<span class="legend-key">
								<span class="legend-label">Planned</span>
								<span class="legend-value">
									{formatMinutes(backlogStats().planned.minutes)} · {backlogStats().planned.count} games ·{' '}
									{backlogStats().planned.pctHours.toFixed(1)}% of hours
								</span>
							</span>
						</div>
					</div>

					<div class="backlog-footer">
						<span class="backlog-footer-main">
							<Hourglass size={12} />
							{backlogRemainingLabel()} · {backlogStats().backlog.count} games remaining
						</span>
						<span class="backlog-footer-sep" aria-hidden="true">
							·
						</span>
						<span class="backlog-footer-secondary">
							{backlogStats().completed.count} of {backlogStats().total.count} games cleared ·{' '}
							{backlogStats().completed.pctCount.toFixed(1)}% of games
						</span>
						<Show when={backlogEta()}>
							{(eta) => (
								<>
									<span class="backlog-footer-sep" aria-hidden="true">
										·
									</span>
									<span class="backlog-footer-eta" title={`Based on avg ${eta().avgPerYear}/year last 3 years`}>
										<TrendingUp size={12} /> ~{eta().label} at {eta().avgPerYear}/yr
									</span>
								</>
							)}
						</Show>
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
									<div class="chart-icon tier-icon" aria-hidden="true">
										<Trophy size={16} />
									</div>
									<div>
										<h3 class="chart-title">Tier distribution</h3>
										<p class="chart-sub">How your completed games fall across each tier</p>
									</div>
								</div>
								<span class="chart-badge">{completedCount()} games</span>
							</div>
							<div class="chart-body">
								<Chart type="bar" data={tierChart().data} options={tierChart().options} height={360} />
							</div>
						</article>

						<article class="chart-card">
							<div class="chart-header">
								<div class="chart-heading">
									<div class="chart-icon genre-icon" aria-hidden="true">
										<Disc3 size={16} />
									</div>
									<div>
										<h3 class="chart-title">Genre breakdown</h3>
										<p class="chart-sub">Every completed genre, ranked by game count</p>
									</div>
								</div>
								<span class="chart-badge">{genreStats().length} genres</span>
							</div>
							<div class="chart-body">
								<Chart type="bar" data={genreChart().data} options={genreChart().options} height={360} />
							</div>
						</article>

						<article class="chart-card chart-card--wide">
							<div class="chart-header">
								<div class="chart-heading">
									<div class="chart-icon playtime-icon" aria-hidden="true">
										<Timer size={16} />
									</div>
									<div>
										<h3 class="chart-title">Playtime distribution</h3>
										<p class="chart-sub">The game-length ranges that define your year</p>
									</div>
								</div>
								<span class="chart-badge">{formatMinutes(medianPlaytimeMinutes())} median</span>
							</div>
							<div class="chart-body">
								<Chart type="bar" data={playtimeChart().data} options={playtimeChart().options} height={360} />
							</div>
						</article>

						<article class="chart-card chart-card--year">
							<div class="chart-header">
								<div class="chart-heading">
									<div class="chart-icon year-icon" aria-hidden="true">
										<TrendingUp size={16} />
									</div>
									<div>
										<h3 class="chart-title">Year over year</h3>
										<p class="chart-sub">Annual completions with your cumulative total</p>
									</div>
								</div>
								<span class="chart-badge">Peak {yearAggregates().bestYear || '—'}</span>
							</div>
							<div class="chart-body chart-body-year">
								<div class="year-scroll">
									<div class="year-scroll-inner" style={{ 'min-width': `${Math.max(yearCount() * 64, 280)}px` }}>
										<Chart type="bar" data={yearChart().data} options={yearChart().options} height={300} />
									</div>
								</div>
							</div>
						</article>

						<article class="chart-card">
							<div class="chart-header">
								<div class="chart-heading">
									<div class="chart-icon rating-icon" aria-hidden="true">
										<BarChart3 size={16} />
									</div>
									<div>
										<h3 class="chart-title">Rating distribution</h3>
										<p class="chart-sub">See how your personal scores cluster</p>
									</div>
								</div>
								<span class="chart-badge">{ratedCount()} rated</span>
							</div>
							<div class="chart-body">
								<Chart type="bar" data={scoreChart().data} options={scoreChart().options} height={300} />
							</div>
						</article>

						<article class="chart-card chart-card--months">
							<div class="chart-header">
								<div class="chart-heading">
									<div class="chart-icon months-icon" aria-hidden="true">
										<Calendar size={16} />
									</div>
									<div>
										<h3 class="chart-title">Monthly breakdown</h3>
										<p class="chart-sub">A completion heatmap for every month on record</p>
									</div>
								</div>
								<span class="chart-badge">Peak {maxMonthly() > 0 ? `${maxMonthly()}/mo` : '—'}</span>
							</div>
							<div class="monthly-table-scroll">
								<div class="monthly-table">
									<div class="mt-row mt-header">
										<span class="mt-year" />
										<For each={MONTHS}>{(month) => <span class="mt-cell mt-header-cell">{month}</span>}</For>
										<span class="mt-cell mt-header-cell mt-total">Total</span>
									</div>
									<For each={yearlyMonthData()} keyed={(yearData) => yearData.year}>
										{(yearData) => (
											<div class="mt-row">
												<span class="mt-year">{yearData().year}</span>
												<For each={yearData().data}>
													{(value) => (
														<span class={['mt-cell', getMonthlyHeatClass(value, maxMonthly())]}>{value}</span>
													)}
												</For>
												<span class="mt-cell mt-total">
													{yearData().data.reduce((total, value) => total + value, 0)}
												</span>
											</div>
										)}
									</For>
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
							<h4 class="rating-cat-title" style={{ 'border-bottom-color': '#f43f5e' }}>
								<Presentation size={16} style={{ color: '#f43f5e' }} />
								Presentation
							</h4>
							<div class="rating-list">
								<For each={topRated().presentation}>
									{(game, i) => (
										<button type="button" class="rating-entry" onClick={() => modalStore.openViewModal(game, [game])}>
											<span class="rating-pos">{i() + 1}</span>
											<img
												class="rating-cover"
												src={coverSource(game.coverImage)}
												alt=""
												loading="lazy"
												onError={handleCoverError}
											/>
											<span class="rating-game">{game.title}</span>
											<span class="rating-value">{game.ratingPresentation}/10</span>
										</button>
									)}
								</For>
							</div>
						</div>

						<div class="rating-category">
							<h4 class="rating-cat-title" style={{ 'border-bottom-color': '#0ea5e9' }}>
								<NotebookPen size={16} style={{ color: '#0ea5e9' }} />
								Story
							</h4>
							<div class="rating-list">
								<For each={topRated().story}>
									{(game, i) => (
										<button type="button" class="rating-entry" onClick={() => modalStore.openViewModal(game, [game])}>
											<span class="rating-pos">{i() + 1}</span>
											<img
												class="rating-cover"
												src={coverSource(game.coverImage)}
												alt=""
												loading="lazy"
												onError={handleCoverError}
											/>
											<span class="rating-game">{game.title}</span>
											<span class="rating-value">{game.ratingStory}/10</span>
										</button>
									)}
								</For>
							</div>
						</div>

						<div class="rating-category">
							<h4 class="rating-cat-title" style={{ 'border-bottom-color': '#10b981' }}>
								<Gamepad2 size={16} style={{ color: '#10b981' }} />
								Gameplay
							</h4>
							<div class="rating-list">
								<For each={topRated().gameplay}>
									{(game, i) => (
										<button type="button" class="rating-entry" onClick={() => modalStore.openViewModal(game, [game])}>
											<span class="rating-pos">{i() + 1}</span>
											<img
												class="rating-cover"
												src={coverSource(game.coverImage)}
												alt=""
												loading="lazy"
												onError={handleCoverError}
											/>
											<span class="rating-game">{game.title}</span>
											<span class="rating-value">{game.ratingGameplay}/10</span>
										</button>
									)}
								</For>
							</div>
						</div>

						<div class="rating-category">
							<h4 class="rating-cat-title" style={{ 'border-bottom-color': '#f59e0b' }}>
								<Star size={16} style={{ color: '#f59e0b' }} />
								Score
							</h4>
							<div class="rating-list">
								<For each={topRated().score}>
									{(game, i) => (
										<button type="button" class="rating-entry" onClick={() => modalStore.openViewModal(game, [game])}>
											<span class="rating-pos">{i() + 1}</span>
											<img
												class="rating-cover"
												src={coverSource(game.coverImage)}
												alt=""
												loading="lazy"
												onError={handleCoverError}
											/>
											<span class="rating-game">{game.title}</span>
											<span class="rating-value">{game.score}/20</span>
										</button>
									)}
								</For>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

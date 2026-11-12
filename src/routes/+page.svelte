<script lang="ts">
import { goto } from '$app/navigation';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { modalStore } from '#lib/stores/modal.svelte.js';
import { windowSize } from '#lib/stores/window.svelte.js';
import { imageErrorStore } from '#lib/stores/imageErrors.svelte.js';
import { getGenreClasses, getPlatformClasses } from '#lib/utils/colorConstants.js';
import GameCard from '#lib/components/GameCard.svelte';
import type { Game } from '#lib/types/game.js';
import { Sparkles, ChevronRight, Gamepad2, Clock } from '@lucide/svelte';

let games = $derived(gamesStore.games);

let completedGames = $derived(games.filter((g) => g.status === 'Completed'));
let playingGames = $derived(games.filter((g) => g.status === 'Playing'));

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';

// A save points a new game at a cover whose generated assets don't exist yet
// (the optimize-covers GitHub Action runs after games.json is committed), so
// covers can 404 for a while. Show the shared no-cover placeholder instead of
// a broken image until the real asset is available.
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

let recentCompletions = $derived.by(() => {
	const w = windowSize.width;
	let cols = 1;
	if (w >= 1200) cols = 5;
	else if (w >= 900) cols = 4;
	else if (w >= 768) cols = 3;
	else if (w < 768) cols = 2;
	const count = cols * 2;
	const sorted = [...completedGames].toSorted((a, b) => {
		if (!a.finishedDate && !b.finishedDate) return 0;
		if (!a.finishedDate) return 1;
		if (!b.finishedDate) return -1;
		return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
	});
	return sorted.slice(0, count);
});

function handleRecentOpen(game: Game) {
	modalStore.openViewModal(game, recentCompletions);
}

function handlePlayingOpen(game: Game) {
	modalStore.openViewModal(game, playingGames);
}

function viewAllCompleted() {
	goto('/completed');
}
</script>

<div class="homepage">
	<div class="home-content">

		{#if playingGames.length > 0}
			<section class="now-playing-section">
				<div class="np-header">
					<span class="np-badge">
						<Sparkles size={14} />
						Now Playing
					</span>
				</div>
				<div class="np-grid">
					{#each playingGames as game (game.id)}
						{@const npCover = coverSource(game.coverImage)}
						<button type="button" class="np-card" onclick={() => handlePlayingOpen(game)}>
							<img class="np-cover" src={npCover} alt="" onerror={handleCoverError} />
							<div class="np-shade" aria-hidden="true"></div>
							<span class="np-live">
								<span class="np-live-dot"></span>
								Playing
							</span>
							<div class="np-overlay">
								<h2 class="np-title">{game.title}</h2>
								<div class="np-meta">
									<span class="chip {getPlatformClasses(game.platform)}">{game.platform}</span>
									<span class="chip {getGenreClasses(game.genre)}">{game.genre}</span>
									<span class="chip chip-neutral">{game.year}</span>
								</div>
								<div class="np-playtime">
									<Clock size={14} />
									<span class="np-playtime-label">Time to Beat</span>
									<span class="np-playtime-value">{game.playtime}</span>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</section>
		{:else}
			<section class="now-playing-section">
				<div class="np-card-empty">
					<Gamepad2 size={32} />
					<div class="np-empty-text">
						<span class="np-empty-title">No game in progress</span>
						<span class="np-empty-sub">Mark a game as Playing to track your current session</span>
					</div>
				</div>
			</section>
		{/if}

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

	@media (max-width: 767px) {
		.homepage {
			padding-bottom: 96px;
		}
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
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.np-header {
		display: flex;
		align-items: center;
	}

	/* Poster showcase: cards are centered and width-capped so they read big
	   without stretching to the full 1600px container when only one is playing. */
	.np-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 16px;
		width: 100%;
	}

	.np-card {
		position: relative;
		flex: 1 1 340px;
		max-width: 460px;
		min-width: 0;
		aspect-ratio: 4 / 5;
		border-radius: 20px;
		overflow: hidden;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-status-playing-border);
		box-shadow: var(--shadow-lg), 0 12px 40px -16px rgba(16, 185, 129, 0.3);
		cursor: pointer;
		padding: 0;
		font-family: inherit;
		text-align: left;
		transition:
			box-shadow var(--transition-normal),
			transform var(--transition-normal);
	}

	:global(.light) .np-card {
		box-shadow: var(--shadow-lg), 0 12px 40px -16px rgba(16, 185, 129, 0.18);
	}

	@media (hover: hover) {
		.np-card:hover {
			box-shadow: var(--shadow-xl), 0 16px 48px -12px rgba(16, 185, 129, 0.4);
			transform: translateY(-4px);
		}

		.np-card:hover .np-cover {
			transform: scale(1.05);
		}
	}

	:global(.light) .np-card:hover {
		box-shadow: var(--shadow-xl), 0 16px 48px -12px rgba(16, 185, 129, 0.25);
	}

	.np-card:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	.np-card-empty {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1.5rem 2rem;
		border-radius: 20px;
		background: var(--color-surface);
		border: 1px dashed var(--color-border);
		color: var(--color-text-secondary);
	}

	.np-empty-text {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.np-empty-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.np-empty-sub {
		font-size: 0.85rem;
		color: var(--color-text-secondary);
	}

	/* Cover art fills the whole card; the poster crop is intentional. */
	.np-cover {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: var(--color-surface-elevated);
		transition: transform var(--transition-slow);
	}

	/* Fade the bottom of the artwork into the themed surface so the overlay
	   text keeps its contrast in both themes. Light mode uses a shorter,
	   sharper fade — a long white wash reads as haze over dark art. */
	.np-shade {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: linear-gradient(
			to top,
			var(--color-surface-solid) 0%,
			color-mix(in srgb, var(--color-surface-solid) 90%, transparent) 22%,
			color-mix(in srgb, var(--color-surface-solid) 45%, transparent) 44%,
			transparent 62%
		);
	}

	:global(.light) .np-shade {
		background: linear-gradient(
			to top,
			var(--color-surface-solid) 0%,
			color-mix(in srgb, var(--color-surface-solid) 88%, transparent) 14%,
			color-mix(in srgb, var(--color-surface-solid) 40%, transparent) 30%,
			transparent 50%
		);
	}

	.np-live {
		position: absolute;
		top: 14px;
		left: 14px;
		display: inline-flex;
		align-items: center;
		gap: 7px;
		padding: 5px 11px 5px 9px;
		border-radius: 999px;
		background: rgba(8, 10, 14, 0.62);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid var(--color-status-playing-border);
		color: var(--color-status-playing-text);
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.np-live-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--color-status-playing-text);
		animation: np-live-pulse 2s ease-in-out infinite;
	}

	@keyframes np-live-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.45);
		}
		50% {
			box-shadow: 0 0 0 5px rgba(52, 211, 153, 0);
		}
	}

	.np-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 10px;
		padding: 18px 20px 20px;
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
		animation: np-badge-glow 2.4s ease-in-out infinite;
	}

	@keyframes np-badge-glow {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
		}
		50% {
			box-shadow: 0 0 28px rgba(99, 102, 241, 0.45);
		}
	}

	:global(.light) .np-badge {
		animation-name: np-badge-glow-light;
	}

	@keyframes np-badge-glow-light {
		0%,
		100% {
			box-shadow: 0 0 20px rgba(194, 65, 12, 0.25);
		}
		50% {
			box-shadow: 0 0 26px rgba(194, 65, 12, 0.38);
		}
	}

	.np-title {
		margin: 0;
		font-size: 1.35rem;
		font-weight: 800;
		color: var(--color-text-primary);
		line-height: 1.2;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.np-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.chip {
		display: inline-flex;
		padding: 3px 10px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		border-width: 1px;
		border-style: solid;
	}

	.chip-neutral {
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		border-color: var(--color-border);
	}

	/* Color the Clock icon (svg uses currentColor). */
	.np-playtime {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: var(--color-accent);
	}

	.np-playtime-label {
		font-size: 0.68rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--color-text-tertiary);
	}

	.np-playtime-value {
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-text-secondary);
	}

	@media (max-width: 767px) {
		.np-grid {
			gap: 12px;
		}

		.np-live {
			top: 12px;
			left: 12px;
		}

		.np-overlay {
			padding: 14px 16px 16px;
		}

		.np-title {
			font-size: 1.2rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.np-badge,
		.np-live-dot {
			animation: none;
		}

		.np-card,
		.np-cover {
			transition: none;
		}
	}

	.recent-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-top: 16px;
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
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 12px;
		width: 100%;
	}

	@media (max-width: 767px) {
		.recent-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}


</style>

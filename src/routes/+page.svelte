<script lang="ts">
import { goto } from '$app/navigation';
import { gamesStore } from '$lib/stores/games.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { windowSize } from '$lib/stores/window.svelte';
import GameCard from '$lib/components/GameCard.svelte';
import type { Game } from '$lib/types/game';
import { Sparkles, ChevronRight, Hourglass, Gamepad2 } from 'lucide-svelte';

let games = $derived(gamesStore.games);

let completedGames = $derived(games.filter((g) => g.status === 'Completed'));
let playingGame = $derived(games.filter((g) => g.status === 'Playing'));

let currentSession = $derived(playingGame.length > 0 ? playingGame[0] : null);

let recentCompletions = $derived.by(() => {
	const w = windowSize.width;
	let cols = 2;
	if (w >= 1200) cols = 5;
	else if (w >= 900) cols = 4;
	else if (w >= 640) cols = 3;
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

	.np-card-empty {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		padding: 1.5rem 2rem;
		border-radius: 16px;
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

	@media (max-width: 639px) {
		.np-cover {
			width: 100px;
			min-height: 140px;
		}
		.np-info {
			padding: 14px;
			gap: 6px;
		}
		.np-title {
			font-size: 1.1rem;
		}
	}
</style>

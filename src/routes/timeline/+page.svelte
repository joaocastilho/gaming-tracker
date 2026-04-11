<script lang="ts">
import { gamesStore } from '$lib/stores/games.svelte';
import { format, parse } from 'date-fns';
import { parseToDate } from '$lib/utils/dateUtils';
import GameCard from '$lib/components/GameCard.svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { ArrowDown, ArrowUp, Gamepad2 } from 'lucide-svelte';
import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';

type SortOption = 'newest' | 'oldest';

let sortOption = $state<SortOption>('newest');

let completedGames = $derived.by(() => {
	const games = gamesStore.games;
	const all = games.filter((g) => g.status === 'Completed' && g.finishedDate);
	const sorted = [...all].sort((a, b) => {
		const tsA = parseToDate(a.finishedDate)?.getTime() ?? 0;
		const tsB = parseToDate(b.finishedDate)?.getTime() ?? 0;
		if (tsA === 0 || tsB === 0) return 0;
		if (sortOption === 'newest') {
			return tsB - tsA;
		}
		return tsA - tsB;
	});
	return sorted;
});

let groupedGames = $derived.by(() => {
	const games = completedGames;
	const groups: Record<string, typeof games> = {};

	for (const game of games) {
		const date = parseToDate(game.finishedDate);
		if (!date) continue;

		const key = format(date, 'yyyy MMMM');
		if (!groups[key]) {
			groups[key] = [];
		}
		groups[key].push(game);
	}

	return groups;
});

let sortedGroupKeys = $derived.by(() => {
	const groups = groupedGames;
	const keys = Object.keys(groups);
	const sorted = [...keys].sort((a, b) => {
		const dateA = parse(a, 'yyyy MMMM', new Date(2000, 0, 1));
		const dateB = parse(b, 'yyyy MMMM', new Date(2000, 0, 1));
		if (sortOption === 'newest') {
			return dateB.getTime() - dateA.getTime();
		}
		return dateA.getTime() - dateB.getTime();
	});
	return sorted;
});

function handleItemClick(gameId: string) {
	const game = gamesStore.getGameById(gameId);
	if (game) {
		modalStore.openViewModal(game, completedGames);
	}
}
</script>

<div class="timeline-page">
	<header class="timeline-header">
		<div class="header-left">
			<h1 class="page-title">Timeline</h1>
			<span class="game-count">{completedGames.length} games</span>
		</div>

		<div class="sort-tabs" role="tablist">
			<button
				role="tab"
				type="button"
				class="sort-tab"
				class:active={sortOption === 'newest'}
				onclick={() => (sortOption = 'newest')}
				aria-selected={sortOption === 'newest'}
			>
				<ArrowDown size={16} />
				<span>Newest</span>
			</button>
			<button
				role="tab"
				type="button"
				class="sort-tab"
				class:active={sortOption === 'oldest'}
				onclick={() => (sortOption = 'oldest')}
				aria-selected={sortOption === 'oldest'}
			>
				<ArrowUp size={16} />
				<span>Oldest</span>
			</button>
		</div>
	</header>

	{#if gamesStore.loading && gamesStore.games.length === 0}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading timeline...</p>
		</div>
	{:else if completedGames.length === 0}
		<div class="empty-state">
			<div class="empty-icon">
				<Gamepad2 size={48} />
			</div>
			<p>No completed games yet</p>
			<p class="empty-hint">Mark games as completed to see them here</p>
		</div>
	{:else}
		<div class="timeline-container">
			{#each sortedGroupKeys as groupKey (groupKey)}
				{@const groupGames = groupedGames[groupKey]}

				<div class="month-group">
					<div class="month-header">
						<span class="month-label">{groupKey}</span>
						<span class="month-count"
							>{groupGames.length} {groupGames.length === 1 ? 'game' : 'games'}</span
						>
					</div>

					<div class="month-games">
						{#each groupGames as game (game.id)}
							<GameCard
								{game}
								displayedGames={completedGames}
								onOpenModal={() => handleItemClick(game.id)}
							/>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	{/if}

	<ScrollToTopButton />
</div>

<style>
	.timeline-page {
		padding: 1rem 1rem 6rem;
		min-height: 100vh;
		background-color: var(--color-background);
		position: relative;
	}

	.timeline-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		padding: 1rem 0 1.5rem;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.page-title {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		background: linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-primary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.game-count {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.sort-tabs {
		display: flex;
		background-color: var(--color-surface);
		border-radius: 9999px;
		padding: 0.25rem;
		border: 1px solid var(--color-border);
		gap: 0.25rem;
	}

	.sort-tab {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		border: none;
		background-color: transparent;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.sort-tab:hover {
		background-color: var(--color-hover);
		color: var(--color-text-primary);
	}

	.sort-tab.active {
		background-color: var(--color-primary);
		color: var(--color-text-on-primary);
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
	}

	.loading-state,
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 1rem;
		text-align: center;
	}

	.loading-spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid var(--color-border);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
		margin-bottom: 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background-color: var(--color-surface);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		color: var(--color-text-secondary);
	}

	.empty-state p {
		margin: 0;
		color: var(--color-text-primary);
		font-size: 1.125rem;
	}

	.empty-hint {
		margin-top: 0.5rem !important;
		font-size: 0.9375rem !important;
		color: var(--color-text-secondary) !important;
	}

	.timeline-container {
		display: flex;
		flex-direction: column;
		gap: 3rem;
		padding-bottom: 2rem;
	}

	.month-group {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.month-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem 1.25rem;
		background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-hover) 100%);
		border-radius: 1rem;
		border: 1px solid var(--color-border);
		position: relative;
		overflow: hidden;
	}

	.month-header::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		background: linear-gradient(
			180deg,
			var(--color-primary) 0%,
			var(--color-primary-dark, #6366f1) 100%
		);
	}

	.month-label {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--color-text-primary);
		letter-spacing: -0.02em;
	}

	.month-count {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-primary);
		background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(99, 102, 241, 0.2) 100%);
		padding: 0.25rem 0.75rem;
		border-radius: 9999px;
		border: 1px solid rgba(99, 102, 241, 0.25);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.month-games {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1.25rem;
	}

	@media (min-width: 768px) {
		.timeline-page {
			padding: 1.5rem 2rem 6rem;
			max-width: 900px;
			margin: 0 auto;
		}

		.timeline-header {
			padding: 1.5rem 0 2rem;
		}

		.month-games {
			gap: 1.25rem;
		}
	}
</style>

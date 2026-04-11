<script lang="ts">
	import { gamesStore } from '$lib/stores/games.svelte';
	import { format, parse } from 'date-fns';
	import TimelineItem from '$lib/components/timeline/TimelineItem.svelte';
	import { modalStore } from '$lib/stores/modal.svelte';

	type SortOption = 'newest' | 'oldest';

	let sortOption = $state<SortOption>('newest');

	function parseDate(dateStr: string | null): Date | null {
		if (!dateStr) return null;
		try {
			return parse(dateStr, 'dd/MM/yyyy', new Date());
		} catch {
			return null;
		}
	}

	let completedGames = $derived.by(() => {
		const all = gamesStore.games.filter((g) => g.status === 'Completed' && g.finishedDate);
		return all.sort((a, b) => {
			const dateA = parseDate(a.finishedDate);
			const dateB = parseDate(b.finishedDate);
			if (!dateA || !dateB) return 0;
			return sortOption === 'newest'
				? dateB.getTime() - dateA.getTime()
				: dateA.getTime() - dateB.getTime();
		});
	});

	function toggleSort() {
		sortOption = sortOption === 'newest' ? 'oldest' : 'newest';
	}

	function handleItemClick(gameId: string) {
		const game = gamesStore.getGameById(gameId);
		if (game) {
			modalStore.openViewModal(game, completedGames);
		}
	}

	function formatDisplayDate(dateStr: string | null): string {
		if (!dateStr) return '';
		try {
			const date = parse(dateStr, 'dd/MM/yyyy', new Date());
			return format(date, 'MMM d, yyyy');
		} catch {
			return dateStr;
		}
	}
</script>

<div class="timeline-page">
	<header class="timeline-header">
		<h1 class="page-title">Completion Timeline</h1>

		<button
			type="button"
			class="sort-toggle"
			class:active={sortOption === 'newest'}
			onclick={toggleSort}
			aria-pressed={sortOption === 'newest'}
		>
			<span class="sort-label">{sortOption === 'newest' ? 'Newest' : 'Oldest'}</span>
			<svg
				class="sort-icon"
				class:flipped={sortOption === 'oldest'}
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M12 5v14M5 12l7-7 7 7" />
			</svg>
		</button>
	</header>

	{#if gamesStore.loading}
		<div class="loading-state">
			<div class="loading-spinner"></div>
			<p>Loading timeline...</p>
		</div>
	{:else if completedGames.length === 0}
		<div class="empty-state">
			<p>No completed games yet</p>
			<p class="empty-hint">Mark games as completed to see them here</p>
		</div>
	{:else}
		<div class="timeline-container">
			{#each completedGames as game (game.id)}
				<TimelineItem
					{game}
					date={formatDisplayDate(game.finishedDate)}
					onclick={() => handleItemClick(game.id)}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.timeline-page {
		padding: 1rem 1rem 6rem;
		min-height: 100vh;
		background-color: var(--color-background);
	}

	.timeline-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 0 1.5rem;
		gap: 1rem;
	}

	.page-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
	}

	.sort-toggle {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 9999px;
		border: 1px solid var(--color-border);
		background-color: transparent;
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.sort-toggle:hover {
		background-color: var(--color-hover);
		border-color: var(--color-border-hover);
	}

	.sort-toggle.active {
		background-color: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-text-on-primary);
	}

	.sort-icon {
		width: 16px;
		height: 16px;
		transition: transform 0.2s ease;
	}

	.sort-icon.flipped {
		transform: rotate(180deg);
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

	.empty-state p {
		margin: 0;
		color: var(--color-text-primary);
	}

	.empty-hint {
		margin-top: 0.5rem !important;
		font-size: 0.875rem;
		color: var(--color-text-secondary) !important;
	}

	.timeline-container {
		display: flex;
		flex-direction: column;
	}

	@media (min-width: 768px) {
		.timeline-page {
			padding: 1.5rem 2rem 6rem;
			max-width: 800px;
			margin: 0 auto;
		}
	}
</style>

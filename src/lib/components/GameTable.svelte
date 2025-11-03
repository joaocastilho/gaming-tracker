<script lang="ts">
	import { sortStore } from '../stores/sort.js';
	import VirtualizedTable from './VirtualizedTable.svelte';
	import { memoizeGameSort } from '../utils/memoize.js';
	import { TIER_COLORS, PLATFORM_COLORS, GENRE_COLORS, getTierDisplayName } from '../utils/colorConstants.js';
	import type { Game } from '../types/game.js';

	interface Props {
		games: Game[];
		onRowClick?: (game: Game) => void;
	}

	let { games, onRowClick }: Props = $props();

	// Use virtualization for large datasets (>100 games)
	const USE_VIRTUALIZATION = games.length > 100;
	const ITEM_HEIGHT = 60; // Approximate row height
	const CONTAINER_HEIGHT = 600; // Fixed container height

	// Sorting state from store
	let sortState = $state(sortStore.state);

	$effect(() => {
		const unsubscribe = sortStore.subscribe((state) => {
			sortState = state;
		});
		return unsubscribe;
	});

	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Calculate total score for completed games
	function calculateScore(game: Game): number | null {
		if (
			game.status === 'Completed' &&
			game.ratingPresentation !== null &&
			game.ratingStory !== null &&
			game.ratingGameplay !== null
		) {
			return Math.round(
				((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2
			);
		}
		return null;
	}

	// Sort function
	function handleSort(column: string) {
		sortStore.toggleSort(column);
		sortStore.writeToURL();
	}

	// Get sort indicator
	function getSortIndicator(column: string): string {
		if (sortState.sortBy !== column) return '↕';
		return sortState.sortDirection === 'asc' ? '↑' : '↓';
	}

	// Memoized sorting function for performance
	const sortGames = memoizeGameSort((games: Game[], sortBy: string, sortDirection: string): Game[] => {
		return [...games].sort((a, b) => {
			if (!sortBy) return 0;

			let aValue: string | number | null, bValue: string | number | null;

			switch (sortBy) {
				case 'title':
					aValue = a.title.toLowerCase();
					bValue = b.title.toLowerCase();
					break;
				case 'year':
					aValue = a.year;
					bValue = b.year;
					break;
				case 'platform':
					aValue = a.platform;
					bValue = b.platform;
					break;
				case 'genre':
					aValue = a.genre;
					bValue = b.genre;
					break;
				case 'status':
					aValue = a.status;
					bValue = b.status;
					break;
				case 'tier':
					aValue = a.tier || '';
					bValue = b.tier || '';
					break;
				case 'score':
					aValue = calculateScore(a) || 0;
					bValue = calculateScore(b) || 0;
					break;
				case 'hours':
					aValue = a.hoursPlayed || '';
					bValue = b.hoursPlayed || '';
					break;
				case 'finished':
					aValue = a.finishedDate || '';
					bValue = b.finishedDate || '';
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
			if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});
	});

	// Get sorted games
	let sortedGames = $derived(
		sortGames(games, sortState.sortBy, sortState.sortDirection)
	);

	// Handle row click
	function handleRowClick(game: Game) {
		if (onRowClick) {
			onRowClick(game);
		}
	}
</script>

<div class="table-container overflow-x-auto">
	<table class="game-table w-full border-collapse">
		<thead>
			<tr class="border-border border-b">
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('title')}
					>
						Cover {getSortIndicator('title')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('title')}
					>
						Title {getSortIndicator('title')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('year')}
					>
						Year {getSortIndicator('year')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('platform')}
					>
						Platform {getSortIndicator('platform')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('genre')}
					>
						Genre {getSortIndicator('genre')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('tier')}
					>
						Tier {getSortIndicator('tier')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('score')}
					>
						Ratings {getSortIndicator('score')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('score')}
					>
						Score {getSortIndicator('score')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('hours')}
					>
						Hours {getSortIndicator('hours')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header"
						style="color: var(--color-text-secondary);"
						onclick={() => handleSort('finished')}
					>
						Finished {getSortIndicator('finished')}
					</button>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each sortedGames as game (game.id)}
				<tr
					class="border-border hover:bg-muted/50 table-row cursor-pointer border-b transition-colors"
					onclick={() => handleRowClick(game)}
				>
					<!-- Cover Column -->
					<td class="p-3">
						<img
							src="/{game.coverImage}"
							alt="{game.title} cover"
							class="h-12 w-8 rounded border object-cover"
							loading="lazy"
							onerror={(e) => {
								const img = e.target as HTMLImageElement;
								img.style.display = 'none';
							}}
						/>
					</td>
					<!-- Title Column -->
					<td class="p-3">
						<span class="text-sm font-medium">{game.title}</span>
					</td>
					<!-- Year Column -->
					<td class="text-muted-foreground p-3 text-sm">{game.year}</td>
					<!-- Platform Column -->
					<td class="p-3">
						<span class="inline-flex rounded px-2 py-1 text-xs font-medium {PLATFORM_COLORS[game.platform] || 'bg-gray-600 text-white'}">
							{game.platform}
						</span>
					</td>
					<!-- Genre Column -->
					<td class="p-3">
						<span class="inline-flex rounded px-2 py-1 text-xs font-medium {GENRE_COLORS[game.genre] || 'bg-gray-600 text-white'}">
							{game.genre}
						</span>
					</td>
					<!-- Tier Column -->
					<td class="p-3">
						{#if game.status === 'Completed' && game.tier}
							<span
								class="inline-flex rounded px-2 py-1 text-xs font-medium {TIER_COLORS[getTierDisplayName(game.tier)]}"
							>
								{getTierDisplayName(game.tier)}
							</span>
						{:else}
							<span class="text-muted-foreground text-sm">-</span>
						{/if}
					</td>
					<!-- Ratings Column -->
					<td class="p-3">
						{#if game.status === 'Completed'}
							<div class="flex flex-col gap-1 text-xs">
								<span>👁️ {game.ratingPresentation || 0}/10</span>
								<span>✏️ {game.ratingStory || 0}/10</span>
								<span>🎮 {game.ratingGameplay || 0}/10</span>
							</div>
						{:else}
							<span class="text-muted-foreground text-sm">-</span>
						{/if}
					</td>
					<!-- Score Column -->
					<td class="p-3">
						{#if game.status === 'Completed'}
							<span class="text-sm font-semibold">🏆 {calculateScore(game) || 0}/20</span>
						{:else}
							<span class="text-muted-foreground text-sm">-</span>
						{/if}
					</td>
					<!-- Hours Column -->
					<td class="p-3 text-sm">
						{#if game.status === 'Completed' && game.hoursPlayed}
							<span>⏱️ {game.hoursPlayed}</span>
						{:else}
							<span class="text-muted-foreground">-</span>
						{/if}
					</td>
					<!-- Finished Column -->
					<td class="p-3 text-sm">
						{#if game.status === 'Completed' && game.finishedDate}
							<span>✓ {formatDate(game.finishedDate)}</span>
						{:else}
							<span class="text-muted-foreground">-</span>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		background-color: transparent;
		border-radius: 8px;
		overflow: hidden;
	}

	.game-table {
		background-color: transparent;
	}

	.sort-header {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		cursor: pointer;
	}

	.sort-header:hover {
		color: inherit;
	}

	.table-row {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
	}

	.table-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	:global(.light) .table-row:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
</style>

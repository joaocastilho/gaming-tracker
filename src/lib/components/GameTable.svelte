<script lang="ts">
	import type { Game } from '../types/game.js';

	interface Props {
		games: Game[];
		onRowClick?: (game: Game) => void;
	}

	let { games, onRowClick }: Props = $props();

	// Sorting state
	let sortColumn = $state<string>('');
	let sortDirection = $state<'asc' | 'desc'>('asc');

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
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
	}

	// Get sort indicator
	function getSortIndicator(column: string): string {
		if (sortColumn !== column) return '↕';
		return sortDirection === 'asc' ? '↑' : '↓';
	}

	// Get sorted games
	let sortedGames = $derived(
		[...games].sort((a, b) => {
			if (!sortColumn) return 0;

			let aValue: string | number | null, bValue: string | number | null;

			switch (sortColumn) {
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
		})
	);

	// Tier colors
	const tierColors: Record<string, string> = {
		S: 'bg-[#dc2626] text-white',
		A: 'bg-[#f97316] text-white',
		B: 'bg-[#eab308] text-black',
		C: 'bg-[#22c55e] text-white',
		D: 'bg-[#06b6d4] text-white',
		E: 'bg-[#6b7280] text-white'
	};

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
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('title')}
					>
						Title {getSortIndicator('title')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('year')}
					>
						Year {getSortIndicator('year')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('platform')}
					>
						Platform {getSortIndicator('platform')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('genre')}
					>
						Genre {getSortIndicator('genre')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('tier')}
					>
						Tier {getSortIndicator('tier')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('score')}
					>
						Score {getSortIndicator('score')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
						onclick={() => handleSort('hours')}
					>
						Hours {getSortIndicator('hours')}
					</button>
				</th>
				<th class="p-3 text-left">
					<button
						class="sort-header text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
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
					<td class="p-3">
						<div class="flex items-center gap-3">
							<!-- Thumbnail -->
							<img
								src="/{game.coverImage}"
								alt="{game.title} cover"
								class="h-15 w-10 rounded border object-cover"
								onerror={(e) => {
									const img = e.target as HTMLImageElement;
									img.style.display = 'none';
								}}
							/>
							<!-- Title -->
							<span class="text-sm font-medium">{game.title}</span>
						</div>
					</td>
					<td class="text-muted-foreground p-3 text-sm">{game.year}</td>
					<td class="p-3">
						<span class="inline-flex rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white">
							{game.platform}
						</span>
					</td>
					<td class="p-3">
						<span
							class="inline-flex rounded bg-purple-600 px-2 py-1 text-xs font-medium text-white"
						>
							{game.genre}
						</span>
					</td>
					<td class="p-3">
						{#if game.status === 'Completed' && game.tier}
							<span
								class="inline-flex rounded px-2 py-1 text-xs font-medium {tierColors[game.tier]}"
							>
								{game.tier}
							</span>
						{:else}
							<span class="text-muted-foreground text-sm">-</span>
						{/if}
					</td>
					<td class="p-3">
						{#if game.status === 'Completed'}
							<div class="flex items-center gap-1 text-xs">
								<span>👁️ {game.ratingPresentation || 0}/10</span>
								<span>✏️ {game.ratingStory || 0}/10</span>
								<span>🎮 {game.ratingGameplay || 0}/10</span>
							</div>
							<div class="text-sm font-semibold">🏆 {calculateScore(game) || 0}/20</div>
						{:else}
							<span class="text-muted-foreground text-sm">-</span>
						{/if}
					</td>
					<td class="p-3 text-sm">
						{#if game.status === 'Completed' && game.hoursPlayed}
							<span>⏱️ {game.hoursPlayed}</span>
						{:else}
							<span class="text-muted-foreground">-</span>
						{/if}
					</td>
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

	.table-row:hover {
		background-color: rgba(255, 255, 255, 0.05);
	}

	:global(.light) .table-row:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}
</style>

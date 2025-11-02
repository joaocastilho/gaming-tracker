<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';
	import { Download, Trophy } from 'lucide-svelte';

	// Get completed games with tiers from the store
	let tierGames = $state<Game[]>([]);

	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			// Only show completed games that have tiers for tier list
			tierGames = games.filter((game) => game.status === 'Completed' && game.tier);
		});
		return unsubscribe;
	});

	// Group games by tier
	let gamesByTier = $derived.by(() => {
		const tiers: Record<string, Game[]> = {
			S: [],
			A: [],
			B: [],
			C: [],
			D: [],
			E: []
		};

		tierGames.forEach((game) => {
			if (game.tier && tiers[game.tier]) {
				tiers[game.tier].push(game);
			}
		});

		return tiers;
	});

	// Tier configuration
	const tierConfig = {
		S: { name: 'S - Masterpiece', color: 'bg-red-500', textColor: 'text-white' },
		A: { name: 'A - Amazing', color: 'bg-orange-500', textColor: 'text-white' },
		B: { name: 'B - Great', color: 'bg-yellow-500', textColor: 'text-black' },
		C: { name: 'C - Good', color: 'bg-green-500', textColor: 'text-white' },
		D: { name: 'D - Decent', color: 'bg-cyan-500', textColor: 'text-white' },
		E: { name: 'E - Bad', color: 'bg-gray-500', textColor: 'text-white' }
	};

	// Handle game click
	function handleGameClick(game: Game): void {
		modalStore.openViewModal(game);
	}

	// Export tier list as image
	async function exportTierList(): Promise<void> {
		try {
			// Import html2canvas dynamically
			const html2canvas = (await import('html2canvas')).default;

			const tierListElement = document.getElementById('tier-list-content');
			if (!tierListElement) {
				console.error('Tier list element not found');
				return;
			}

			// Configure html2canvas options for better quality
			const canvas = await html2canvas(tierListElement, {
				backgroundColor: '#0f1419', // Dark background
				scale: 2, // Higher resolution
				useCORS: true,
				allowTaint: true,
				width: tierListElement.scrollWidth,
				height: tierListElement.scrollHeight
			});

			// Convert to blob and download
			canvas.toBlob((blob: Blob | null) => {
				if (blob) {
					const url = URL.createObjectURL(blob);
					const link = document.createElement('a');
					link.href = url;
					link.download = `gaming-tier-list-${new Date().toISOString().split('T')[0]}.png`;
					document.body.appendChild(link);
					link.click();
					document.body.removeChild(link);
					URL.revokeObjectURL(url);
				}
			}, 'image/png');
		} catch (error) {
			console.error('Failed to export tier list:', error);
			// Fallback: could show an error message to user
		}
	}
</script>

<svelte:head>
	<title>Gaming Tracker - Tier List</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if tierGames.length === 0}
		<div class="empty-state">
			<Trophy size={48} class="mb-4 opacity-50" />
			<h2>No tiered games yet</h2>
			<p>Complete some games and assign tiers to see the tier list!</p>
		</div>
	{:else}
		<!-- Header with export button -->
		<div class="mb-6 flex items-center justify-between">
			<div>
				<h1 class="mb-2 text-2xl font-bold text-white dark:text-gray-900">Gaming Tier List</h1>
				<p class="text-gray-400 dark:text-gray-600">
					{tierGames.length} game{tierGames.length !== 1 ? 's' : ''} organized by personal rating
				</p>
			</div>
			<button
				onclick={exportTierList}
				class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
				title="Export tier list as image"
			>
				<Download size={16} />
				Export Image
			</button>
		</div>

		<!-- Tier List Content (for export) -->
		<div id="tier-list-content" class="tier-list-content rounded-lg bg-gray-900 p-6 dark:bg-white">
			{#each Object.entries(tierConfig) as [tierKey, tierInfo] (tierKey)}
				{@const gamesInTier = gamesByTier[tierKey] || []}
				{#if gamesInTier.length > 0}
					<!-- Tier Row -->
					<div class="tier-row mb-6">
						<!-- Tier Header -->
						<div class="tier-header mb-3 flex items-center gap-3">
							<div
								class="tier-badge {tierInfo.color} {tierInfo.textColor} min-w-0 rounded px-3 py-1 text-sm font-semibold"
							>
								{tierInfo.name}
							</div>
							<span class="text-sm text-gray-400 dark:text-gray-600">
								{gamesInTier.length} game{gamesInTier.length !== 1 ? 's' : ''}
							</span>
						</div>

						<!-- Games in this tier -->
						<div class="games-row flex gap-3 overflow-x-auto pb-2">
							{#each gamesInTier as game (game.id)}
								<div
									class="game-card flex-shrink-0 transform cursor-pointer transition-transform hover:scale-105"
									onclick={() => handleGameClick(game)}
								>
									<!-- Cover -->
									<div class="relative">
										<img
											src="/{game.coverImage}"
											alt="{game.title} cover"
											class="h-30 w-20 rounded border-2 border-gray-700 object-cover dark:border-gray-300"
											onerror={(e) => {
												const img = e.target as HTMLImageElement;
												img.style.display = 'none';
											}}
										/>
										<!-- Score badge -->
										{#if game.score}
											<div
												class="absolute -top-2 -right-2 min-w-0 rounded bg-gray-800 px-1 py-0.5 text-xs font-semibold text-white dark:bg-gray-200 dark:text-gray-900"
											>
												{game.score}
											</div>
										{/if}
									</div>

									<!-- Title -->
									<div class="mt-2 text-center">
										<p
											class="line-clamp-2 max-w-0 text-xs leading-tight font-medium text-gray-300 dark:text-gray-700"
										>
											{game.title}
										</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.main-content {
		padding: 2rem;
		min-height: calc(100vh - 140px);
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		text-align: center;
		color: #8b92a8;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
		color: inherit;
	}

	.tier-list-content {
		min-height: 600px;
	}

	.tier-row {
		border-bottom: 1px solid #2a2f3a;
		padding-bottom: 1.5rem;
	}

	.tier-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.tier-header {
		align-items: center;
	}

	.tier-badge {
		font-weight: 600;
		letter-spacing: 0.025em;
	}

	.games-row {
		scrollbar-width: thin;
		scrollbar-color: #4a5568 #2d3748;
	}

	.games-row::-webkit-scrollbar {
		height: 6px;
	}

	.games-row::-webkit-scrollbar-track {
		background: #2d3748;
		border-radius: 3px;
	}

	.games-row::-webkit-scrollbar-thumb {
		background: #4a5568;
		border-radius: 3px;
	}

	.games-row::-webkit-scrollbar-thumb:hover {
		background: #718096;
	}

	.game-card {
		max-width: 80px;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* Light mode adjustments */
	:global(.light) .tier-row {
		border-bottom-color: #e5e7eb;
	}

	:global(.light) .games-row {
		scrollbar-color: #cbd5e0 #f7fafc;
	}

	:global(.light) .games-row::-webkit-scrollbar-track {
		background: #f7fafc;
	}

	:global(.light) .games-row::-webkit-scrollbar-thumb {
		background: #cbd5e0;
	}

	:global(.light) .games-row::-webkit-scrollbar-thumb:hover {
		background: #a0aec0;
	}

	/* Mobile responsiveness */
	@media (max-width: 768px) {
		.main-content {
			padding: 1rem;
		}

		.tier-list-content {
			padding: 1rem;
		}

		.game-card {
			max-width: 70px;
		}

		.games-row {
			gap: 0.5rem;
		}
	}
</style>

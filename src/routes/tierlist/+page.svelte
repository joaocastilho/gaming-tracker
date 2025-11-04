<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';
	import { Trophy } from 'lucide-svelte';

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
		B: { name: 'B - Great', color: 'bg-yellow-500', textColor: 'text-white' },
		C: { name: 'C - Good', color: 'bg-green-500', textColor: 'text-white' },
		D: { name: 'D - Decent', color: 'bg-cyan-500', textColor: 'text-white' },
		E: { name: 'E - Bad', color: 'bg-gray-500', textColor: 'text-white' }
	};

	// Handle game click
	function handleGameClick(game: Game): void {
		modalStore.openViewModal(game);
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
		<!-- Tier List Content -->
		<div class="tier-list-content p-6">
			{#each Object.entries(tierConfig) as [tierKey, tierInfo] (tierKey)}
				{@const gamesInTier = gamesByTier[tierKey] || []}
				{#if gamesInTier.length > 0}
					<!-- Tier Row -->
					<div class="tier-row mb-6">
						<!-- Tier Header -->
						<div
							class="tier-header mb-2 md:mb-3 {tierInfo.color} {tierInfo.textColor} flex items-center justify-between rounded px-3 py-2"
						>
							<span class="text-base font-semibold">
								{tierInfo.name}
							</span>
							<span class="text-base opacity-90">
								{gamesInTier.length} game{gamesInTier.length !== 1 ? 's' : ''}
							</span>
						</div>

						<!-- Games in this tier -->
						<div class="games-row flex flex-wrap justify-center gap-3">
							{#each gamesInTier as game (game.id)}
								<button
									type="button"
									class="game-card flex-shrink-0 transform cursor-pointer rounded-none transition-transform hover:scale-105"
									onclick={() => handleGameClick(game)}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault();
											handleGameClick(game);
										}
									}}
									aria-label="View details for {game.title}"
								>
									<!-- Cover -->
									<div class="relative">
										<img
											src="/{game.coverImage}"
											alt="{game.title} cover"
											class="h-full w-full rounded-none border border-black object-cover dark:border-gray-300"
											loading="lazy"
											onerror={(e) => {
												const img = e.target as HTMLImageElement;
												img.style.display = 'none';
											}}
										/>
									</div>

									<!-- Title -->
									<div class="mt-2 text-center">
										<p
											class="line-clamp-2 text-sm leading-tight font-medium text-gray-300 dark:text-gray-700"
										>
											{game.title}
										</p>
									</div>
								</button>
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
		max-width: 182px;
		display: flex;
		flex-direction: column;
		align-items: center;
		border-radius: 0;
	}

	.game-card .relative {
		width: 182px;
		height: 280px;
		margin: 0 auto;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		line-clamp: 2;
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
			max-width: 140px;
		}

		.game-card .relative {
			width: 140px;
			height: 215px; /* Maintain aspect ratio: 140/182 * 280 ≈ 215 */
		}

		.games-row {
			gap: 0.5rem;
		}
	}
</style>

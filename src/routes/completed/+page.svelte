<script lang="ts">
	import { gamesStore } from '$lib/stores/games';
	import { filtersStore } from '$lib/stores/filters';
	import { appStore } from '$lib/stores/app';
	import { modalStore } from '$lib/stores/modal';
	import GamesView from '$lib/views/GamesView.svelte';
	import type { Game } from '$lib/types/game';
	import { RotateCcw } from 'lucide-svelte';

	let allGames = $state<Game[]>([]);
	let hasInitializedGames = $state(false);
	let isLoadingGames = $state(true);

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
		}
	});

	// Force active tab to completed
	$effect(() => {
		appStore.setActiveTab('completed', true);
	});

	// Initialize URL reading
	$effect(() => {
		if (typeof window !== 'undefined') {
			const searchParams = new URLSearchParams(window.location.search);
			filtersStore.readFromURL(searchParams);
			appStore.readFromURL(searchParams);
		}
	});

	// Handle URL writing
	$effect(() => {
		const updateURLs = () => {
			try {
				filtersStore.writeToURL();
				appStore.writeToURL();
			} catch (error) {
				if (error instanceof Error && error.message.includes('router is initialized')) {
					setTimeout(updateURLs, 10);
				}
			}
		};

		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(updateURLs);
		} else {
			setTimeout(updateURLs, 10);
		}
	});

	// Initialize games from server data or wait for store
	$effect(() => {
		const unsubscribe = gamesStore.loading.subscribe((loading) => {
			isLoadingGames = loading;
		});

		const gamesUnsubscribe = gamesStore.subscribe((games) => {
			if (games && games.length > 0 && !hasInitializedGames) {
				hasInitializedGames = true;
			}
		});

		return () => {
			unsubscribe();
			gamesUnsubscribe();
		};
	});

	// Subscribe to filter changes
	$effect(() => {
		const unsubscribe = filtersStore.subscribe(($filters) => {
			// Logic moved to filteredGamesStore
		});
		return unsubscribe;
	});

	// Use the shared filtered games store
	import { filteredGames } from '$lib/stores/filteredGamesStore';
	let displayedGames = $state<Game[]>([]);

	$effect(() => {
		const unsubscribe = filteredGames.subscribe((games) => {
			displayedGames = games;
		});
		return unsubscribe;
	});

	function openModalWithFilterContext(game: Game) {
		modalStore.openViewModal(game, displayedGames);
	}

	let hasActiveFilters = $derived(filtersStore.isAnyFilterApplied());
</script>

<svelte:head>
	<title>Completed Games - Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if isLoadingGames}
		<div class="loading">Loading completed games...</div>
	{:else if hasActiveFilters && displayedGames.length === 0}
		<div class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center">
			<h2 class="font-semibold">No completed games match your current filters</h2>
			<p class="text-gray-600 dark:text-gray-400">
				Try adjusting or clearing your filters to see your completed games.
			</p>
			<button
				class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors"
				type="button"
				onclick={() => {
					filtersStore.resetAllFilters();
					filtersStore.setSearchTerm('');
					filtersStore.setSort({ key: 'finishedDate', direction: 'desc' });
				}}
			>
				<RotateCcw size={18} />
				Reset
			</button>
		</div>
	{:else}
		<GamesView filteredGames={displayedGames} onOpenModal={openModalWithFilterContext} />
	{/if}
</div>

<style>
	.no-results {
		font-size: 1.5rem;
		color: var(--color-text-primary);
	}

	.reset-button {
		color: var(--color-text-primary);
		font-size: 1rem;
		cursor: pointer;
	}

	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 50vh;
		text-align: center;
		font-weight: 500;
		color: var(--color-text-primary);
		font-size: clamp(1.1rem, 2.5vw, 1.6rem);
	}
</style>

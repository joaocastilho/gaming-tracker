<script lang="ts">
	import { page } from '$app/state';
	import { filtersStore } from '$lib/stores/filters.js';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from '../$types';

	let { data }: { data: PageData } = $props();

	let allGamesFromStore: Game[] = [];
	let isLoadingView = $state(false);
	let TierListViewComponent = $state<
		typeof import('$lib/views/TierListView.svelte').default | null
	>(null);

	const { loading } = gamesStore;

	gamesStore.subscribe((games) => {
		allGamesFromStore = games;
	});

	async function loadTierListView() {
		if (TierListViewComponent) return;

		isLoadingView = true;
		try {
			const module = await import('$lib/views/TierListView.svelte');
			TierListViewComponent = module.default;
		} catch (err) {
			console.error('Failed to load tier list view:', err);
		} finally {
			isLoadingView = false;
		}
	}

	$effect(() => {
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}

		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);

		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');

		appStore.setActiveTab('tierlist');

		loadTierListView();
	});

	const tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));
</script>

<div class="main-content" id="main-content">
	{#if $loading || isLoadingView || !TierListViewComponent}
		<div class="loading">Loading tiers...</div>
	{:else}
		<TierListViewComponent filteredGames={tierListGames} />
	{/if}
</div>

<style>
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

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

		// Ensure URL-derived filters are respected
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);

		// Tierlist should ignore filters and search
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');

		// Mark active tab as tierlist for shared UI
		appStore.setActiveTab('tierlist');

		// Lazy-load tierlist view
		loadTierListView();
	});

	const tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));
</script>

<svelte:head>
	<title>Tier List - Gaming Tracker</title>
</svelte:head>

<div class="main-content" id="main-content">
	{#if $loading || isLoadingView || !TierListViewComponent}
		<p>Loading tier list...</p>
	{:else}
		<TierListViewComponent filteredGames={tierListGames} />
	{/if}
</div>

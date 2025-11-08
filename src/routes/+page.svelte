<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { sortStore } from '$lib/stores/sort.js';
	import { debounce } from '$lib/utils/debounce.js';
	import { generateSrcset, generateSizes } from '$lib/utils/imageSrcset.js';
	import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';
	import GamesView from '$lib/views/GamesView.svelte';

	import type { FilteredGameData } from '$lib/stores/filters.js';
	import type { Game } from '$lib/types/game.js';
	import type { Component } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	interface TierListViewProps {
		filteredGames: Game[];
	}

	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	let filteredData = $state<FilteredGameData>({
		filteredGames: [],
		totalCount: 0,
		completedCount: 0,
		plannedCount: 0
	});

	let allGamesFromStore = $state<Game[]>([]);
	let currentActiveTab = $state<'all' | 'completed' | 'planned' | 'tierlist'>('all');
	let TierListViewComponent = $state<Component<TierListViewProps> | null>(null);
	let isLoadingView = $state(false);

	// Debounced URL update functions to reduce main-thread jank
	const debouncedFiltersWriteToURL = debounce(() => filtersStore.writeToURL(), 100);
	const debouncedAppWriteToURL = debounce(() => appStore.writeToURL(), 100);
	const debouncedSortWriteToURL = debounce(() => sortStore.writeToURL(), 100);

	filteredGamesStore.subscribe((data) => {
		filteredData = data;
	});

	const { loading } = gamesStore;

	gamesStore.subscribe((games) => {
		allGamesFromStore = games;
	});

	appStore.activeTab.subscribe((activeTab) => {
		currentActiveTab = activeTab;
		if (activeTab === 'tierlist') {
			loadTierListView();
		}
	});

	// Handle browser back/forward navigation
	$effect(() => {
		filtersStore.readFromURL(page.url.searchParams);
		appStore.readFromURL(page.url.searchParams);
		sortStore.readFromURL(page.url.searchParams);
	});

	// Update URL with current filter state on initial load (defer to ensure router is ready)
	$effect(() => {
		const updateURLs = () => {
			try {
				debouncedFiltersWriteToURL();
				debouncedAppWriteToURL();
				debouncedSortWriteToURL();
			} catch (error) {
				// If router still not ready, try again later
				if (error instanceof Error && error.message.includes('router is initialized')) {
					setTimeout(updateURLs, 10);
				}
			}
		};

		// Use requestAnimationFrame for better timing, fallback to setTimeout
		if (typeof requestAnimationFrame !== 'undefined') {
			requestAnimationFrame(updateURLs);
		} else {
			setTimeout(updateURLs, 10);
		}
	});

	let criticalGames = (data.criticalGames || []).slice(0, 6);

	// For tier list, get all games that have tiers assigned (ignoring status filters)
	let tierListGames = $derived(allGamesFromStore.filter((game) => game.tier));

	// Load tier list view component only when needed
	async function loadTierListView() {
		if (TierListViewComponent) return; // Already loaded

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

	// Preload tier list view when hovering over tier list tab (called from Header component)
	function preloadTierListView() {
		if (!TierListViewComponent) {
			loadTierListView();
		}
	}

	// Expose preload function for Header component to use
	// This will be called via appStore or directly if needed
	if (typeof window !== 'undefined') {
		type WindowWithPreload = Window & {
			__preloadTierListView?: () => void;
		};
		(window as WindowWithPreload).__preloadTierListView = preloadTierListView;
	}

	// Load games data when the component mounts
	$effect(() => {
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}
	});
</script>

<svelte:head>
	<title>Gaming Tracker</title>
	{#each criticalGames as game (game.id)}
		<link
			rel="preload"
			as="image"
			href={game.coverImage}
			imagesrcset={generateSrcset(game.coverImage)}
			imagesizes={generateSizes('gallery')}
			fetchpriority="high"
		/>
	{/each}
</svelte:head>

<div class="main-content" id="main-content">
	{#if $loading || isLoadingView}
		<!-- Loading Skeleton -->
		<div
			class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
		>
			<GameCardSkeleton count={12} />
		</div>
	{:else if currentActiveTab === 'tierlist' && TierListViewComponent}
		<TierListViewComponent filteredGames={tierListGames} />
	{:else if currentActiveTab !== 'tierlist'}
		<GamesView filteredGames={filteredData.filteredGames} />
	{/if}
</div>

<script lang="ts">
	import { page } from '$app/state';
	import GamesView from '$lib/views/GamesView.svelte';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { get } from 'svelte/store';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from '../$types';
	import type { SortOption } from '$lib/stores/filters.js';
	import { getTierDisplayName } from '$lib/utils/colorConstants.js';

	// For URL writing
	let requestAnimationFrame: typeof globalThis.requestAnimationFrame;
	if (typeof window !== 'undefined') {
		requestAnimationFrame = window.requestAnimationFrame;
	}

	let { data }: { data: PageData } = $props();

	let allGames: Game[] = [];
	let isLoading = $state(true);
	let currentFilterState = $state<{
		searchTerm: string;
		platforms: string[];
		genres: string[];
		statuses: string[];
		tiers: string[];
		sortOption: SortOption | null;
	}>({
		searchTerm: '',
		platforms: [],
		genres: [],
		statuses: [],
		tiers: [],
		sortOption: null
	});

	const { loading } = gamesStore;

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
			isLoading = false;
		}
	});

	// Subscribe to filter changes
	$effect(() => {
		const unsubscribe = filtersStore.subscribe(($filters) => {
			if ($filters) {
				currentFilterState = {
					searchTerm: $filters.searchTerm,
					platforms: $filters.platforms,
					genres: $filters.genres,
					statuses: $filters.statuses,
					tiers: $filters.tiers,
					sortOption: $filters.sortOption
				};
			}
		});
		return unsubscribe;
	});

	// Initialize URL reading and set active tab when navigating to this page
	$effect(() => {
		if (data.games) {
			// Handle both promise and direct array data
			if (data.games instanceof Promise) {
				data.games
					.then((resolvedGames) => {
						gamesStore.initializeGames(resolvedGames);
					})
					.catch((error) => {
						console.error('Failed to load games:', error);
					});
			} else {
				gamesStore.initializeGames(data.games);
			}
		}

		// Read filters from URL
		if (page.url) {
			filtersStore.readFromURL(page.url.searchParams);
			appStore.readFromURL(page.url.searchParams);
		}

		const currentTab = get(appStore.activeTab);
		if (currentTab !== 'completed') {
			appStore.setActiveTab('completed', true);
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

	// Function to get filtered completed games
	function getFilteredCompletedGames(): Game[] {
		// Wait for games to load
		if (allGames.length === 0) {
			return [];
		}

		let filteredGames = allGames;

		// Apply search filter
		if (currentFilterState.searchTerm.trim()) {
			const query = currentFilterState.searchTerm.toLowerCase().trim();
			filteredGames = filteredGames.filter((game) => {
				const titleMatch = game.title.toLowerCase().includes(query);
				const genreMatch = game.genre.toLowerCase().includes(query);
				const platformMatch = game.platform.toLowerCase().includes(query);
				return titleMatch || genreMatch || platformMatch;
			});
		}

		// Apply platform filter
		if (currentFilterState.platforms.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				currentFilterState.platforms.includes(game.platform)
			);
		}

		// Apply genre filter
		if (currentFilterState.genres.length > 0) {
			filteredGames = filteredGames.filter((game) =>
				currentFilterState.genres.includes(game.genre)
			);
		}

		// Apply tier filter
		if (currentFilterState.tiers.length > 0) {
			filteredGames = filteredGames.filter((game) => {
				if (!game.tier) return false;
				const gameTierFullName = getTierDisplayName(game.tier);
				return currentFilterState.tiers.includes(gameTierFullName);
			});
		}

		// Apply tab-specific filtering (completed games only)
		filteredGames = filteredGames.filter((game) => game.status === 'Completed');

		// Sort completed games by finished date (most recent first)
		return filteredGames.toSorted((a, b) => {
			if (!a.finishedDate && !b.finishedDate) return 0;
			if (!a.finishedDate) return 1;
			if (!b.finishedDate) return -1;
			return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
		});
	}

	// Derived for filtered completed games
	let completedGames = $derived(getFilteredCompletedGames());
</script>

<div class="main-content" id="main-content">
	{#if $loading || isLoading}
		<div class="loading">Loading games...</div>
	{:else}
		<GamesView filteredGames={completedGames} />
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

<script lang="ts">
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { get } from 'svelte/store';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from '../$types';
	import type { Component } from 'svelte';

	let { data }: { data: PageData } = $props();

	let allGames: Game[] = [];
	let isLoading = $state(true);
	let TierListViewComponent = $state<Component<{ filteredGames: Game[] }> | null>(null);

	const { loading } = gamesStore;

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
			isLoading = false;
		}
	});

	// Set active tab when navigating to this page
	$effect(() => {
		if (data.games) {
			gamesStore.initializeGames(data.games);
		}
		
		const currentTab = get(appStore.activeTab);
		if (currentTab !== 'tierlist') {
			appStore.setActiveTab('tierlist', true);
		}

		// Load tier list view component
		if (!TierListViewComponent) {
			import('$lib/views/TierListView.svelte')
				.then((module) => {
					TierListViewComponent = module.default;
				})
				.catch((err) => {
					console.error('Failed to load tier list view:', err);
				});
		}
	});

	// Function to get tiered games
	function getTieredGames(): Game[] {
		if (allGames.length === 0) return [];
		
		return allGames.filter(game => game.tier);
	}

	// Simple derived for tiered games
	let tieredGames = $derived(getTieredGames());
</script>

<div class="main-content" id="main-content">
	{#if $loading || isLoading || !TierListViewComponent}
		<div class="loading">Loading tiers...</div>
	{:else}
		<TierListViewComponent filteredGames={tieredGames} />
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

<script lang="ts">
	import GamesView from '$lib/views/GamesView.svelte';
	import { gamesStore } from '$lib/stores/games.js';
	import { appStore } from '$lib/stores/app.js';
	import { get } from 'svelte/store';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from '../$types';

	let { data }: { data: PageData } = $props();

	let allGames: Game[] = [];
	let isLoading = $state(true);

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
		if (currentTab !== 'completed') {
			appStore.setActiveTab('completed', true);
		}
	});

	// Function to get completed games
	function getCompletedGames(): Game[] {
		if (allGames.length === 0) return [];
		
		return allGames
			.filter(game => game.status === 'Completed')
			.toSorted((a, b) => {
				if (!a.finishedDate && !b.finishedDate) return 0;
				if (!a.finishedDate) return 1;
				if (!b.finishedDate) return -1;
				return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
			});
	}

	// Simple derived for completed games
	let completedGames = $derived(getCompletedGames());
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

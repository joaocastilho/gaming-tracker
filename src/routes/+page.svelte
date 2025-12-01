<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { filtersStore } from '$lib/stores/filters.js';
	import { appStore } from '$lib/stores/app.js';
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Simple state management
	let allGames = $state<Game[]>([]);
	let hasInitializedGames = $state(false);

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
		}
	});

	// Force active tab to all
	$effect(() => {
		appStore.setActiveTab('all', true);
	});

	// Consolidated effect for all URL operations to reduce re-renders
	$effect(() => {
		if (typeof window !== 'undefined') {
			const searchParams = new URLSearchParams(window.location.search);

			// Read from URL
			filtersStore.readFromURL(searchParams);
			appStore.readFromURL(searchParams);

			// Write to URL in next frame to avoid conflicts
			requestAnimationFrame(() => {
				try {
					filtersStore.writeToURL();
					appStore.writeToURL();
				} catch (error) {
					if (error instanceof Error && error.message.includes('router is initialized')) {
						setTimeout(() => {
							filtersStore.writeToURL();
							appStore.writeToURL();
						}, 10);
					}
				}
			});
		}
	});

	// Initialize games from server data
	// Games initialization is now handled in +layout.svelte to prevent double initialization
	$effect(() => {
		if (!hasInitializedGames && $gamesStore.length > 0) {
			hasInitializedGames = true;
		} else if (!data.games && !hasInitializedGames) {
			// Just mark as initialized
			hasInitializedGames = true;
		}
	});

	// Handle URL reading for modal
	$effect(() => {
		if (allGames.length > 0) {
			modalStore.readFromURL(page.url.searchParams, allGames);
		}
	});

	// Handle pending modal from URL
	$effect(() => {
		if (allGames.length > 0) {
			modalStore.openPendingGameFromURL(allGames);
		}
	});
</script>

<svelte:head>
	<title>Gaming Tracker</title>
</svelte:head>

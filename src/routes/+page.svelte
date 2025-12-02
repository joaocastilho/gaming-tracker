<script lang="ts">
	import { page } from '$app/state';
	import { gamesStore } from '$lib/stores/games.js';
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';

	// Simple state management
	let allGames = $state<Game[]>([]);

	// Subscribe to games store
	gamesStore.subscribe((games) => {
		if (games && games.length > 0) {
			allGames = games;
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

``` ```

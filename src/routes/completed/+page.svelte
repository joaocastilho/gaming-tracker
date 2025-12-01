<script lang="ts">
	import { gamesStore } from '$lib/stores/games';
	import { filtersStore } from '$lib/stores/filters';
	import { appStore } from '$lib/stores/app';

	let hasInitializedGames = $state(false);

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
		const gamesUnsubscribe = gamesStore.subscribe((games) => {
			if (games && games.length > 0 && !hasInitializedGames) {
				hasInitializedGames = true;
			}
		});

		return () => {
			gamesUnsubscribe();
		};
	});
</script>

<svelte:head>
	<title>Completed Games - Gaming Tracker</title>
</svelte:head>

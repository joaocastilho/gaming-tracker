<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { Game } from '$lib/types/game';
import GameCardSkeleton from '$lib/components/GameCardSkeleton.svelte';
import GameCard from '$lib/components/GameCard.svelte';
import { setupProgressiveImagePreloading } from '$lib/utils/imagePreloader.js';

	interface Props {
		filteredGames: Game[];
		activeTab: 'all' | 'completed' | 'planned' | 'tierlist';
	}

	let { filteredGames, activeTab }: Props = $props();

	// Filter games based on active tab
	let displayedGames = $derived(() => {
		switch (activeTab) {
			case 'completed':
				return filteredGames
					.filter((game) => game.status === 'Completed')
					.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
			case 'planned':
				return filteredGames
					.filter((game) => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
			case 'all':
			default:
				return filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
		}
	});

	const [send, receive] = crossfade({
		duration: 200,
		easing: quintOut,
		fallback() {
			return {
				duration: 0
			};
		}
	});

	const ABOVE_FOLD_COUNT = 12;
	let gridContainer = $state<HTMLDivElement>();

	// Setup progressive image preloading
	let cleanupPreloader: (() => void) | null = null;

	onMount(() => {
		if (browser && gridContainer) {
			cleanupPreloader = setupProgressiveImagePreloading(gridContainer, '.cover-image', {
				rootMargin: '200px',
				threshold: 0.1,
				preloadCount: 3
			});
		}
	});

	onDestroy(() => {
		if (cleanupPreloader) {
			cleanupPreloader();
		}
	});
</script>

{#if displayedGames().length === 0}
	<!-- Show skeleton if no games to display -->
	<div
		class="grid max-w-full grid-cols-1 justify-items-center gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		<GameCardSkeleton count={12} />
	</div>
{:else}
	<div
		bind:this={gridContainer}
		class="game-grid grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
	>
		{#each displayedGames() as game, index (game.id)}
			<div in:receive={{ key: game.id }} out:send={{ key: game.id }}>
				<GameCard {game} isAboveFold={index < ABOVE_FOLD_COUNT} />
			</div>
		{/each}
	</div>
{/if}

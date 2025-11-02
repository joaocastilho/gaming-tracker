<script lang="ts">
	import type { Game } from '../types/game.js';

	interface Props {
		games: Game[];
		itemHeight: number;
		containerHeight: number;
		onRowClick?: (game: Game) => void;
	}

	let { games, itemHeight, containerHeight, onRowClick }: Props = $props();

	// Virtualization state
	let scrollTop = $state(0);
	let containerElement: HTMLDivElement | undefined;

	// Calculate visible range
	let startIndex = $derived(Math.floor(scrollTop / itemHeight));
	let endIndex = $derived(Math.min(
		startIndex + Math.ceil(containerHeight / itemHeight) + 1, // +1 for buffer
		games.length
	));

	let visibleGames = $derived(games.slice(startIndex, endIndex));
	let offsetY = $derived(startIndex * itemHeight);

	// Total height for scrollbar
	let totalHeight = $derived(games.length * itemHeight);

	function handleScroll(event: Event) {
		const target = event.target as HTMLDivElement;
		scrollTop = target.scrollTop;
	}

	function handleRowClick(game: Game) {
		if (onRowClick) {
			onRowClick(game);
		}
	}
</script>

<div
	class="virtualized-container"
	bind:this={containerElement}
	style="height: {containerHeight}px; overflow-y: auto;"
	onscroll={handleScroll}
>
	<div style="height: {totalHeight}px; position: relative;">
		<div style="transform: translateY({offsetY}px);">
			<!-- This component is designed to be extended by child components -->
			<!-- The actual row rendering should be handled by the parent component -->
		</div>
	</div>
</div>

<style>
	.virtualized-container {
		scrollbar-width: thin;
		scrollbar-color: #4a5568 #2d3748;
	}

	.virtualized-container::-webkit-scrollbar {
		width: 6px;
	}

	.virtualized-container::-webkit-scrollbar-track {
		background: #2d3748;
		border-radius: 3px;
	}

	.virtualized-container::-webkit-scrollbar-thumb {
		background: #4a5568;
		border-radius: 3px;
	}

	.virtualized-container::-webkit-scrollbar-thumb:hover {
		background: #718096;
	}
</style>

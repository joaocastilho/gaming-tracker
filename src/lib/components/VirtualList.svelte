<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props<T> {
		items: T[];
		itemHeight: number;
		containerHeight: number;
		overscan?: number;
		renderItem: Snippet<[item: T, isPriority: boolean]>;
		keyExtractor: (item: T, index: number) => string | number;
		className?: string;
		priorityCount?: number;
	}

	let {
		items = [],
		itemHeight = 200,
		containerHeight = 600,
		overscan = 5,
		renderItem,
		keyExtractor,
		className = '',
		priorityCount = 6
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}: Props<any> = $props();

	let container = $state<HTMLDivElement>();
	let scrollTop = $state(0);

	// Calculate visible range
	let visibleRange = $derived(() => {
		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
		const end = Math.min(
			items.length,
			Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
		);
		return { start, end };
	});

	// Get visible items
	let visibleItems = $derived(() => {
		const range = visibleRange();
		return items.slice(range.start, range.end).map((item, index) => ({
			item,
			index: range.start + index
		}));
	});

	// Total height of the virtual list
	let totalHeight = $derived(() => items.length * itemHeight);

	// Handle scroll events
	function handleScroll(event: Event) {
		const target = event.target as HTMLDivElement;
		scrollTop = target.scrollTop;
	}
</script>

<div
	bind:this={container}
	class="virtual-list-container {className}"
	style="height: {containerHeight}px; overflow-y: auto; position: relative;"
	onscroll={handleScroll}
>
	<!-- Spacer for virtual positioning -->
	<div class="virtual-spacer" style="height: {totalHeight}px; position: relative;"></div>

	<!-- Visible items -->
	<div
		class="virtual-items"
		style="position: absolute; top: {visibleRange().start * itemHeight}px; left: 0; right: 0;"
	>
		{#each visibleItems() as { item, index } (keyExtractor(item, index))}
			<div class="virtual-item" style="height: {itemHeight}px; overflow: hidden;">
				{@render renderItem(item, index < priorityCount)}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		contain: strict;
		will-change: scroll-position;
	}

	.virtual-spacer {
		pointer-events: none;
	}

	.virtual-items {
		width: 100%;
	}

	.virtual-item {
		width: 100%;
		overflow: hidden;
	}

	/* Optimize scrolling performance */
	:global(.virtual-list-container) {
		scroll-behavior: smooth;
		scrollbar-width: thin;
		scrollbar-color: var(--color-accent) transparent;
	}

	:global(.virtual-list-container)::-webkit-scrollbar {
		width: 6px;
	}

	:global(.virtual-list-container)::-webkit-scrollbar-track {
		background: transparent;
	}

	:global(.virtual-list-container)::-webkit-scrollbar-thumb {
		background-color: var(--color-accent);
		border-radius: 3px;
	}

	:global(.virtual-list-container)::-webkit-scrollbar-thumb:hover {
		background-color: var(--color-accent-foreground);
	}
</style>

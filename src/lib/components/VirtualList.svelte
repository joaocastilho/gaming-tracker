<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onMount, onDestroy } from 'svelte';

	interface Props<T> {
		items: T[];
		itemHeight: number;
		containerHeight?: number; // Optional now
		overscan?: number;
		renderItem: Snippet<[item: T, isPriority: boolean]>;
		keyExtractor: (item: T, index: number) => string | number;
		className?: string;
		priorityCount?: number;
		useWindowScroll?: boolean;
	}

	let {
		items = [],
		itemHeight = 200,
		containerHeight = 600,
		overscan = 5,
		renderItem,
		keyExtractor,
		className = '',
		priorityCount = 6,
		useWindowScroll = false
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}: Props<any> = $props();

	let container = $state<HTMLDivElement>();
	let scrollTop = $state(0);
	let windowHeight = $state(0);

	// Calculate visible range
	let visibleRange = $derived(() => {
		const effectiveHeight = useWindowScroll ? windowHeight : containerHeight;
		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
		const end = Math.min(
			items.length,
			Math.ceil((scrollTop + effectiveHeight) / itemHeight) + overscan
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
	let totalHeight = $derived(items.length * itemHeight);

	// Handle scroll events
	function handleScroll(event: Event) {
		if (useWindowScroll) {
			// For window scroll, we need to account for the container's offset from the top
			if (container) {
				const rect = container.getBoundingClientRect();
				// Calculate how far we've scrolled past the start of the container
				// rect.top is negative when we've scrolled past the start
				// We want scrollTop relative to the container
				const offset = -rect.top;
				scrollTop = Math.max(0, offset);
			}
		} else {
			const target = event.target as HTMLDivElement;
			scrollTop = target.scrollTop;
		}
	}

	function updateWindowHeight() {
		if (typeof window !== 'undefined') {
			windowHeight = window.innerHeight;
		}
	}

	onMount(() => {
		if (useWindowScroll) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			window.addEventListener('resize', updateWindowHeight);
			updateWindowHeight();
			// Initial calculation
			handleScroll({} as Event);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', updateWindowHeight);
		}
	});
</script>

<div
	bind:this={container}
	class="virtual-list-container {className}"
	style={useWindowScroll
		? `height: ${totalHeight}px; position: relative;`
		: `height: ${containerHeight}px; overflow-y: auto; position: relative;`}
	onscroll={!useWindowScroll ? handleScroll : undefined}
>
	{#if !useWindowScroll}
		<!-- Spacer for virtual positioning in internal scroll mode -->
		<div class="virtual-spacer" style="height: {totalHeight}px; position: relative;"></div>
	{/if}

	<!-- Visible items -->
	<div
		class="virtual-items"
		style="position: absolute; top: {visibleRange().start * itemHeight}px; left: 0; right: 0;"
	>
		{#each visibleItems() as { item, index } (keyExtractor(item, index))}
			<div class="virtual-item" style="height: {itemHeight}px;">
				{@render renderItem(item, index < priorityCount)}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		contain: layout paint; /* strict breaks window scroll sometimes */
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

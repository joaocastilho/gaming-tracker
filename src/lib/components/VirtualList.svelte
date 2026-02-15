<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';

	import { safeKeyExtractor } from '$lib/utils/safeKeyExtractor';

	interface Props {
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
	}: Props = $props();

	let container = $state<HTMLDivElement>();
	let scrollTop = $state(0);
	let windowHeight = $state(0);

	let visibleRange = $derived.by(() => {
		const effectiveHeight = useWindowScroll ? windowHeight : containerHeight;
		const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
		const end = Math.min(
			items.length,
			Math.ceil((scrollTop + effectiveHeight) / itemHeight) + overscan
		);
		return { start, end };
	});

	let visibleItems = $derived.by(() => {
		const range = visibleRange;
		return items.slice(range.start, range.end).map((item, index) => ({
			item,
			index: range.start + index
		}));
	});

	let totalHeight = $derived(items.length * itemHeight);

	function handleScroll(event: Event) {
		if (useWindowScroll) {
			if (container) {
				const rect = container.getBoundingClientRect();
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

	$effect(() => {
		if (useWindowScroll) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			window.addEventListener('resize', updateWindowHeight);
			updateWindowHeight();
			handleScroll({} as Event);

			return () => {
				window.removeEventListener('scroll', handleScroll);
				window.removeEventListener('resize', updateWindowHeight);
			};
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
		<div class="virtual-spacer" style="height: {totalHeight}px; position: relative;"></div>
	{/if}

	<div
		class="virtual-items"
		style="position: absolute; top: {visibleRange.start * itemHeight}px; left: 0; right: 0;"
	>
		{#each visibleItems as { item, index } (safeKeyExtractor(item, index, keyExtractor))}
			<div class="virtual-item">
				{@render renderItem(item, index < priorityCount)}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		contain: layout paint;
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
	}

	@supports (scrollbar-width: thin) {
		:global(.virtual-list-container) {
			scrollbar-width: thin;
			scrollbar-color: var(--color-accent) transparent;
		}
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

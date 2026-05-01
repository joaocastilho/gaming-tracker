<script lang="ts" generics="T">
import type { Snippet } from 'svelte';

import { safeKeyExtractor } from '$lib/utils/safeKeyExtractor';

interface Props {
	items: T[];
	itemHeight?: number;
	containerHeight?: number;
	overscan?: number;
	renderItem: Snippet<[item: T, isPriority: boolean]>;
	keyExtractor: (item: T, index: number) => string | number;
	className?: string;
	priorityCount?: number;
	useWindowScroll?: boolean;
	getItemHeight?: (index: number) => number;
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
	useWindowScroll = false,
	getItemHeight,
}: Props = $props();

let container = $state<HTMLDivElement>();
let scrollTop = $state(0);
let windowHeight = $state(0);

const hasVariableHeights = $derived(typeof getItemHeight === 'function');

const offsets = $derived.by(() => {
	if (!hasVariableHeights) return null;
	const arr: number[] = [0];
	for (let i = 0; i < items.length; i++) {
		const h = getItemHeight!(i);
		arr.push((arr[i] ?? 0) + h);
	}
	return arr;
});

const totalHeight = $derived(hasVariableHeights && offsets ? offsets[offsets.length - 1] : items.length * itemHeight);

function binarySearchStart(target: number): number {
	if (!offsets || offsets.length === 0) return 0;
	let low = 0;
	let high = offsets.length - 1;
	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (offsets[mid] < target) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
	return Math.max(0, low - 1);
}

function binarySearchEnd(target: number): number {
	if (!offsets || offsets.length === 0) return items.length;
	let low = 0;
	let high = offsets.length - 1;
	while (low < high) {
		const mid = Math.ceil((low + high) / 2);
		if (offsets[mid] <= target) {
			low = mid;
		} else {
			high = mid - 1;
		}
	}
	return Math.min(items.length, low + 1);
}

let visibleRange = $derived.by(() => {
	const effectiveHeight = useWindowScroll ? windowHeight : containerHeight;

	if (hasVariableHeights && offsets) {
		const start = Math.max(0, binarySearchStart(scrollTop) - overscan);
		const end = Math.min(items.length, binarySearchEnd(scrollTop + effectiveHeight) + overscan);
		return { start, end };
	}

	const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
	const end = Math.min(items.length, Math.ceil((scrollTop + effectiveHeight) / itemHeight) + overscan);
	return { start, end };
});

let visibleItems = $derived.by(() => {
	const range = visibleRange;
	return items.slice(range.start, range.end).map((item, index) => ({
		item,
		index: range.start + index,
	}));
});

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
		style="position: absolute; top: {hasVariableHeights && offsets
			? `${offsets[visibleRange.start] ?? 0}px`
			: `${visibleRange.start * itemHeight}px`}; left: 0; right: 0;"
	>
		{#each visibleItems as { item, index } (safeKeyExtractor(item, index, keyExtractor))}
			<div
				class="virtual-item"
				style={hasVariableHeights && getItemHeight
					? `height: ${getItemHeight(index)}px;`
					: ''}
			>
				{@render renderItem(item, index < priorityCount)}
			</div>
		{/each}
	</div>
</div>

<style>
	.virtual-list-container {
		width: 100%;
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


	@media (min-width: 768px) {
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
	}
</style>
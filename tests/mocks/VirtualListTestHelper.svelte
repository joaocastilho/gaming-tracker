<script lang="ts">
import VirtualList from '$lib/components/VirtualList.svelte';

interface Item {
	id: string;
	text: string;
}

interface Props {
	items: Item[];
	itemHeight?: number;
	containerHeight?: number;
	overscan?: number;
}

let { items, itemHeight = 100, containerHeight = 300, overscan = 2 }: Props = $props();

const keyExtractor = (item: Item) => item.id;
</script>

<VirtualList
	{items}
	{itemHeight}
	{containerHeight}
	{overscan}
	{keyExtractor}
>
	{#snippet renderItem(item, isPriority)}
		<div class="test-item" class:priority={isPriority}>
			{item.text}
		</div>
	{/snippet}
</VirtualList>

<script lang="ts">
import { browser } from '$app/env';
import { createGlobalKeydownHandler } from '#lib/utils/keyboardShortcuts.js';
import { filtersStore } from '#lib/stores/filters.svelte.js';
import SearchBar from '#lib/components/SearchBar.svelte';

$effect(() => {
	if (!browser) return;

	const handler = createGlobalKeydownHandler(() => ({
		onSearchToggle: () => {},
		onDesktopSearch: () => {
			filtersStore.toggleDesktopSearch();
			requestAnimationFrame(() => {
				const input = document.getElementById('search-input') as HTMLInputElement;
				input?.focus();
				input?.select();
			});
		},
	}));

	window.addEventListener('keydown', handler);
	return () => {
		window.removeEventListener('keydown', handler);
	};
});
</script>

<div>
	{#if filtersStore.isDesktopSearchOpen}
		<SearchBar />
	{/if}
</div>

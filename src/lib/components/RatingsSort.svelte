<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import type { SortKey, SortOption } from '$lib/stores/filters';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Award,
		ArrowUp,
		ArrowDown,
		Calendar,
		AArrowDown
	} from 'lucide-svelte';
	import { derived } from 'svelte/store';
	import { appStore } from '$lib/stores/app.js';

	const sortOptionStore = derived(
		filtersStore,
		($filters): SortOption | null => $filters?.sortOption ?? null
	);

	const activeTabStore = appStore.activeTab;

	function handleSort(key: SortKey) {
		const currentSort = $sortOptionStore;
		if (currentSort?.key === key) {
			// Toggle direction
			const newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
			filtersStore.setSort({ key, direction: newDirection });
		} else {
			// Default to descending for new sort key (higher score/rating is usually better/more relevant)
			// Exception: Alphabetical should default to ascending (A-Z)
			const direction = key === 'alphabetical' ? 'asc' : 'desc';
			filtersStore.setSort({ key, direction });
		}
	}
</script>

<div class="ratings-sort">
	<button
		type="button"
		class="sort-button"
		class:active={$sortOptionStore?.key === 'alphabetical'}
		onclick={() => handleSort('alphabetical')}
		aria-label="Sort Alphabetically"
	>
		<AArrowDown class="sort-icon text-gray-500" aria-hidden="true" />
		<span class="sort-field-label">Alphabetical</span>
		{#if $sortOptionStore?.key === 'alphabetical'}
			{#if $sortOptionStore.direction === 'asc'}
				<ArrowDown size={14} class="sort-direction-icon" />
			{:else}
				<ArrowUp size={14} class="sort-direction-icon" />
			{/if}
		{/if}
	</button>

	{#if $activeTabStore !== 'planned'}
		<button
			type="button"
			class="sort-button"
			class:active={$sortOptionStore?.key === 'presentation'}
			onclick={() => handleSort('presentation')}
			aria-label="Sort by Presentation"
		>
			<Presentation class="sort-icon text-cyan-500" aria-hidden="true" />
			<span class="sort-field-label">Presentation</span>
			{#if $sortOptionStore?.key === 'presentation'}
				{#if $sortOptionStore.direction === 'asc'}
					<ArrowUp size={14} class="sort-direction-icon" />
				{:else}
					<ArrowDown size={14} class="sort-direction-icon" />
				{/if}
			{/if}
		</button>

		<button
			type="button"
			class="sort-button"
			class:active={$sortOptionStore?.key === 'story'}
			onclick={() => handleSort('story')}
			aria-label="Sort by Story"
		>
			<NotebookPen class="sort-icon text-amber-600" aria-hidden="true" />
			<span class="sort-field-label">Story</span>
			{#if $sortOptionStore?.key === 'story'}
				{#if $sortOptionStore.direction === 'asc'}
					<ArrowUp size={14} class="sort-direction-icon" />
				{:else}
					<ArrowDown size={14} class="sort-direction-icon" />
				{/if}
			{/if}
		</button>

		<button
			type="button"
			class="sort-button"
			class:active={$sortOptionStore?.key === 'gameplay'}
			onclick={() => handleSort('gameplay')}
			aria-label="Sort by Gameplay"
		>
			<Gamepad2 class="sort-icon text-pink-500" aria-hidden="true" />
			<span class="sort-field-label">Gameplay</span>
			{#if $sortOptionStore?.key === 'gameplay'}
				{#if $sortOptionStore.direction === 'asc'}
					<ArrowUp size={14} class="sort-direction-icon" />
				{:else}
					<ArrowDown size={14} class="sort-direction-icon" />
				{/if}
			{/if}
		</button>

		<button
			type="button"
			class="sort-button"
			class:active={$sortOptionStore?.key === 'score'}
			onclick={() => handleSort('score')}
			aria-label="Sort by Score"
		>
			<Award class="sort-icon text-yellow-400" aria-hidden="true" />
			<span class="sort-field-label">Score</span>
			{#if $sortOptionStore?.key === 'score'}
				{#if $sortOptionStore.direction === 'asc'}
					<ArrowUp size={14} class="sort-direction-icon" />
				{:else}
					<ArrowDown size={14} class="sort-direction-icon" />
				{/if}
			{/if}
		</button>

		<button
			type="button"
			class="sort-button"
			class:active={$sortOptionStore?.key === 'finishedDate'}
			onclick={() => handleSort('finishedDate')}
			aria-label="Sort by Finishing Date"
		>
			<Calendar class="sort-icon text-green-500" aria-hidden="true" />
			<span class="sort-field-label">Finished Date</span>
			{#if $sortOptionStore?.key === 'finishedDate'}
				{#if $sortOptionStore.direction === 'asc'}
					<ArrowUp size={14} class="sort-direction-icon" />
				{:else}
					<ArrowDown size={14} class="sort-direction-icon" />
				{/if}
			{/if}
		</button>
	{/if}
</div>

<style>
	.ratings-sort {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.sort-button {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.6rem;
		border-radius: 0.375rem;
		border: 1px solid transparent;
		background-color: transparent;
		cursor: pointer;
		transition: all 0.2s ease;
		color: var(--color-text-secondary);
	}

	.sort-button:hover {
		background-color: var(--color-surface);
		color: var(--color-text-primary);
	}

	.sort-button.active {
		background-color: var(--color-surface);
		border-color: var(--color-border);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.sort-field-label {
		font-size: 0.9rem;
	}

	/* Adjust icon sizes */
	:global(.sort-icon) {
		width: 16px;
		height: 16px;
	}

	:global(.sort-direction-icon) {
		opacity: 0.7;
	}
</style>

<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import type { SortKey, SortOption } from '$lib/stores/filters';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Award,
		ChevronUp,
		ChevronDown
	} from 'lucide-svelte';
	import { derived } from 'svelte/store';

	type SortDirection = 'asc' | 'desc';

	const sortOptionStore = derived(
		filtersStore,
		($filters): SortOption | null => $filters?.sortOption ?? null
	);

	function setSort(key: SortKey, direction: SortDirection) {
		filtersStore.setSort({ key, direction });
	}
</script>

<div class="ratings-sort">
	<div class="sort-group">
		<Presentation class="sort-icon text-cyan-500" aria-hidden="true" />
		<span class="sort-field-label">Presentation</span>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'presentation' &&
				$sortOptionStore?.direction === 'asc'}
			on:click={() => setSort('presentation', 'asc')}
			aria-label="Sort by Presentation ascending"
		>
			<ChevronUp size={12} />
		</button>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'presentation' &&
				$sortOptionStore?.direction === 'desc'}
			on:click={() => setSort('presentation', 'desc')}
			aria-label="Sort by Presentation descending"
		>
			<ChevronDown size={12} />
		</button>
	</div>

	<div class="sort-group">
		<NotebookPen class="sort-icon text-amber-600" aria-hidden="true" />
		<span class="sort-field-label">Story</span>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'story' && $sortOptionStore?.direction === 'asc'}
			on:click={() => setSort('story', 'asc')}
			aria-label="Sort by Story ascending"
		>
			<ChevronUp size={12} />
		</button>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'story' && $sortOptionStore?.direction === 'desc'}
			on:click={() => setSort('story', 'desc')}
			aria-label="Sort by Story descending"
		>
			<ChevronDown size={12} />
		</button>
	</div>

	<div class="sort-group">
		<Gamepad2 class="sort-icon text-pink-500" aria-hidden="true" />
		<span class="sort-field-label">Gameplay</span>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'gameplay' && $sortOptionStore?.direction === 'asc'}
			on:click={() => setSort('gameplay', 'asc')}
			aria-label="Sort by Gameplay ascending"
		>
			<ChevronUp size={12} />
		</button>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'gameplay' &&
				$sortOptionStore?.direction === 'desc'}
			on:click={() => setSort('gameplay', 'desc')}
			aria-label="Sort by Gameplay descending"
		>
			<ChevronDown size={12} />
		</button>
	</div>

	<div class="sort-group">
		<Award class="sort-icon text-yellow-400" aria-hidden="true" />
		<span class="sort-field-label">Score</span>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'score' && $sortOptionStore?.direction === 'asc'}
			on:click={() => setSort('score', 'asc')}
			aria-label="Sort by Score ascending"
		>
			<ChevronUp size={12} />
		</button>
		<button
			type="button"
			class="sort-arrow"
			class:selected={$sortOptionStore?.key === 'score' && $sortOptionStore?.direction === 'desc'}
			on:click={() => setSort('score', 'desc')}
			aria-label="Sort by Score descending"
		>
			<ChevronDown size={12} />
		</button>
	</div>
</div>

<style>
	.ratings-sort {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	.sort-group {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
	}

	.sort-field-label {
		font-size: 0.9rem;
		color: var(--color-text-primary, #e5e7eb);
		margin-right: 0.1rem;
	}

	.sort-arrow {
		width: 18px;
		height: 18px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 0.6rem;
		border-radius: 4px;
		border: 1px solid var(--color-border, #374151);
		background-color: var(--color-surface, #111827);
		color: var(--color-text-primary, #e5e7eb);
		cursor: pointer;
		padding: 0;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease,
			transform 0.05s ease;
	}

	.sort-arrow.selected {
		font-weight: 700;
		background-color: #51596c;
		color: var(--color-accent-foreground, #ffffff);
		border-color: var(--color-accent, #2563eb);
	}

	.sort-arrow:hover {
		background-color: #51596c;
		color: var(--color-accent-foreground, #ffffff);
		border-color: var(--color-accent, #2563eb);
	}

	.sort-arrow:active {
		transform: scale(0.95);
	}
</style>

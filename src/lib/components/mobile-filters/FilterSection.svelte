<script lang="ts">
	import { SlidersHorizontal } from 'lucide-svelte';
	import FilterCategoryButton from './FilterCategoryButton.svelte';

	interface Props {
		showTiersFilter?: boolean;
		showCoOpFilter?: boolean;
		platformCount?: number;
		genreCount?: number;
		tierCount?: number;
		coOpSelected?: boolean;
		onPlatformClick: () => void;
		onGenreClick: () => void;
		onTierClick: () => void;
		onCoOpClick: () => void;
	}

	let {
		showTiersFilter = true,
		showCoOpFilter = true,
		platformCount = 0,
		genreCount = 0,
		tierCount = 0,
		coOpSelected = false,
		onPlatformClick,
		onGenreClick,
		onTierClick,
		onCoOpClick
	}: Props = $props();
</script>

<div class="mobile-filter-section">
	<h3 class="mobile-filter-section-title">
		<SlidersHorizontal size={16} class="section-icon" />
		Filter By
	</h3>
	<div class="mobile-filter-categories-compact">
		<FilterCategoryButton type="platforms" count={platformCount} onClick={onPlatformClick} />
		<FilterCategoryButton type="genres" count={genreCount} onClick={onGenreClick} />
		{#if showTiersFilter}
			<FilterCategoryButton type="tiers" count={tierCount} onClick={onTierClick} />
		{/if}
		{#if showCoOpFilter}
			<FilterCategoryButton type="coOp" count={coOpSelected ? 1 : 0} onClick={onCoOpClick} />
		{/if}
	</div>
</div>

<style>
	.mobile-filter-section {
		margin-bottom: 16px;
	}

	.mobile-filter-section-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 12px;
	}

	.mobile-filter-section-title :global(.section-icon) {
		color: var(--color-text-secondary);
	}

	.mobile-filter-categories-compact {
		display: flex;
		flex-wrap: nowrap;
		gap: 6px;
		justify-content: flex-start;
		padding-bottom: 4px;
		overflow-x: auto;
	}

	.mobile-filter-categories-compact::-webkit-scrollbar {
		display: none;
	}
</style>

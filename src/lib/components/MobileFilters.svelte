<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.svelte';
	import MobileFiltersHeader from './mobile-filters/MobileFiltersHeader.svelte';
	import FilterSection from './mobile-filters/FilterSection.svelte';
	import SortSection from './mobile-filters/SortSection.svelte';
	import FilterOptionsPopup from './mobile-filters/FilterOptionsPopup.svelte';

	interface Props {
		filterOptions: {
			platforms: string[];
			genres: string[];
			tiers: string[];
		};
		showTiersFilter?: boolean;
		showCoOpFilter?: boolean;
		title?: string;
		isOpen?: boolean;
		onClose?: () => void;
	}

	let {
		filterOptions,
		showTiersFilter = true,
		showCoOpFilter = true,
		title = 'Filters and Sorting',
		isOpen = $bindable(false),
		onClose
	}: Props = $props();

	let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

	let pendingPlatforms = $state<string[]>([]);
	let pendingGenres = $state<string[]>([]);
	let pendingTiers = $state<string[]>([]);
	let pendingCoOp = $state<string[]>([]);

	let selectedPlatforms = $derived($filtersStore?.platforms ?? []);
	let selectedGenres = $derived($filtersStore?.genres ?? []);
	let selectedTiers = $derived($filtersStore?.tiers ?? []);
	let selectedCoOp = $derived($filtersStore?.coOp ?? []);

	$effect(() => {
		if (isOpen) {
			pendingPlatforms = [...selectedPlatforms];
			pendingGenres = [...selectedGenres];
			pendingTiers = [...selectedTiers];
			pendingCoOp = [...selectedCoOp];
		}
	});

	$effect(() => {
		if (typeof document !== 'undefined' && (isOpen || activeFilterPopup)) {
			document.body.style.overflow = 'hidden';
			return () => {
				document.body.style.overflow = '';
			};
		}
	});

	function resetPendingFilters() {
		pendingPlatforms = [];
		pendingGenres = [];
		pendingTiers = [];
		pendingCoOp = [];
	}

	function resetFilters() {
		resetPendingFilters();
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
	}

	function applyFilters() {
		filtersStore.resetAllFilters();
		pendingPlatforms.forEach((p) => filtersStore.togglePlatform(p));
		pendingGenres.forEach((g) => filtersStore.toggleGenre(g));
		pendingTiers.forEach((t) => filtersStore.toggleTier(t));
		pendingCoOp.forEach((c) => filtersStore.toggleCoOp(c));
		onClose?.();
	}

	function closeWithoutApplying() {
		onClose?.();
		activeFilterPopup = null;
	}

	function togglePendingPlatform(platform: string) {
		if (pendingPlatforms.includes(platform)) {
			pendingPlatforms = pendingPlatforms.filter((p) => p !== platform);
		} else {
			pendingPlatforms = [...pendingPlatforms, platform];
		}
	}

	function togglePendingGenre(genre: string) {
		if (pendingGenres.includes(genre)) {
			pendingGenres = pendingGenres.filter((g) => g !== genre);
		} else {
			pendingGenres = [...pendingGenres, genre];
		}
	}

	function togglePendingTier(tier: string) {
		if (pendingTiers.includes(tier)) {
			pendingTiers = pendingTiers.filter((t) => t !== tier);
		} else {
			pendingTiers = [...pendingTiers, tier];
		}
	}

	function togglePendingCoOp(coOp: string) {
		if (pendingCoOp.includes(coOp)) {
			pendingCoOp = pendingCoOp.filter((c) => c !== coOp);
		} else {
			pendingCoOp = [...pendingCoOp, coOp];
		}
	}
</script>

{#if isOpen}
	<div
		class="mobile-filters-modal fixed inset-0 z-50 md:hidden"
		onclick={(e) => {
			if (e.target === e.currentTarget) closeWithoutApplying();
		}}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Escape') closeWithoutApplying();
		}}
	>
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
		<div
			class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl"
			style="background-color: var(--color-background);"
		>
			<MobileFiltersHeader
				{title}
				onApply={applyFilters}
				onReset={resetFilters}
				onClose={closeWithoutApplying}
			/>

			<div class="mobile-filters-content">
				<FilterSection
					{showTiersFilter}
					{showCoOpFilter}
					platformCount={pendingPlatforms.length}
					genreCount={pendingGenres.length}
					tierCount={pendingTiers.length}
					coOpSelected={pendingCoOp.includes('Yes')}
					onPlatformClick={() => (activeFilterPopup = 'platforms')}
					onGenreClick={() => (activeFilterPopup = 'genres')}
					onTierClick={() => (activeFilterPopup = 'tiers')}
					onCoOpClick={() => togglePendingCoOp('Yes')}
				/>

				<SortSection />
			</div>
		</div>

		{#if activeFilterPopup === 'platforms'}
			<FilterOptionsPopup
				type="platforms"
				options={filterOptions.platforms.map((p) => ({ value: p }))}
				selected={pendingPlatforms}
				onToggle={togglePendingPlatform}
				onReset={() => {
					pendingPlatforms = [];
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
			/>
		{/if}

		{#if activeFilterPopup === 'genres'}
			<FilterOptionsPopup
				type="genres"
				options={filterOptions.genres.map((g) => ({ value: g }))}
				selected={pendingGenres}
				onToggle={togglePendingGenre}
				onReset={() => {
					pendingGenres = [];
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
			/>
		{/if}

		{#if activeFilterPopup === 'tiers'}
			<FilterOptionsPopup
				type="tiers"
				options={filterOptions.tiers.map((t) => ({ value: t }))}
				selected={pendingTiers}
				onToggle={togglePendingTier}
				onReset={() => {
					pendingTiers = [];
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
			/>
		{/if}
	</div>
{/if}

<style>
	.mobile-filters-content {
		padding: 16px;
		max-height: calc(85vh - 80px);
		overflow-y: auto;
	}
</style>

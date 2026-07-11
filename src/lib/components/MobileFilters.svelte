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
	onClose,
}: Props = $props();

let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

let pendingPlatforms = $state<string[]>([]);
let pendingGenres = $state<string[]>([]);
let pendingTiers = $state<string[]>([]);
let pendingCoOp = $state<string[]>([]);

let selectedPlatforms = $derived(filtersStore.state?.platforms ?? []);
let selectedGenres = $derived(filtersStore.state?.genres ?? []);
let selectedTiers = $derived(filtersStore.state?.tiers ?? []);
let selectedCoOp = $derived(filtersStore.state?.coOp ?? []);

$effect(() => {
	if (isOpen) {
		pendingPlatforms = [...selectedPlatforms];
		pendingGenres = [...selectedGenres];
		pendingTiers = [...selectedTiers];
		pendingCoOp = [...selectedCoOp];
	}
});

function toggleAndApplyPlatform(platform: string) {
	togglePendingPlatform(platform);
	applyPendingFilters();
}

function toggleAndApplyGenre(genre: string) {
	togglePendingGenre(genre);
	applyPendingFilters();
}

function toggleAndApplyTier(tier: string) {
	togglePendingTier(tier);
	applyPendingFilters();
}

function toggleAndApplyCoOp(coOp: string) {
	togglePendingCoOp(coOp);
	applyPendingFilters();
}

function applyPendingFilters() {
	filtersStore.setFilters({
		platforms: [...pendingPlatforms],
		genres: [...pendingGenres],
		tiers: [...pendingTiers],
		coOp: [...pendingCoOp],
	});
}

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
	applyPendingFilters();
	onClose?.();
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
		role="dialog"
		aria-modal="true"
		aria-label="Filters and sorting"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Escape') applyFilters();
		}}
	>
		<div
			class="absolute inset-0 bg-black/50 backdrop-blur-sm"
			onclick={applyFilters}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					applyFilters();
				}
			}}
			role="button"
			tabindex="0"
			aria-label="Apply filters and close"
		></div>
		<div
			class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl"
			style="background-color: var(--color-background); color: var(--color-text-primary);"
		>
			<MobileFiltersHeader
				{title}
				onReset={resetFilters}
				onClose={applyFilters}
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
					onCoOpClick={() => toggleAndApplyCoOp('Yes')}
				/>

				<SortSection />
			</div>
		</div>

		{#if activeFilterPopup === 'platforms'}
			<FilterOptionsPopup
				type="platforms"
				options={filterOptions.platforms.map((p) => ({ value: p }))}
				selected={pendingPlatforms}
				onToggle={toggleAndApplyPlatform}
				onReset={() => {
					pendingPlatforms = [];
					applyPendingFilters();
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
				onAccept={(closeAll) => {
					applyPendingFilters();
					activeFilterPopup = null;
					if (closeAll) applyFilters();
				}}
			/>
		{/if}

		{#if activeFilterPopup === 'genres'}
			<FilterOptionsPopup
				type="genres"
				options={filterOptions.genres.map((g) => ({ value: g }))}
				selected={pendingGenres}
				onToggle={toggleAndApplyGenre}
				onReset={() => {
					pendingGenres = [];
					applyPendingFilters();
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
				onAccept={(closeAll) => {
					applyPendingFilters();
					activeFilterPopup = null;
					if (closeAll) applyFilters();
				}}
			/>
		{/if}

		{#if activeFilterPopup === 'tiers'}
			<FilterOptionsPopup
				type="tiers"
				options={filterOptions.tiers.map((t) => ({ value: t }))}
				selected={pendingTiers}
				onToggle={toggleAndApplyTier}
				onReset={() => {
					pendingTiers = [];
					applyPendingFilters();
					activeFilterPopup = null;
				}}
				onClose={() => (activeFilterPopup = null)}
				onAccept={(closeAll) => {
					applyPendingFilters();
					activeFilterPopup = null;
					if (closeAll) applyFilters();
				}}
			/>
		{/if}
	</div>
{/if}

<style>
	.mobile-filters-content {
		padding: 16px;
		max-height: calc(85vh - 80px);
		overflow-y: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.mobile-filters-content::-webkit-scrollbar {
		display: none;
	}
</style>

<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { getPlatformColor, getGenreColor, getTierColor } from '$lib/utils/filterOptions';
	import {
		RotateCcw,
		Check,
		X,
		ArrowUpDown,
		SlidersHorizontal,
		Monitor,
		Tag,
		Trophy,
		Users
	} from 'lucide-svelte';
	import RatingsSort from '$lib/components/RatingsSort.svelte';

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

	// Local state for sub-menus
	let activeFilterPopup = $state<'platforms' | 'genres' | 'tiers' | 'coOp' | null>(null);

	// Pending filter state
	let pendingPlatforms = $state<string[]>([]);
	let pendingGenres = $state<string[]>([]);
	let pendingTiers = $state<string[]>([]);
	let pendingCoOp = $state<string[]>([]);

	let selectedPlatforms = $derived($filtersStore?.platforms ?? []);
	let selectedGenres = $derived($filtersStore?.genres ?? []);
	let selectedTiers = $derived($filtersStore?.tiers ?? []);
	let selectedCoOp = $derived($filtersStore?.coOp ?? []);

	// Sync pending state when modal opens
	$effect(() => {
		if (isOpen) {
			pendingPlatforms = [...selectedPlatforms];
			pendingGenres = [...selectedGenres];
			pendingTiers = [...selectedTiers];
			pendingCoOp = [...selectedCoOp];
		}
	});

	// Scroll lock effect
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
		resetPendingFilters(); // Visual reset
		filtersStore.resetAllFilters(); // Store reset (if we want to reset immediately?)
		// The original logic resets immediately on the "Reset" button click?
		// Layout: onclick={() => { resetPendingFilters(); resetFilters(); }}
		// where resetFilters calls store.resetAllFilters AND store.setSearchTerm('').
		// So yes, immediate reset.
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

	// Toggle functions for pending state
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

	function resetCurrentCategoryPending() {
		if (activeFilterPopup === 'platforms') {
			pendingPlatforms = [];
		} else if (activeFilterPopup === 'genres') {
			pendingGenres = [];
		} else if (activeFilterPopup === 'tiers') {
			pendingTiers = [];
		} else if (activeFilterPopup === 'coOp') {
			pendingCoOp = [];
		}
		activeFilterPopup = null; // Close popup after reset? Layout says yes (resetCurrentCategoryPending set activeFilterPopup=null)
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
		<!-- Blurred backdrop -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
		<!-- Opaque content panel -->
		<div
			class="mobile-filters-container absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-hidden rounded-t-2xl shadow-2xl"
			style="background-color: var(--color-background);"
		>
			<!-- Header -->
			<div class="mobile-filters-header">
				<h2 class="mobile-filters-title">{title}</h2>
				<div class="mobile-filters-actions">
					<button
						type="button"
						class="mobile-header-icon apply-icon"
						onclick={applyFilters}
						aria-label="Apply filters"
						title="Apply"
					>
						<Check size={20} />
					</button>
					<button
						type="button"
						class="mobile-header-icon reset-icon"
						onclick={resetFilters}
						aria-label="Reset all filters"
						title="Reset"
					>
						<RotateCcw size={18} />
					</button>
					<button
						type="button"
						class="mobile-header-icon close-icon"
						onclick={closeWithoutApplying}
						aria-label="Close without applying"
						title="Close"
					>
						<X size={20} />
					</button>
				</div>
			</div>

			<div class="mobile-filters-content">
				<!-- Filter By Section -->
				<div class="mobile-filter-section">
					<h3 class="mobile-filter-section-title">
						<SlidersHorizontal size={16} class="section-icon" />
						Filter By
					</h3>
					<div class="mobile-filter-categories-compact">
						<button
							type="button"
							class="mobile-filter-category-compact {pendingPlatforms.length > 0
								? 'has-selection'
								: ''}"
							onclick={() => (activeFilterPopup = 'platforms')}
						>
							<Monitor size={14} />
							<span>Platforms</span>
							{#if pendingPlatforms.length > 0}
								<span class="category-count-small">{pendingPlatforms.length}</span>
							{/if}
						</button>
						<button
							type="button"
							class="mobile-filter-category-compact {pendingGenres.length > 0
								? 'has-selection'
								: ''}"
							onclick={() => (activeFilterPopup = 'genres')}
						>
							<Tag size={14} />
							<span>Genres</span>
							{#if pendingGenres.length > 0}
								<span class="category-count-small">{pendingGenres.length}</span>
							{/if}
						</button>
						{#if showTiersFilter}
							<button
								type="button"
								class="mobile-filter-category-compact {pendingTiers.length > 0
									? 'has-selection'
									: ''}"
								onclick={() => (activeFilterPopup = 'tiers')}
							>
								<Trophy size={14} />
								<span>Tiers</span>
								{#if pendingTiers.length > 0}
									<span class="category-count-small">{pendingTiers.length}</span>
								{/if}
							</button>
						{/if}
						{#if showCoOpFilter}
							<button
								type="button"
								class="mobile-filter-category-compact coop-toggle {pendingCoOp.includes('Yes')
									? 'has-selection'
									: ''}"
								onclick={() => togglePendingCoOp('Yes')}
							>
								<Users size={14} />
								<span>Co-op</span>
							</button>
						{/if}
					</div>
				</div>

				<!-- Sort By Section -->
				<div class="mobile-filter-section">
					<h3 class="mobile-filter-section-title">
						<ArrowUpDown size={16} class="section-icon" />
						Sort By
					</h3>
					<div class="mobile-sort-options">
						<RatingsSort />
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- Filter Options Popup (Secondary Modal) -->
{#if activeFilterPopup}
	<div
		class="filter-popup-overlay fixed inset-0 z-[60] flex items-center justify-center md:hidden"
		role="dialog"
		tabindex="-1"
		onkeydown={(e) => {
			if (e.key === 'Escape') activeFilterPopup = null;
		}}
	>
		<div
			class="absolute inset-0 bg-black/60 backdrop-blur-sm"
			onclick={() => (activeFilterPopup = null)}
			onkeydown={(e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					activeFilterPopup = null;
				}
			}}
			role="button"
			tabindex="0"
			aria-label="Close popup"
		></div>
		<div class="filter-popup-content">
			<div class="filter-popup-header">
				<h3 class="filter-popup-title">
					{#if activeFilterPopup === 'platforms'}
						<Monitor size={18} /> Platforms
					{:else if activeFilterPopup === 'genres'}
						<Tag size={18} /> Genres
					{:else if activeFilterPopup === 'tiers'}
						<Trophy size={18} /> Tiers
					{/if}
				</h3>
				<div class="filter-popup-header-actions">
					<button
						type="button"
						class="popup-icon-btn reset"
						onclick={resetCurrentCategoryPending}
						aria-label="Reset this filter"
						title="Reset"
					>
						<RotateCcw size={18} />
					</button>
					<button
						type="button"
						class="popup-icon-btn accept"
						onclick={() => (activeFilterPopup = null)}
						aria-label="Accept selection"
						title="Accept"
					>
						<Check size={20} />
					</button>
				</div>
			</div>
			<div class="filter-popup-options">
				{#if activeFilterPopup === 'platforms'}
					{#each filterOptions.platforms as platform (platform)}
						<button
							type="button"
							class="themed-filter-pill {getPlatformColor(platform)} {pendingPlatforms.includes(
								platform
							)
								? 'selected'
								: ''}"
							onclick={() => togglePendingPlatform(platform)}
						>
							{platform}
						</button>
					{/each}
				{:else if activeFilterPopup === 'genres'}
					{#each filterOptions.genres as genre (genre)}
						<button
							type="button"
							class="themed-filter-pill {getGenreColor(genre)} {pendingGenres.includes(genre)
								? 'selected'
								: ''}"
							onclick={() => togglePendingGenre(genre)}
						>
							{genre}
						</button>
					{/each}
				{:else if activeFilterPopup === 'tiers'}
					{#each filterOptions.tiers as tier (tier)}
						<button
							type="button"
							class="themed-filter-pill {getTierColor(tier)} {pendingTiers.includes(tier)
								? 'selected'
								: ''}"
							onclick={() => togglePendingTier(tier)}
						>
							{tier}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	/* Extracted Styles from +layout.svelte */
	.mobile-filters-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.mobile-filters-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.mobile-filters-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mobile-header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mobile-header-icon.apply-icon {
		background-color: #22c55e;
		color: white;
	}

	.mobile-header-icon.apply-icon:hover {
		background-color: #16a34a;
		transform: scale(1.05);
	}

	.mobile-header-icon.reset-icon {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-text-secondary);
	}

	:global(.light) .mobile-header-icon.reset-icon {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.mobile-header-icon.reset-icon:hover {
		background-color: rgba(255, 255, 255, 0.15);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-header-icon.reset-icon:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.mobile-header-icon.close-icon {
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.mobile-header-icon.close-icon:hover {
		background-color: rgba(239, 68, 68, 0.2);
		transform: scale(1.05);
	}

	.mobile-filters-content {
		padding: 16px;
		max-height: calc(85vh - 80px);
		overflow-y: auto;
	}

	.mobile-filter-section {
		margin-bottom: 16px;
	}

	.mobile-filter-section:last-child {
		margin-bottom: 0;
		padding-bottom: 80px; /* space for bottom nav */
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

	/* Compact Filter Category Buttons */
	.mobile-filter-categories-compact {
		display: flex;
		flex-wrap: nowrap;
		gap: 6px;
		justify-content: flex-start;
		padding-bottom: 4px;
		overflow-x: auto; /* Ensure scrolling if too wide */
	}

	.mobile-filter-categories-compact::-webkit-scrollbar {
		display: none;
	}

	.mobile-filter-category-compact {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.mobile-filter-category-compact:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.mobile-filter-category-compact.has-selection {
		background-color: rgba(59, 130, 246, 0.15);
		border-color: #3b82f6;
		color: #60a5fa;
	}

	.category-count-small {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background-color: #3b82f6;
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
	}

	.mobile-sort-options {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	/* Themed Filter Pills (uses color classes from FilterDropdown) */
	.themed-filter-pill {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 8px 16px;
		border-radius: 20px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 36px;
	}

	.themed-filter-pill:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.themed-filter-pill.selected {
		background-color: #3b82f6;
		border-color: #3b82f6;
		color: white;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	/* Popup Styles */
	.filter-popup-content {
		position: relative;
		width: 90%;
		max-width: 320px;
		max-height: 80vh;
		background-color: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 16px;
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: popupIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes popupIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.filter-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-background);
	}

	.filter-popup-title {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
	}

	.filter-popup-header-actions {
		display: flex;
		gap: 8px;
	}

	.popup-icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 8px;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.popup-icon-btn.reset {
		background-color: rgba(255, 255, 255, 0.05);
		color: var(--color-text-secondary);
	}

	.popup-icon-btn.reset:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--color-text-primary);
	}

	.popup-icon-btn.accept {
		background-color: #3b82f6;
		color: white;
	}

	.popup-icon-btn.accept:hover {
		background-color: #2563eb;
	}

	.filter-popup-options {
		padding: 16px;
		overflow-y: auto;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}
</style>

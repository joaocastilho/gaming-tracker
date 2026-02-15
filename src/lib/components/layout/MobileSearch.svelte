<script lang="ts">
	import { page } from '$app/state';
	import { replaceState, goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { appStore } from '$lib/stores/app.svelte';

	interface Props {
		isOpen: boolean;
		onClose: () => void;
	}

	let { isOpen, onClose }: Props = $props();

	let searchInput = $state<HTMLInputElement | null>(null);
	let mobileSearchDebounceTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	// Track if we just opened search to set initial value
	let searchJustOpened = false;

	$effect(() => {
		if (isOpen && searchInput) {
			const searchTerm = $filtersStore?.searchTerm ?? '';

			// Set initial value when search opens
			if (!searchJustOpened) {
				searchInput.value = searchTerm;
				searchJustOpened = true;
			}

			searchInput.focus();
		} else if (!isOpen) {
			searchJustOpened = false;
		}
	});

	// Scroll to top when search term changes in mobile search
	$effect(() => {
		if (browser && isOpen && window.innerWidth < 768) {
			const searchTerm = $filtersStore?.searchTerm ?? '';
			// Scroll to top when there's a search term or when results change
			if (searchTerm) {
				requestAnimationFrame(() => {
					window.scrollTo({ top: 0, behavior: 'smooth' });
				});
			}
		}
	});

	function handleMobileSearchInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		if (mobileSearchDebounceTimeout) {
			clearTimeout(mobileSearchDebounceTimeout);
		}

		mobileSearchDebounceTimeout = setTimeout(() => {
			// Check if we're searching from tierlist and user started typing
			const isFromTierlist = page.state.fromTierlist;
			if (isFromTierlist && newValue && appStore.activeTab === 'tierlist') {
				// Redirect to Games page with search term
				const searchParam = `?s=${encodeURIComponent(newValue)}`;
				goto(`/${searchParam}`, {
					keepFocus: true,
					noScroll: true,
					state: { showMobileSearch: true }
				});
				return;
			}

			// Update filter store FIRST to trigger filtering
			filtersStore.setSearchTerm(newValue);

			// Then update URL with search parameter using current location
			if (browser) {
				const url = new URL(window.location.href);
				if (newValue) {
					url.searchParams.set('s', newValue);
				} else {
					url.searchParams.delete('s');
				}
				// Use replaceState to update URL without navigation
				replaceState(url.toString(), { ...page.state });
			}
		}, 300);
	}

	function clearMobileSearch() {
		// Clear filter store first to trigger unfiltering
		filtersStore.setSearchTerm('');

		// Clear input value
		if (searchInput) {
			searchInput.value = '';
		}

		// Clear URL parameter
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			replaceState(url.toString(), page.state);
		}

		// Close search box
		onClose();
	}
</script>

{#if isOpen}
	<div class="mobile-search-container md:hidden" role="search">
		<div class="mobile-search-bar-container">
			<div class="mobile-search-bar">
				<span class="mobile-search-icon" aria-hidden="true">🔍</span>
				<input
					bind:this={searchInput}
					type="text"
					placeholder="Search games..."
					class="mobile-search-input"
					oninput={handleMobileSearchInput}
					onkeydown={(e) => {
						if (e.key === 'Escape') {
							onClose();
						}
					}}
					aria-label="Search games"
					autocomplete="off"
					spellcheck="false"
				/>
				{#if $filtersStore?.searchTerm}
					<button
						type="button"
						class="mobile-clear-button"
						onclick={clearMobileSearch}
						aria-label="Clear search"
					>
						✕
					</button>
				{/if}
				<button
					type="button"
					class="mobile-close-button"
					onclick={onClose}
					aria-label="Close search"
				>
					Close
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Mobile Search Bar - matches desktop SearchBar styling */
	.mobile-search-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		background-color: var(--color-background);
		padding: 12px 16px;
		padding-top: calc(12px + env(safe-area-inset-top, 0px));
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.mobile-search-bar-container {
		width: 100%;
		max-width: 1000px;
		margin: 0 auto;
	}

	.mobile-search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		border-radius: 12px;
		padding: 12px 16px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
		gap: 8px;
	}

	.mobile-search-bar:focus-within {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-focus-ring);
	}

	.mobile-search-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.mobile-search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text-primary);
		font-size: 1rem;
		line-height: 1.5;
		min-width: 0;
	}

	.mobile-search-input::placeholder {
		color: var(--color-text-muted);
	}

	.mobile-clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		border: none;
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 6px;
		transition: all var(--transition-fast);
		flex-shrink: 0;
		font-size: 0.9rem;
	}

	.mobile-clear-button:hover {
		background: var(--color-hover);
		color: var(--color-text-primary);
	}

	.mobile-close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border: none;
		background: var(--color-hover);
		color: var(--color-accent);
		cursor: pointer;
		border-radius: 6px;
		transition:
			background-color 0.2s ease,
			color 0.2s ease;
		flex-shrink: 0;
		font-size: 0.85rem;
		font-weight: 500;
	}

	:global(.light) .mobile-close-button {
		background: rgba(59, 130, 246, 0.15);
		color: #3b82f6;
	}

	.mobile-close-button:hover {
		background-color: rgba(59, 130, 246, 0.2);
	}

	:global(.light) .mobile-close-button:hover {
		background-color: rgba(59, 130, 246, 0.25);
	}
</style>

<script lang="ts">
import { page } from '$app/state';
import { replaceState, goto } from '$app/navigation';
import { browser } from '$app/environment';
import { filtersStore } from '$lib/stores/filters.svelte';
import { markSearchCleared } from '$lib/stores/searchClearCoordinator';

interface Props {
	isOpen: boolean;
	onClose: () => void;
}

let { isOpen, onClose }: Props = $props();

let searchInput = $state<HTMLInputElement | null>(null);
let localSearchTerm = $state(filtersStore.searchQuery);
let previousSearchTerm = $state(filtersStore.searchQuery);

$effect(() => {
	if (isOpen && searchInput) {
		if (document.activeElement !== searchInput) {
			searchInput.focus();
		}
	}
});

// sync from store when it changes externally
$effect(() => {
	const storeTerm = filtersStore.searchQuery;
	const isInternal = filtersStore.isInternalUpdate;

	if (storeTerm !== localSearchTerm && !isInternal && document.activeElement !== searchInput) {
		localSearchTerm = storeTerm;
	}
});

$effect(() => {
	if (browser && isOpen && window.innerWidth < 768) {
		const searchTerm = filtersStore.searchQuery;
		// Scroll to top only when there's a search term and it changed
		if (searchTerm && searchTerm !== previousSearchTerm) {
			previousSearchTerm = searchTerm;
			requestAnimationFrame(() => {
				window.scrollTo({ top: 0, behavior: 'smooth' });
			});
		} else if (!searchTerm) {
			previousSearchTerm = '';
		}
	}
});

function handleMobileSearchInput() {
	filtersStore.searchQuery = localSearchTerm;
}

function clearMobileSearch() {
	markSearchCleared();

	filtersStore.searchQuery = '';
	localSearchTerm = '';

	if (searchInput) {
		searchInput.focus();
	}

	if (browser) {
		const url = new URL(window.location.href);
		url.searchParams.delete('s');
		replaceState(url.toString(), page.state);
	}
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
					bind:value={localSearchTerm}
					oninput={handleMobileSearchInput}
					onkeydown={(e) => {
						if (e.key === 'Enter' && localSearchTerm.trim()) {
							const path = page.url.pathname;
							if (path === '/' || path === '/stats') {
								goto(`/library?s=${encodeURIComponent(localSearchTerm.trim())}`);
								return;
							}
						}
						if (e.key === 'Escape') {
							onClose();
						}
					}}
					aria-label="Search games"
					autocomplete="off"
					spellcheck="false"
				/>
				{#if localSearchTerm}
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
		background: rgba(99, 102, 241, 0.04);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-clear-button:hover {
		background: rgba(234, 88, 12, 0.04);
	}

	.mobile-close-button {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6px 12px;
		border: none;
		background: rgba(99, 102, 241, 0.06);
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
		background: rgba(59, 130, 246, 0.08);
		color: #3b82f6;
	}

	.mobile-close-button:hover {
		background-color: rgba(99, 102, 241, 0.1);
	}

	:global(.light) .mobile-close-button:hover {
		background-color: rgba(59, 130, 246, 0.12);
	}
</style>

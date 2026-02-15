<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { browser } from '$app/environment';
	import { X } from 'lucide-svelte';
	import { markSearchCleared } from '$lib/stores/searchClearCoordinator';

	let inputElement = $state<HTMLInputElement | undefined>(undefined);
	let debounceTimeout = $state<ReturnType<typeof setTimeout> | undefined>(undefined);

	let searchTerm = $derived($filtersStore?.searchTerm ?? '');

	// Initialize input value once on mount
	let initialized = $state(false);
	$effect(() => {
		if (inputElement && !initialized) {
			inputElement.value = searchTerm;
			initialized = true;
			inputElement.focus();
		}
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;

		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		debounceTimeout = setTimeout(() => {
			filtersStore.setSearchTerm(newValue);
			filtersStore.writeSearchToURL(page.state);
		}, 300);
	}

	function clearSearch() {
		// Cancel any pending debounced writes
		if (debounceTimeout) {
			clearTimeout(debounceTimeout);
		}

		// Clear URL parameter FIRST (synchronously) before touching the store
		// This prevents the URL sync effect from restoring the value
		if (browser) {
			const url = new URL(window.location.href);
			url.searchParams.delete('s');
			replaceState(url.toString(), page.state);
		}

		// Mark the clear timestamp to prevent URL sync effect from running
		markSearchCleared();

		// Then clear store to trigger filtering
		filtersStore.setSearchTerm('');

		// Finally clear input value
		if (inputElement) {
			inputElement.value = '';
			requestAnimationFrame(() => {
				inputElement?.focus();
			});
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (inputElement) {
				inputElement.select();
			}
		}
	}

	function handleGlobalKeydown(event: KeyboardEvent) {
		// Ctrl+K / Cmd+K to focus search
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			event.stopPropagation();

			// Expand the filters section if collapsed
			if (!filtersStore.isDesktopFiltersExpanded) {
				filtersStore.setDesktopFiltersExpanded(true);
			}

			// Focus the search input after a tick to allow DOM to update
			requestAnimationFrame(() => {
				inputElement?.focus();
				inputElement?.select();
			});
			return;
		}

		if (event.key === 'Escape' && inputElement) {
			event.preventDefault();
			event.stopPropagation();

			inputElement.focus();
			inputElement.select();

			requestAnimationFrame(() => {
				const headerHeight = 110;
				window.scrollTo({
					top: -headerHeight,
					behavior: 'smooth'
				});
			});
		}
	}

	$effect(() => {
		document.addEventListener('keydown', handleGlobalKeydown, { capture: true });
		return () => {
			document.removeEventListener('keydown', handleGlobalKeydown, { capture: true });
		};
	});
</script>

<div class="search-bar-container">
	<div class="search-bar">
		<span class="search-icon" aria-hidden="true">🔍</span>
		<input
			id="search-input"
			bind:this={inputElement}
			type="text"
			placeholder="Search games...  (Ctrl+K)"
			oninput={handleInput}
			onkeydown={handleKeydown}
			class="search-input"
			aria-label="Search games"
			autocomplete="off"
			spellcheck="false"
		/>
		{#if searchTerm}
			<button type="button" class="clear-button" onclick={clearSearch} aria-label="Clear search">
				<X size={18} />
			</button>
		{/if}
	</div>
</div>

<style>
	.search-bar-container {
		width: 100%;
		max-width: 1000px;
		padding: 0 16px;
		margin: 0 auto 20px auto;
	}

	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		border-radius: 12px;
		padding: 14px 18px;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
		box-shadow: var(--shadow-sm);
	}

	.search-bar:hover {
		border-color: var(--color-border-subtle);
	}

	.search-bar:focus-within {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 3px var(--color-focus-ring);
	}

	.search-icon {
		font-size: 1.1rem;
		margin-right: 12px;
		flex-shrink: 0;
		opacity: 0.7;
	}

	.search-input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--color-text-primary);
		font-size: 1rem;
		line-height: 1.5;
		min-width: 0;
		font-weight: 400;
	}

	.search-input::placeholder {
		color: var(--color-text-muted);
	}

	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		cursor: pointer;
		border-radius: 6px;
		transition: all var(--transition-fast);
		margin-left: 12px;
		flex-shrink: 0;
	}

	.clear-button:hover {
		background: var(--color-hover);
		color: var(--color-text-primary);
	}

	.clear-button:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}

	@media (max-width: 768px) {
		.search-bar-container {
			padding: 0 12px;
			margin-bottom: 16px;
		}

		.search-bar {
			padding: 12px 14px;
		}

		.search-input {
			font-size: 0.95rem;
		}

		.search-icon {
			font-size: 1rem;
		}
	}

	@media (max-width: 480px) {
		.search-bar-container {
			padding: 0 8px;
		}

		.search-bar {
			padding: 10px 12px;
		}

		.search-input {
			font-size: 0.9rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.search-bar,
		.clear-button {
			transition: none;
		}
	}
</style>

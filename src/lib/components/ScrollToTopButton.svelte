<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { RotateCcw } from 'lucide-svelte';

	interface Props {
		hideWhenFiltersOpen?: boolean;
	}

	let { hideWhenFiltersOpen = false }: Props = $props();

	let isVisible = $state(false);

	$effect(() => {
		const handleScroll = () => {
			isVisible = window.scrollY > 300;
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});

	function scrollToTop() {
		const headerHeight = 110;
		window.scrollTo({
			top: -headerHeight,
			behavior: 'smooth'
		});
	}

	function resetFilters() {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
		scrollToTop();
	}

	let hasActiveFilters = $derived(
		(isVisible || window.innerWidth < 768) && // Show when scrolled OR always on mobile if we want (but requirement says "above scroll to top", implying scroll logic)
			// Actually, let's stick to "visible when scroll to top is visible" to start, or maybe distinct.
			// Re-reading: "hover button above the scroll to top".
			// Let's use the same isVisible logic for consistency.
			isVisible &&
			!$modalStore.isOpen &&
			!hideWhenFiltersOpen &&
			(filtersStore.isAnyFilterApplied() || filtersStore.isSortModified())
	);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			scrollToTop();
		}
	}
</script>

{#if isVisible && !$modalStore.isOpen && !hideWhenFiltersOpen}
	<button
		type="button"
		class="scroll-to-top-button"
		aria-label="Scroll to top"
		onclick={scrollToTop}
		onkeydown={handleKeydown}
		tabindex="0"
	>
		<span class="scroll-icon" aria-hidden="true">↑</span>
		<span class="sr-only">Scroll to top</span>
	</button>
{/if}

{#if hasActiveFilters}
	<button
		type="button"
		class="reset-filters-fab"
		aria-label="Reset all filters"
		onclick={resetFilters}
		tabindex="0"
	>
		<RotateCcw size={24} />
		<span class="sr-only">Reset all filters</span>
	</button>
{/if}

<style>
	/* Reset FAB Styles */
	.reset-filters-fab {
		position: fixed;
		bottom: 130px; /* 65px + 52px + 13px gap */
		right: 24px;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		z-index: 50;
		outline: none;
		opacity: 0.9;
		border: none;
	}

	.reset-filters-fab:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		color: white;
	}

	:global(.light) .reset-filters-fab {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	:global(.light) .reset-filters-fab:hover {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
	}

	/* Existing Scroll Button Styles */
	.scroll-to-top-button {
		position: fixed;
		bottom: 65px;
		right: 24px;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: none;
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: white;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.3rem;
		font-weight: bold;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transition: all 0.3s ease;
		z-index: 50;
		outline: none;
		opacity: 0.7;
	}

	.scroll-to-top-button:hover {
		background: linear-gradient(135deg, #4b5563 0%, #374151 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
		transform: translateY(-2px);
		opacity: 0.9;
	}

	.scroll-to-top-button:focus {
		outline: none;
	}

	.scroll-to-top-button:active {
		opacity: 1;
	}

	.scroll-icon {
		line-height: 1;
	}

	:global(.light) .scroll-to-top-button {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
		color: white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		opacity: 0.7;
	}

	:global(.light) .scroll-to-top-button:hover {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
		opacity: 0.9;
	}

	:global(.light) .scroll-to-top-button:focus {
		outline: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.scroll-to-top-button {
			transition: none;
		}
	}

	@media (max-width: 768px) {
		.scroll-to-top-button {
			bottom: 120px;
			right: 16px;
			width: 48px;
			height: 48px;
			font-size: 1.2rem;
		}

		.reset-filters-fab {
			bottom: 180px; /* 120px + 48px + 12px */
			right: 16px; /* Match scroll btn right */
			width: 48px;
			height: 48px;
		}
	}

	@media (max-width: 480px) {
		.scroll-to-top-button {
			bottom: 125px;
			right: 16px;
			width: 44px;
			height: 44px;
			font-size: 1.1rem;
		}

		.reset-filters-fab {
			bottom: 180px; /* 125px + 44px + 11px */
			right: 16px;
			width: 44px;
			height: 44px;
		}
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>

<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import { Star } from 'lucide-svelte';
	import RatingSlider from './RatingSlider.svelte';

	// Rating type
	type RatingType = 'presentation' | 'story' | 'gameplay' | 'total';

	interface RatingConfig {
		label: string;
		maxValue: number;
	}

	const ratingConfigs: Record<RatingType, RatingConfig> = {
		presentation: {
			label: 'Presentation',
			maxValue: 10
		},
		story: {
			label: 'Story',
			maxValue: 10
		},
		gameplay: {
			label: 'Gameplay',
			maxValue: 10
		},
		total: {
			label: 'Score',
			maxValue: 20
		}
	};

	// Dropdown state
	let isOpen = $state(false);
	let dropdownElement: HTMLDivElement | undefined;

	// Current rating ranges from store (reactive)
	let ratingRanges = $state({
		presentation: [0, 10] as [number, number],
		story: [0, 10] as [number, number],
		gameplay: [0, 10] as [number, number],
		total: [0, 20] as [number, number]
	});

	// Subscribe to store changes
	$effect(() => {
		const unsubscribe = filtersStore.ratingRanges.subscribe((ranges) => {
			ratingRanges = ranges;
		});
		return unsubscribe;
	});

	// Handle clicks outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		// Don't close if clicking on the dropdown content
		const target = event.target as Node;
		const dropdown = document.querySelector('.ratings-filter-dropdown');
		if (dropdown && dropdown.contains(target)) {
			return;
		}

		if (dropdownElement && !dropdownElement.contains(target)) {
			isOpen = false;
		}
	}

	// Add event listener for clicks outside
	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => {
				document.removeEventListener('click', handleClickOutside);
			};
		}
	});



	// Reset all ratings
	function resetAllRatings() {
		filtersStore.setRatingRange('presentation', 0, 10);
		filtersStore.setRatingRange('story', 0, 10);
		filtersStore.setRatingRange('gameplay', 0, 10);
		filtersStore.setRatingRange('total', 0, 20);
		isOpen = false;
	}

	// Check if any ratings are filtered
	function hasActiveFilters(): boolean {
		return (
			ratingRanges.presentation[0] > 0 || ratingRanges.presentation[1] < 10 ||
			ratingRanges.story[0] > 0 || ratingRanges.story[1] < 10 ||
			ratingRanges.gameplay[0] > 0 || ratingRanges.gameplay[1] < 10 ||
			ratingRanges.total[0] > 0 || ratingRanges.total[1] < 20
		);
	}

	// Get button color classes
	function getButtonColorClasses(): string {
		if (hasActiveFilters()) {
			return 'bg-accent text-accent-foreground';
		} else {
			return 'bg-surface hover:bg-accent hover:text-accent-foreground';
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
			event.preventDefault();
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			isOpen = !isOpen;
		}
	}

	// Get ARIA attributes
	function getAriaAttributes() {
		return {
			'aria-expanded': isOpen,
			'aria-haspopup': 'listbox' as const,
			'aria-label': 'Filter by ratings'
		};
	}
</script>

<div class="ratings-filter" bind:this={dropdownElement}>
	<button
		type="button"
		class="filter-button {getButtonColorClasses()} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
		class:selected={hasActiveFilters()}
		onclick={() => (isOpen = !isOpen)}
		onkeydown={handleKeydown}
		{...getAriaAttributes()}
	>
		<Star size={16} class="text-gray-600 dark:text-gray-400" />
		<span class="filter-label">Filter by Ratings</span>
		{#if hasActiveFilters()}
			<span class="selected-count bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
				{[
					ratingRanges.presentation,
					ratingRanges.story,
					ratingRanges.gameplay,
					ratingRanges.total
				].filter(([min, max], i) => {
					const defaults = [[0, 10], [0, 10], [0, 10], [0, 20]];
					return min > defaults[i][0] || max < defaults[i][1];
				}).length}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="ratings-filter-dropdown">
			<div class="filter-options-section">
				<div class="filter-options-grid">
					{#each Object.entries(ratingConfigs) as [type, config] (type)}
						{@const ratingType = type as RatingType}
						{@const currentRange = ratingRanges[ratingType]}
						<div class="rating-slider-item">
							<RatingSlider
								label={config.label}
								minValue={currentRange[0]}
								maxValue={currentRange[1]}
								step={1}
								minLimit={0}
								maxLimit={config.maxValue}
								onRangeChange={(min: number, max: number) => filtersStore.setRatingRange(ratingType, min, max)}
							/>
						</div>
					{/each}
				</div>

				{#if hasActiveFilters()}
					<div class="filter-actions mt-4 flex justify-center">
						<button
							type="button"
							class="text-xs text-blue-400 transition-colors hover:text-blue-300"
							onclick={resetAllRatings}
						>
							Clear all
						</button>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.ratings-filter {
		position: relative;
		display: inline-block;
	}

	.filter-button {
		display: flex;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
		color: var(--color-text-primary);
	}

	.dropdown-arrow {
		font-size: 0.7rem;
		transition: transform 0.2s ease;
	}

	.dropdown-panel {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 320px;
		max-width: 400px;
		z-index: 50;
		animation: fadeIn 0.15s ease-out;
		background-color: var(--color-background);
		border-color: var(--color-border);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.dropdown-header {
		background-color: var(--color-surface);
		border-color: var(--color-border);
		color: var(--color-text-primary);
	}

	.ratings-container {
		max-height: 400px;
		overflow-y: auto;
	}

	.sliders-grid {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.help-text {
		border-top-color: rgba(0, 0, 0, 0.1);
	}

	:global(.light) .help-text {
		border-top-color: rgba(0, 0, 0, 0.05);
	}

	/* Focus states */
	.filter-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	/* Mobile responsive */
	@media (max-width: 640px) {
		.dropdown-panel {
			position: fixed;
			top: auto;
			bottom: 0;
			left: 0;
			right: 0;
			min-width: unset;
			max-width: unset;
			border-radius: 12px 12px 0 0;
			animation: slideUp 0.3s ease-out;
		}

		@keyframes slideUp {
			from {
				transform: translateY(100%);
			}
			to {
				transform: translateY(0);
			}
		}

		.ratings-container {
			max-height: 50vh;
		}

		.sliders-grid {
			gap: 12px;
		}
	}

	/* New ratings filter styles */
	.filter-button {
		display: flex;
		align-items: center;
		color: var(--color-text-primary);
		min-height: 44px;
	}

	.filter-button.selected {
		font-weight: 500;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.selected-count {
		font-size: 0.75rem;
		font-weight: 600;
		min-width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Dropdown positioning for ratings filter */
	.ratings-filter-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		min-width: 350px;
		max-width: 90vw;
	}

	/* New filter options section styles */
	.filter-options-section {
		background-color: var(--color-background);
		border: 1px solid var(--color-border);
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
	}

	.filter-options-grid {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.rating-slider-item {
		display: flex;
		flex-direction: column;
	}

	.filter-actions {
		margin-top: 0.5rem;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.dropdown-panel {
			animation: none;
		}

		.dropdown-arrow {
			transition: none;
		}

		.option-item {
			transition: none;
		}

		.filter-button {
			transition: none;
		}

		.rating-value-btn {
			transition: none;
		}

		@media (max-width: 640px) {
			.dropdown-panel {
				animation: none;
			}
		}
	}
</style>

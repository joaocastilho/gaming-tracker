<script lang="ts">
	import RatingSlider from './RatingSlider.svelte';
	import { filtersStore } from '$lib/stores/filters.js';

	// Rating range type
	type RatingType = 'presentation' | 'story' | 'gameplay' | 'total';

	interface RatingConfig {
		label: string;
		minLimit: number;
		maxLimit: number;
		step: number;
		ariaLabel: string;
	}

	const ratingConfigs: Record<RatingType, RatingConfig> = {
		presentation: {
			label: 'Presentation',
			minLimit: 0,
			maxLimit: 10,
			step: 1,
			ariaLabel: 'Presentation rating'
		},
		story: {
			label: 'Story',
			minLimit: 0,
			maxLimit: 10,
			step: 1,
			ariaLabel: 'Story rating'
		},
		gameplay: {
			label: 'Gameplay',
			minLimit: 0,
			maxLimit: 10,
			step: 1,
			ariaLabel: 'Gameplay rating'
		},
		total: {
			label: 'Total Score',
			minLimit: 0,
			maxLimit: 20,
			step: 1,
			ariaLabel: 'Total score'
		}
	};

	// Dropdown state
	let isOpen = $state(false);
	let dropdownElement: HTMLDivElement | undefined;

	// Current rating ranges from store (reactive)
	let ratingRanges = $state({
		presentation: [0, 10],
		story: [0, 10],
		gameplay: [0, 10],
		total: [0, 20]
	});

	// Subscribe to store changes with error handling and proper cleanup
	$effect(() => {
		const unsubscribe = filtersStore.ratingRanges.subscribe((ranges) => {
			// Only update if ranges are actually different to prevent unnecessary re-renders
			if (JSON.stringify(ranges) !== JSON.stringify(ratingRanges)) {
				ratingRanges = ranges;
			}
		});

		return unsubscribe;
	});

	// Handle clicks outside to close dropdown
	function handleClickOutside(event: MouseEvent) {
		if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
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

	// Handle range change from individual sliders
	function handleRangeChange(type: RatingType, min: number, max: number) {
		filtersStore.setRatingRange(type, min, max);
	}

	// Reset all rating ranges
	function resetAllRatings() {
		filtersStore.setRatingRange('presentation', 0, 10);
		filtersStore.setRatingRange('story', 0, 10);
		filtersStore.setRatingRange('gameplay', 0, 10);
		filtersStore.setRatingRange('total', 0, 20);
	}

	// Check if any rating range is not at default
	function hasNonDefaultRanges(): boolean {
		return (
			ratingRanges.presentation[0] > 0 ||
			ratingRanges.presentation[1] < 10 ||
			ratingRanges.story[0] > 0 ||
			ratingRanges.story[1] < 10 ||
			ratingRanges.gameplay[0] > 0 ||
			ratingRanges.gameplay[1] < 10 ||
			ratingRanges.total[0] > 0 ||
			ratingRanges.total[1] < 20
		);
	}

	// Get display text for dropdown button
	function getDisplayText(): string {
		const activeCount = [
			ratingRanges.presentation,
			ratingRanges.story,
			ratingRanges.gameplay,
			ratingRanges.total
		].filter(([min, max]) => {
			const config = ratingConfigs['presentation']; // Default config for ranges
			return min > config.minLimit || max < config.maxLimit;
		}).length;

		if (activeCount === 0) {
			return '📊 All Ratings';
		} else if (activeCount === 1) {
			return '📊 Rating Filter';
		} else {
			return `📊 ${activeCount} Rating Filters`;
		}
	}

	// Get button color classes
	function getButtonColorClasses(): string {
		if (hasNonDefaultRanges()) {
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
	<!-- Dropdown trigger button -->
	<button
		type="button"
		class="filter-button {getButtonColorClasses()} flex min-h-[44px] items-center rounded-md px-3 py-2 text-xs font-medium transition-colors"
		onclick={() => (isOpen = !isOpen)}
		onkeydown={handleKeydown}
		{...getAriaAttributes()}
	>
		{getDisplayText()}
		<span class="dropdown-arrow" class:rotated={isOpen} aria-hidden="true">▼</span>
	</button>

	{#if isOpen}
		<!-- Dropdown panel with sliders -->
		<div class="dropdown-panel bg-background border-border rounded-md border shadow-lg">
			<!-- Header -->
			<div class="dropdown-header border-border border-b px-3 py-2">
				<div class="flex items-center justify-between">
					<span class="text-sm font-medium" style="color: var(--color-text-primary);">
						Filter by ratings
					</span>
					{#if hasNonDefaultRanges()}
						<button type="button" class="text-xs" style="color: #3b82f6;" onclick={resetAllRatings}>
							Reset all
						</button>
					{/if}
				</div>
			</div>

			<!-- Rating sliders -->
			<div class="ratings-container p-3">
				<div class="sliders-grid">
					{#each Object.entries(ratingConfigs) as [type, config] (type)}
						{@const ratingType = type as RatingType}
						{@const currentRange = ratingRanges[ratingType]}
						<RatingSlider
							label={config.label}
							minValue={currentRange[0]}
							maxValue={currentRange[1]}
							step={config.step}
							minLimit={config.minLimit}
							maxLimit={config.maxLimit}
							onRangeChange={(min, max) => handleRangeChange(ratingType, min, max)}
						/>
					{/each}
				</div>

				<!-- Help text -->
				<div class="help-text border-border mt-4 border-t pt-3">
					<p class="text-xs" style="color: var(--color-text-secondary);">
						💡 Filter games by presentation, story, gameplay, and total scores. Only completed games
						with ratings are included.
					</p>
				</div>
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

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.dropdown-panel {
			animation: none;
		}

		.dropdown-arrow {
			transition: none;
		}

		.filter-button {
			transition: none;
		}

		@media (max-width: 640px) {
			.dropdown-panel {
				animation: none;
			}
		}
	}
</style>

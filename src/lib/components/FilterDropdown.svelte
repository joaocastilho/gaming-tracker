<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import { getPlatformColor, getGenreColor, getTierColor } from '$lib/utils/filterOptions.js';

	interface Props {
		type: 'platforms' | 'genres' | 'tiers';
		label: string;
		options: string[];
		selectedOptions: string[];
	}

	let { type, label, options, selectedOptions = [] }: Props = $props();

	// Dropdown state
	let isOpen = $state(false);
	let dropdownElement: HTMLDivElement | undefined;

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

	// Handle option toggle
	function toggleOption(option: string) {
		if (type === 'platforms') {
			filtersStore.togglePlatform(option);
		} else if (type === 'genres') {
			filtersStore.toggleGenre(option);
		} else if (type === 'tiers') {
			filtersStore.toggleTier(option);
		}
	}

	// Handle "All" option
	function selectAll() {
		selectedOptions.forEach((option) => {
			if (type === 'platforms') {
				filtersStore.removePlatform(option);
			} else if (type === 'genres') {
				filtersStore.removeGenre(option);
			} else if (type === 'tiers') {
				filtersStore.removeTier(option);
			}
		});
		isOpen = false;
	}

	// Get display text for button
	function getDisplayText(): string {
		if (selectedOptions.length === 0) {
			return `All ${label}`;
		} else if (selectedOptions.length === 1) {
			return `${selectedOptions[0]}`;
		} else {
			return `${selectedOptions.length} ${label}`;
		}
	}

	// Get color class for option
	function getOptionColor(option: string): string {
		if (type === 'platforms') {
			return getPlatformColor(option);
		} else if (type === 'genres') {
			return getGenreColor(option);
		} else if (type === 'tiers') {
			return getTierColor(option);
		}
		return 'bg-gray-600 text-white';
	}

	// Get button color classes
	function getButtonColorClasses(): string {
		if (selectedOptions.length === 0) {
			return 'bg-surface border-border hover:bg-accent hover:text-accent-foreground';
		} else {
			return 'bg-accent text-accent-foreground border-accent';
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
			'aria-label': `Filter by ${label.toLowerCase()}`
		};
	}
</script>

<div class="filter-dropdown" bind:this={dropdownElement}>
	<button
		type="button"
		class="filter-button {getButtonColorClasses()} rounded-md border px-3 py-2 text-xs font-medium transition-colors min-h-[44px] flex items-center"
		class:selected={selectedOptions.length > 0}
		onclick={() => (isOpen = !isOpen)}
		onkeydown={handleKeydown}
		{...getAriaAttributes()}
	>
		{getDisplayText()}
		<span class="dropdown-arrow" class:rotated={isOpen} aria-hidden="true">▼</span>
	</button>

	{#if isOpen}
		<div class="dropdown-panel bg-background border-border rounded-md border shadow-lg">
			<!-- Header -->
			<div class="dropdown-header border-border border-b px-3 py-2">
				<div class="flex items-center justify-between">
					<span class="text-foreground text-sm font-medium">
						Filter by {label.toLowerCase()}
					</span>
					{#if selectedOptions.length > 0}
						<button
							type="button"
							class="text-xs text-blue-400 transition-colors hover:text-blue-300"
							onclick={selectAll}
						>
							Clear all
						</button>
					{/if}
				</div>
			</div>

			<!-- Options List -->
			<div class="dropdown-options max-h-60 overflow-y-auto py-1">
				{#each options as option (option)}
					<label
						class="option-item hover:bg-accent hover:text-accent-foreground flex items-center gap-3 px-3 py-2 transition-colors"
					>
						<input
							type="checkbox"
							class="option-checkbox border-border h-4 w-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
							checked={selectedOptions.includes(option)}
							onchange={() => toggleOption(option)}
						/>
						<span
							class="option-badge {getOptionColor(option)} rounded px-2 py-1 text-xs font-medium"
						>
							{option}
						</span>
						<span class="option-text text-foreground text-sm">
							{option}
						</span>
					</label>
				{/each}

				{#if options.length === 0}
					<div class="empty-state px-3 py-4 text-center">
						<span class="text-muted-foreground text-sm">
							No {label.toLowerCase()} available
						</span>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.filter-dropdown {
		position: relative;
		display: inline-block;
	}

	.filter-button {
		display: flex;
		align-items: center;
		gap: 4px;
		white-space: nowrap;
	}

	.filter-button.selected {
		font-weight: 500;
	}

	.dropdown-arrow {
		font-size: 0.7rem;
		transition: transform 0.2s ease;
	}

	.dropdown-arrow.rotated {
		transform: rotate(180deg);
	}

	.dropdown-panel {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 220px;
		z-index: 50;
		animation: fadeIn 0.15s ease-out;
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
		background-color: rgba(0, 0, 0, 0.05);
	}

	:global(.light) .dropdown-header {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.dropdown-options {
		min-height: 100px;
	}

	.option-item {
		cursor: pointer;
		user-select: none;
	}

	.option-item:hover {
		background-color: rgba(59, 130, 246, 0.1);
	}

	:global(.light) .option-item:hover {
		background-color: rgba(59, 130, 246, 0.05);
	}

	.option-checkbox {
		accent-color: #3b82f6;
	}

	.option-badge {
		flex-shrink: 0;
	}

	.option-text {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.empty-state {
		color: #8b92a8;
	}

	:global(.light) .empty-state {
		color: #6b7280;
	}

	/* Focus states */
	.filter-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.option-checkbox:focus {
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

		.dropdown-options {
			max-height: 50vh;
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

		.option-item {
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

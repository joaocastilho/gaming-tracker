<script lang="ts">
	import { filtersStore } from '$lib/stores/filters.js';
	import { getPlatformColor, getGenreColor, getTierColor } from '$lib/utils/filterOptions.js';
	import { getTierDisplayName } from '$lib/utils/colorConstants.js';
	import { Monitor, Tag, Trophy, ChevronDown } from 'lucide-svelte';

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
		// Don't close if clicking on the dropdown content
		const target = event.target as Node;
		const dropdown = document.querySelector('.filter-options-dropdown');
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
			return 'bg-surface hover:bg-accent hover:text-accent-foreground border-0';
		} else {
			return 'bg-accent text-accent-foreground border-0';
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
		} else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			// Prevent page scroll when using arrow keys on the filter button
			event.preventDefault();
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
		class="filter-button {getButtonColorClasses()} flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors"
		class:selected={selectedOptions.length > 0}
		onclick={() => (isOpen = !isOpen)}
		onkeydown={handleKeydown}
		{...getAriaAttributes()}
	>
		{#if type === 'platforms'}
			<Monitor size={16} class="text-gray-600 dark:text-gray-400" />
		{:else if type === 'genres'}
			<Tag size={16} class="text-gray-600 dark:text-gray-400" />
		{:else if type === 'tiers'}
			<Trophy size={16} class="text-gray-600 dark:text-gray-400" />
		{/if}
		<span class="filter-label">Filter by {label}</span>
		<ChevronDown
			size={16}
			class="dropdown-arrow text-gray-600 transition-transform duration-200 dark:text-gray-400"
		/>
		{#if selectedOptions.length > 0}
			<span class="selected-count bg-accent text-accent-foreground rounded-full px-2 py-1 text-xs">
				{selectedOptions.length}
			</span>
		{/if}
	</button>

	{#if isOpen}
		<div class="filter-options-dropdown">
			<div class="filter-options-section">
				<div class="filter-options-grid">
					{#each options as option (option)}
						<button
							type="button"
							class="filter-option-item {getOptionColor(option)} {selectedOptions.includes(option)
								? 'selected'
								: ''}"
							onclick={() => toggleOption(option)}
						>
							{type === 'tiers' ? getTierDisplayName(option) : option}
						</button>
					{/each}
				</div>

				{#if selectedOptions.length > 0}
					<div class="filter-actions mt-3 flex justify-center">
						<button
							type="button"
							class="cursor-pointer text-xs text-blue-400 transition-colors hover:text-blue-300"
							onclick={(event) => {
								event.stopPropagation();
								selectAll();
							}}
						>
							Clear all
						</button>
					</div>
				{/if}

				{#if options.length === 0}
					<div class="empty-state py-2 text-center">
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
		color: var(--color-text-primary);
		min-height: 44px;
		cursor: pointer;
	}

	.filter-button.selected {
		font-weight: 500;
	}

	.filter-label {
		font-size: 0.9rem;
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

	.dropdown-panel {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 220px;
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

	.dropdown-options {
		min-height: 100px;
		background-color: var(--color-background);
	}

	.option-item {
		cursor: pointer;
		user-select: none;
		color: var(--color-text-primary);
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
		color: var(--color-text-secondary);
	}

	/* Focus states */
	.filter-button:focus {
		outline: none;
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

	/* Dropdown positioning for filter options */
	.filter-options-dropdown {
		position: absolute;
		top: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%);
		z-index: 1000;
		min-width: 300px;
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
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.filter-option-item {
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		transition: all 0.15s ease;
		cursor: pointer;
		font-size: 0.875rem;
		font-weight: 500;
		border: none;
		min-height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-option-item:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.filter-option-item.selected {
		box-shadow: 0 0 0 2px var(--color-accent);
		font-weight: 600;
	}

	.filter-actions {
		margin-top: 0.5rem;
	}

	/* Dropdown arrow styles */
	.dropdown-arrow {
		transition: transform 0.2s ease;
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

		.filter-option-item {
			transition: none;
		}

		@media (max-width: 640px) {
			.dropdown-panel {
				animation: none;
			}
		}
	}
</style>

<script lang="ts">
	import { Monitor, Tag, Trophy } from 'lucide-svelte';
	import { getPlatformColor, getGenreColor, getTierColor } from '$lib/utils/filterOptions';

	interface FilterOption {
		value: string;
		colorClass?: string;
	}

	interface Props {
		type: 'platforms' | 'genres' | 'tiers';
		options: FilterOption[];
		selected: string[];
		onToggle: (value: string) => void;
		onReset: () => void;
		onClose: () => void;
	}

	let { type, options, selected, onToggle, onReset, onClose }: Props = $props();

	const colors = {
		platforms: getPlatformColor,
		genres: getGenreColor,
		tiers: getTierColor
	};

	const colorFn = $derived(colors[type]);

	function handleBackdropClick(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const isBackdrop = target.classList.contains('bg-black/60');
		if (isBackdrop) {
			onClose();
		}
	}
</script>

<div
	class="filter-popup-overlay fixed inset-0 z-[60] flex items-center justify-center md:hidden"
	role="dialog"
	tabindex="-1"
	onkeydown={(e) => {
		if (e.key === 'Escape') onClose();
	}}
	onclick={handleBackdropClick}
>
	<div
		class="absolute inset-0 bg-black/60 backdrop-blur-sm"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				onClose();
			}
		}}
		role="button"
		tabindex="0"
		aria-label="Close popup"
	></div>
	<div class="filter-popup-content">
		<div class="filter-popup-header">
			<h3 class="filter-popup-title">
				{#if type === 'platforms'}
					<Monitor size={18} /> Platforms
				{:else if type === 'genres'}
					<Tag size={18} /> Genres
				{:else}
					<Trophy size={18} /> Tiers
				{/if}
			</h3>
			<div class="filter-popup-header-actions">
				<button
					type="button"
					class="popup-icon-btn reset"
					onclick={onReset}
					aria-label="Reset this filter"
					title="Reset"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
					</svg>
				</button>
				<button
					type="button"
					class="popup-icon-btn accept"
					onclick={onClose}
					aria-label="Accept selection"
					title="Accept"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				</button>
			</div>
		</div>
		<div class="filter-popup-options">
			{#each options as option (option.value)}
				<button
					type="button"
					class="themed-filter-pill {colorFn(option.value)} {selected.includes(option.value)
						? 'selected'
						: ''}"
					onclick={() => onToggle(option.value)}
				>
					{option.value}
				</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.filter-popup-overlay {
		position: fixed;
		inset: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.filter-popup-overlay :global(.md\:hidden) {
		display: flex;
	}

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
</style>

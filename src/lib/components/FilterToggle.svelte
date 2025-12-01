<script lang="ts">
	// Filter toggle component
	import { filtersStore } from '$lib/stores/filters.js';
	import { Users } from 'lucide-svelte';

	interface Props {
		label: string;
		value: string;
		isSelected: boolean;
	}

	let { label, value, isSelected }: Props = $props();

	function toggle() {
		filtersStore.toggleCoOp(value);
		filtersStore.writeToURL();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggle();
		}
	}
</script>

<button
	type="button"
	class="filter-toggle {isSelected
		? 'selected'
		: 'text-muted-foreground hover:text-foreground'} flex items-center gap-2 px-1 py-2 text-sm transition-colors"
	onclick={toggle}
	onkeydown={handleKeydown}
	aria-pressed={isSelected}
	aria-label="Toggle {label} filter"
>
	<Users size={16} class={isSelected ? 'text-blue-500' : 'text-muted-foreground'} />
	<span class="filter-label" class:text-blue-500={isSelected}>{label}</span>
</button>

<style>
	.filter-toggle {
		display: flex;
		align-items: center;
		min-height: 44px;
		cursor: pointer;
		font-weight: 500;
		background: transparent;
		border: none;
		position: relative;
		color: var(--color-text-primary);
	}

	.filter-toggle.selected {
		font-weight: 600;
		color: #3b82f6;
	}

	.filter-toggle.selected::after {
		content: '';
		position: absolute;
		bottom: 8px;
		left: 0;
		right: 0;
		height: 2px;
		background-color: #3b82f6;
		border-radius: 2px;
	}

	.filter-label {
		font-size: 0.9rem;
		font-weight: 500;
		color: var(--color-text-primary);
	}

	.filter-toggle:focus {
		outline: none;
	}
</style>

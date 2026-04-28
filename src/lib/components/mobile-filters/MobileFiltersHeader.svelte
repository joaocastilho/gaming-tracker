<script lang="ts">
import { RotateCcw, ChevronDown } from 'lucide-svelte';

interface Props {
	title?: string;
	onReset: () => void;
	onClose: () => void;
}

let { title = 'Filters and Sorting', onReset, onClose }: Props = $props();
</script>

<div class="mobile-filters-header">
	<h2 class="mobile-filters-title">{title}</h2>
	<div class="mobile-filters-actions">
		<button
			type="button"
			class="mobile-header-icon reset-icon"
			onclick={onReset}
			aria-label="Reset all filters"
			title="Reset"
		>
			<RotateCcw size={18} />
		</button>
		<button
			type="button"
			class="mobile-header-icon collapse-icon"
			onclick={onClose}
			aria-label="Collapse filters pane"
			title="Collapse"
		>
			<ChevronDown size={20} />
		</button>
	</div>
</div>

<style>
	.mobile-filters-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-surface);
	}

	.mobile-filters-title {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.mobile-filters-actions {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.mobile-header-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.mobile-header-icon.reset-icon {
		background-color: rgba(255, 255, 255, 0.04);
		color: var(--color-text-secondary);
	}

	:global(.light) .mobile-header-icon.reset-icon {
		background-color: rgba(0, 0, 0, 0.03);
	}

	.mobile-header-icon.reset-icon:hover {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-header-icon.reset-icon:hover {
		background-color: rgba(0, 0, 0, 0.06);
	}

	.mobile-header-icon.collapse-icon {
		background-color: rgba(255, 255, 255, 0.06);
		color: var(--color-text-secondary);
	}

	:global(.light) .mobile-header-icon.collapse-icon {
		background-color: rgba(0, 0, 0, 0.04);
	}

	.mobile-header-icon.collapse-icon:hover {
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-header-icon.collapse-icon:hover {
		background-color: rgba(0, 0, 0, 0.08);
	}
</style>

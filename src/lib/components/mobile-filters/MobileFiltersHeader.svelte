<script lang="ts">
	import { RotateCcw, Check, X } from 'lucide-svelte';

	interface Props {
		title?: string;
		onApply: () => void;
		onReset: () => void;
		onClose: () => void;
	}

	let { title = 'Filters and Sorting', onApply, onReset, onClose }: Props = $props();
</script>

<div class="mobile-filters-header">
	<h2 class="mobile-filters-title">{title}</h2>
	<div class="mobile-filters-actions">
		<button
			type="button"
			class="mobile-header-icon apply-icon"
			onclick={onApply}
			aria-label="Apply filters"
			title="Apply"
		>
			<Check size={20} />
		</button>
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
			class="mobile-header-icon close-icon"
			onclick={onClose}
			aria-label="Close without applying"
			title="Close"
		>
			<X size={20} />
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

	.mobile-header-icon.apply-icon {
		background-color: #22c55e;
		color: white;
	}

	.mobile-header-icon.apply-icon:hover {
		background-color: #16a34a;
		transform: scale(1.05);
	}

	.mobile-header-icon.reset-icon {
		background-color: rgba(255, 255, 255, 0.08);
		color: var(--color-text-secondary);
	}

	:global(.light) .mobile-header-icon.reset-icon {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.mobile-header-icon.reset-icon:hover {
		background-color: rgba(255, 255, 255, 0.15);
		color: var(--color-text-primary);
	}

	:global(.light) .mobile-header-icon.reset-icon:hover {
		background-color: rgba(0, 0, 0, 0.1);
	}

	.mobile-header-icon.close-icon {
		background-color: rgba(239, 68, 68, 0.1);
		color: #ef4444;
	}

	.mobile-header-icon.close-icon:hover {
		background-color: rgba(239, 68, 68, 0.2);
		transform: scale(1.05);
	}
</style>

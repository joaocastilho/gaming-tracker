<script lang="ts">
	import { Monitor, Tag, Trophy, Users } from 'lucide-svelte';

	interface Props {
		type: 'platforms' | 'genres' | 'tiers' | 'coOp';
		count?: number;
		onClick: () => void;
	}

	let { type, count = 0, onClick }: Props = $props();
</script>

{#if type === 'coOp'}
	<button
		type="button"
		class="mobile-filter-category-compact coop-toggle"
		class:has-selection={count > 0}
		onclick={onClick}
	>
		<Users size={14} />
		<span>Co-op</span>
	</button>
{:else if type === 'platforms'}
	<button
		type="button"
		class="mobile-filter-category-compact"
		class:has-selection={count > 0}
		onclick={onClick}
	>
		<Monitor size={14} />
		<span>Platforms</span>
		{#if count > 0}
			<span class="category-count-small">{count}</span>
		{/if}
	</button>
{:else if type === 'genres'}
	<button
		type="button"
		class="mobile-filter-category-compact"
		class:has-selection={count > 0}
		onclick={onClick}
	>
		<Tag size={14} />
		<span>Genres</span>
		{#if count > 0}
			<span class="category-count-small">{count}</span>
		{/if}
	</button>
{:else}
	<button
		type="button"
		class="mobile-filter-category-compact"
		class:has-selection={count > 0}
		onclick={onClick}
	>
		<Trophy size={14} />
		<span>Tiers</span>
		{#if count > 0}
			<span class="category-count-small">{count}</span>
		{/if}
	</button>
{/if}

<style>
	.mobile-filter-category-compact {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--color-border);
		background-color: var(--color-surface);
		color: var(--color-text-primary);
		font-size: 0.75rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.mobile-filter-category-compact:hover {
		background-color: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.3);
	}

	.mobile-filter-category-compact.has-selection {
		background-color: rgba(59, 130, 246, 0.15);
		border-color: #3b82f6;
		color: #60a5fa;
	}

	.category-count-small {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 16px;
		height: 16px;
		padding: 0 4px;
		border-radius: 8px;
		background-color: #3b82f6;
		color: white;
		font-size: 0.65rem;
		font-weight: 600;
	}
</style>

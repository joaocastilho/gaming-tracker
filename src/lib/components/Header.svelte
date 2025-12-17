<script lang="ts">
	import { dev } from '$app/environment';
	import { navigateTo, navigateToAndReset } from '$lib/utils/navigationUtils';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	import { appStore } from '$lib/stores/app.svelte';
	import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { ChevronDown, SlidersHorizontal, Plus, Save, X } from 'lucide-svelte';

	interface Props {
		onAddGame?: () => void;
		onApplyChanges?: () => void;
	}

	let { onAddGame, onApplyChanges }: Props = $props();

	type NavId = 'all' | 'completed' | 'planned' | 'tierlist';

	type NavItem = {
		id: NavId;
		label: string;
		route: string;
		count: number | null;
		active: boolean;
	};

	// Derive editor state
	let isEditor = $derived(editorStore.editorMode);
	let hasPending = $derived(editorStore.hasPendingChanges);
	let pendingCount = $derived(editorStore.pendingChangesCount);
	let isSaving = $derived(editorStore.savePending);

	// Use $derived to reactively compute navItems whenever activeTab or counts change
	let navItems = $derived.by(() => {
		const counts = filteredCountsStore.counts;
		const currentTab = appStore.activeTab;

		return [
			{
				id: 'all' as NavId,
				label: 'Games',
				route: '/',
				count: counts.all,
				active: currentTab === 'all'
			},
			{
				id: 'completed' as NavId,
				label: 'Completed',
				route: '/completed',
				count: counts.completed,
				active: currentTab === 'completed'
			},
			{
				id: 'planned' as NavId,
				label: 'Planned',
				route: '/planned',
				count: counts.planned,
				active: currentTab === 'planned'
			},
			{
				id: 'tierlist' as NavId,
				label: 'Tier List',
				route: '/tierlist',
				count: null,
				active: currentTab === 'tierlist'
			}
		] as NavItem[];
	});

	async function handleNavClick(target: NavId) {
		if (target === 'tierlist') {
			await navigateToAndReset(target);
		} else {
			await navigateTo(target);
		}
	}

	function handleAddGame() {
		onAddGame?.();
	}

	function handleApplyChanges() {
		onApplyChanges?.();
	}

	function handleDiscardChanges() {
		editorStore.discardAllChanges();
	}
</script>

<header class="header-root mb-2 px-6 py-3 md:mb-6 md:py-1">
	<div class="header-inner container mx-auto">
		<nav class="tabs-nav">
			<ul class="tabs-list">
				{#each navItems as item (item.id)}
					<li>
						<button
							type="button"
							class:active={item.active}
							onclick={() => handleNavClick(item.id)}
						>
							<span class="label">{item.label}</span>
						</button>
						{#if item.count !== null}
							<span class="count-badge">{item.count}</span>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<div class="header-right">
			{#if isEditor && appStore.activeTab !== 'tierlist'}
				<button
					type="button"
					class="editor-button add-game-button"
					onclick={handleAddGame}
					title="Add new game"
				>
					<Plus size={16} />
					<span class="button-label">Add Game</span>
				</button>
			{/if}

			{#if isEditor && hasPending && !dev}
				<button
					type="button"
					class="editor-button discard-button"
					onclick={handleDiscardChanges}
					title="Discard all pending changes"
					disabled={isSaving}
				>
					<X size={16} />
				</button>

				<button
					type="button"
					class="editor-button apply-button"
					onclick={handleApplyChanges}
					disabled={isSaving}
					title="Apply all pending changes"
				>
					<Save size={16} />
					<span class="button-label">{isSaving ? 'Saving...' : 'Apply'}</span>
					<span class="pending-badge">{pendingCount}</span>
				</button>
			{/if}

			<div class="filter-toggle-wrapper hidden md:block">
				{#if appStore.activeTab !== 'tierlist'}
					<button
						type="button"
						class="filter-toggle-button"
						onclick={() => filtersStore.toggleDesktopFiltersExpanded()}
						aria-expanded={filtersStore.isDesktopFiltersExpanded}
						aria-label={filtersStore.isDesktopFiltersExpanded ? 'Hide filters' : 'Show filters'}
						title={filtersStore.isDesktopFiltersExpanded ? 'Hide filters' : 'Show filters'}
					>
						<SlidersHorizontal size={16} class="filter-icon" />
						<ChevronDown
							size={16}
							class="filter-chevron-icon"
							style="transform: rotate({filtersStore.isDesktopFiltersExpanded ? '180deg' : '0deg'})"
						/>
					</button>
				{/if}
			</div>

			<div class="theme-toggle-wrapper">
				<ThemeToggle />
			</div>
		</div>
	</div>
</header>

<style>
	.header-root {
		padding: 0.75rem 16px;
	}

	.header-inner {
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-rows: auto;
		gap: 1rem;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		align-items: center;
	}

	.tabs-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		grid-column: 1;
	}

	.tabs-list {
		display: inline-flex;
		align-items: center;
		gap: 1.5rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.tabs-list li {
		list-style: none;
	}

	.tabs-list button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0 0 0.15rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1.3rem;
		font-weight: 600;
		color: #9ca3af;
		transition:
			color 0.16s ease,
			transform 0.12s ease;
	}

	.tabs-list button .label {
		letter-spacing: 0;
		font-size: 1.3rem;
	}

	.tabs-list .count-badge {
		min-width: 1.5rem;
		padding: 0.08rem 0.5rem;
		border-radius: 999px;
		font-size: 0.7rem;
		text-align: center;
		background: rgba(37, 99, 235, 0.22);
		color: #60a5fa;
	}

	.tabs-list button::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		border-radius: 999px;
		background: transparent;
		transform-origin: center;
		transform: scaleX(0);
		transition:
			background-color 0.18s ease,
			transform 0.18s ease;
	}

	.tabs-list button:hover {
		color: var(--color-text-primary);
		transform: translateY(-1px);
	}

	.tabs-list button:hover::after {
		background: rgba(148, 163, 253, 0.55);
		transform: scaleX(1);
	}

	.tabs-list button.active {
		color: var(--color-text-primary);
	}

	.tabs-list button.active::after {
		background: #3b82f6;
		transform: scaleX(1);
	}

	.header-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		grid-row: 1;
		grid-column: 2;
	}

	.theme-toggle-wrapper {
		display: inline-flex;
		align-items: center;
		transform: scale(1.2);
		transform-origin: center right;
	}

	.filter-toggle-wrapper {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
		min-width: 62px; /* Maintain consistent width when button is hidden */
	}

	.filter-toggle-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		background-color: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.filter-toggle-button:hover {
		background-color: var(--color-accent);
		color: white;
		border-color: var(--color-accent);
		transform: translateY(-1px);
	}

	/* Also update the icon colors on hover */
	.filter-toggle-button:hover :global(.filter-icon),
	.filter-toggle-button:hover :global(.filter-chevron-icon) {
		color: white;
	}

	.filter-toggle-button :global(.filter-chevron-icon) {
		transition: transform 0.3s ease;
	}

	@media (max-width: 834px) {
		.tabs-list button {
			min-height: 44px;
			padding: 0.5rem 0 0.15rem;
		}

		.tabs-nav {
			display: none;
		}

		.header-inner {
			grid-template-columns: 1fr auto;
			justify-content: space-between;
		}

		.header-root {
			padding: 0.75rem 1.8rem;
			padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
		}

		.header-right {
			grid-row: 1;
			grid-column: 2;
		}

		.theme-toggle-wrapper {
			display: none;
		}

		.filter-toggle-wrapper {
			display: none;
		}

		.editor-button .button-label {
			display: none;
		}

		.add-game-button,
		.apply-button,
		.discard-button {
			padding: 6px 8px;
		}
	}

	/* Editor button styles */
	.editor-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 6px 12px;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		background-color: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.editor-button:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.editor-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.add-game-button {
		border-color: rgba(34, 197, 94, 0.4);
		background: rgba(34, 197, 94, 0.12);
		color: #22c55e;
	}

	.add-game-button:hover {
		background: #22c55e;
		color: white;
		border-color: #22c55e;
	}

	.apply-button {
		border-color: rgba(59, 130, 246, 0.4);
		background: rgba(59, 130, 246, 0.12);
		color: #3b82f6;
	}

	.apply-button:hover:not(:disabled) {
		background: #3b82f6;
		color: white;
		border-color: #3b82f6;
	}

	.discard-button {
		border-color: rgba(239, 68, 68, 0.4);
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;
		padding: 6px 8px;
	}

	.discard-button:hover:not(:disabled) {
		background: #ef4444;
		color: white;
		border-color: #ef4444;
	}

	.pending-badge {
		min-width: 1.2rem;
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		background: rgba(255, 255, 255, 0.2);
		color: inherit;
	}

	.apply-button:hover .pending-badge {
		background: rgba(255, 255, 255, 0.25);
	}
</style>

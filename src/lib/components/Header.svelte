<script lang="ts">
	import { dev } from '$app/environment';
	import { navigateTo, navigateToAndReset } from '$lib/utils/navigationUtils';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	import { appStore } from '$lib/stores/app.svelte';
	import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { ChevronDown, SlidersHorizontal, Plus, Save, X, LogOut, LogIn } from 'lucide-svelte';
	import LoginModal from '$lib/components/LoginModal.svelte';
	import OfflineIndicator from '$lib/components/OfflineIndicator.svelte';

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

	let isEditor = $derived(editorStore.editorMode);
	let hasPending = $derived(editorStore.hasPendingChanges);
	let pendingCount = $derived(editorStore.pendingChangesCount);
	let isSaving = $derived(editorStore.savePending);
	let loginModalOpen = $state(false);

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

	async function handleLogout() {
		await editorStore.logout();
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
			<OfflineIndicator />

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

			{#if isEditor}
				<button
					type="button"
					class="editor-button logout-button"
					onclick={handleLogout}
					title="Logout"
				>
					<LogOut size={16} />
				</button>
			{:else}
				<button
					type="button"
					class="editor-button login-button"
					onclick={() => (loginModalOpen = true)}
					title="Login"
				>
					<LogIn size={16} />
				</button>
			{/if}

			{#if appStore.activeTab !== 'tierlist'}
				<div class="filter-toggle-wrapper hidden md:block">
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
				</div>
			{/if}

			<div class="theme-toggle-wrapper">
				<ThemeToggle />
			</div>
		</div>
	</div>
</header>

<LoginModal bind:open={loginModalOpen} />

<style>
	.header-root {
		padding: 0.75rem 16px;
		background: var(--color-background);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 40;
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.tabs-list button {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.25rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--color-text-tertiary);
		transition: all var(--transition-fast);
		border-radius: 8px;
	}

	.tabs-list button .label {
		letter-spacing: -0.01em;
	}

	.tabs-list .count-badge {
		min-width: 1.5rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		background: var(--color-surface-elevated);
		color: var(--color-accent);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
	}

	.tabs-list button::after {
		content: '';
		position: absolute;
		left: 0.25rem;
		right: 0.25rem;
		bottom: 0;
		height: 2px;
		border-radius: 999px;
		background: transparent;
		transform-origin: center;
		transform: scaleX(0);
		transition: all var(--transition-fast);
	}

	.tabs-list button:hover {
		color: var(--color-text-primary);
		background: var(--color-hover);
	}

	.tabs-list button:hover + .count-badge {
		border-color: var(--color-accent);
	}

	.tabs-list button:hover::after {
		background: var(--color-accent);
		transform: scaleX(1);
		opacity: 0.5;
	}

	.tabs-list button.active {
		color: var(--color-text-primary);
	}

	.tabs-list button.active::after {
		background: var(--color-accent);
		transform: scaleX(1);
		opacity: 1;
	}

	.tabs-list button.active + .count-badge {
		background: var(--color-accent);
		color: var(--color-accent-foreground);
		border-color: var(--color-accent);
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
		transform-origin: center right;
	}

	.filter-toggle-wrapper {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
		min-width: 62px;
	}

	.filter-toggle-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background-color: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-weight: 500;
	}

	.filter-toggle-button:hover {
		background-color: var(--color-hover);
		border-color: var(--color-accent);
		color: var(--color-accent);
		transform: translateY(-1px);
	}

	.filter-toggle-button:hover :global(.filter-icon),
	.filter-toggle-button:hover :global(.filter-chevron-icon) {
		color: var(--color-accent);
	}

	.filter-toggle-button :global(.filter-chevron-icon) {
		transition: transform var(--transition-fast);
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

		/* Hide editor buttons on mobile - they're in the settings FAB menu */
		.add-game-button,
		.login-button,
		.logout-button {
			display: none !important;
		}

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
		padding: 8px 14px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background-color: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-size: 0.85rem;
		font-weight: 500;
	}

	.editor-button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.editor-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.add-game-button {
		border-color: rgba(34, 197, 94, 0.3);
		background: rgba(34, 197, 94, 0.1);
		color: #22c55e;
	}

	.add-game-button:hover {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.5);
		color: #4ade80;
	}

	.apply-button {
		border-color: rgba(99, 102, 241, 0.3);
		background: rgba(99, 102, 241, 0.1);
		color: var(--color-accent);
	}

	.apply-button:hover:not(:disabled) {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.5);
		color: var(--color-accent-hover);
	}

	.discard-button {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		padding: 8px;
	}

	.discard-button:hover:not(:disabled) {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.5);
		color: #f87171;
	}

	.pending-badge {
		min-width: 1.2rem;
		padding: 0.15rem 0.4rem;
		border-radius: 999px;
		font-size: 0.7rem;
		font-weight: 600;
		text-align: center;
		background: var(--color-accent);
		color: var(--color-accent-foreground);
	}

	.logout-button,
	.login-button {
		width: 40px;
		height: 40px;
		padding: 0;
		border-radius: 10px;
		border-color: var(--color-border);
		background: var(--color-surface);
		color: var(--color-text-secondary);
	}

	.logout-button:hover:not(:disabled),
	.login-button:hover:not(:disabled) {
		background: var(--color-hover);
		border-color: var(--color-accent);
		color: var(--color-accent);
	}
</style>

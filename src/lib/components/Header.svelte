<script lang="ts">
import { browser } from '$app/environment';
import { dev } from '$app/environment';
import { goto } from '$app/navigation';
import { navigateTo } from '$lib/utils/navigationUtils';
import { page } from '$app/state';
import ThemeToggle from '$lib/components/ThemeToggle.svelte';

import { appStore } from '$lib/stores/app.svelte';
import { filteredCountsStore } from '$lib/stores/filteredCounts.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { editorStore } from '$lib/stores/editor.svelte';
import {
	ChevronDown,
	SlidersHorizontal,
	Plus,
	Save,
	X,
	LogOut,
	LogIn,
	Home,
	Gamepad,
	CheckCircle,
	Calendar,
	List,
	BarChart3,
} from 'lucide-svelte';
import OfflineIndicator from '$lib/components/OfflineIndicator.svelte';

const isMac = $derived(browser && navigator.platform.toLowerCase().includes('mac'));
const shortcutKey = $derived(isMac ? 'Cmd + /' : 'Ctrl + /');

interface Props {
	onAddGame?: () => void;
	onApplyChanges?: () => void;
	onOpenLogin?: () => void;
}

let { onAddGame, onApplyChanges, onOpenLogin }: Props = $props();

type NavId = 'library' | 'completed' | 'planned' | 'tierlist' | 'stats';

type NavItem = {
	id: NavId;
	label: string;
	route: string;
	count: number | null;
	active: boolean;
	icon: typeof Gamepad;
};

let isEditor = $derived(editorStore.editorMode);
let hasPending = $derived(editorStore.hasPendingChanges);
let pendingCount = $derived(editorStore.pendingChangesCount);
let isSaving = $derived(editorStore.savePending);

let navItems = $derived.by(() => {
	const counts = filteredCountsStore.counts;
	const currentTab = appStore.activeTab;

	return [
		{
			id: 'library' as NavId,
			label: 'Library',
			route: '/library',
			count: counts.all,
			active: currentTab === 'library' || currentTab === 'all',
			icon: Gamepad,
		},
		{
			id: 'completed' as NavId,
			label: 'Completed',
			route: '/completed',
			count: counts.completed,
			active: currentTab === 'completed',
			icon: CheckCircle,
		},
		{
			id: 'planned' as NavId,
			label: 'Planned',
			route: '/planned',
			count: counts.planned,
			active: currentTab === 'planned',
			icon: Calendar,
		},
		{
			id: 'tierlist' as NavId,
			label: 'Tier List',
			route: '/tierlist',
			count: null,
			active: currentTab === 'tierlist',
			icon: List,
		},
		{
			id: 'stats' as NavId,
			label: 'Stats',
			route: '/stats',
			count: null,
			active: currentTab === 'stats',
			icon: BarChart3,
		},
	] as NavItem[];
});

async function handleNavClick(target: NavId) {
	await navigateTo(target, { state: page.state, replaceState: true });
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

<header class="header-root mb-0 px-4 py-1 md:mb-6 md:px-6">
	<div class="header-inner container mx-auto">
		<div class="header-left">
			<button type="button" class="home-button" onclick={() => goto('/')} aria-label="Home">
				<Home size={20} />
			</button>
		</div>
		<nav class="tabs-nav">
			<ul class="tabs-list">
				{#each navItems as item (item.id)}
					{@const Icon = item.icon}
					<li>
						<button
							type="button"
							class:active={item.active}
							onclick={() => handleNavClick(item.id)}
						>
							<Icon size={20} />
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

			{#if isEditor}
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
				<button
					type="button"
					class="filter-toggle-button"
					onclick={() => {
						if (page.url.pathname === '/') {
							filtersStore.setDesktopFiltersExpanded(true);
							goto('/library');
						} else {
							filtersStore.toggleDesktopFiltersExpanded();
						}
					}}
					aria-expanded={filtersStore.isDesktopFiltersExpanded}
					aria-label={filtersStore.isDesktopFiltersExpanded ? 'Hide filters' : 'Show filters'}
					title={filtersStore.isDesktopFiltersExpanded
						? `Hide filters (${shortcutKey})`
						: `Show filters (${shortcutKey})`}
				>
					<SlidersHorizontal size={16} class="filter-icon" /><ChevronDown
						size={16}
						class="filter-chevron-icon"
						style="transform: rotate({filtersStore.isDesktopFiltersExpanded ? '180deg' : '0deg'})"
					/><span class="filter-shortcut hidden md:inline">{shortcutKey}</span>
				</button>
			</div>

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
					onclick={() => onOpenLogin?.()}
					title="Login"
				>
					<LogIn size={16} />
				</button>
			{/if}

			<div class="theme-toggle-wrapper">
				<ThemeToggle />
			</div>
		</div>
	</div>
</header>

<style>
	.header-root {
		padding: 0.75rem 16px;
		background: var(--color-background);
		position: sticky;
		top: 0;
		z-index: 40;
		/* Force own compositing layer to prevent scroll repaint on Firefox mobile */
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
	}

	.header-inner {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: auto;
		gap: 1rem;
		max-width: 1000px;
		width: 100%;
		margin: 0 auto;
		align-items: center;
		min-height: 20px;
	}

	.header-left {
		grid-row: 1;
		grid-column: 1;
		display: flex;
		align-items: center;
	}

	.home-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.home-button:hover {
			background: var(--color-hover);
			border-color: var(--color-accent);
			color: var(--color-accent);
			transform: translateY(-1px);
		}
	}

	.tabs-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		grid-row: 1;
		grid-column: 2;
	}

	.tabs-list {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		list-style: none;
		padding: 0.35rem;
		margin: 0;
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: 14px;
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
		padding: 0.6rem 1rem;
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
		border-radius: 9px;
		white-space: nowrap;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	.tabs-list button .label {
		letter-spacing: -0.01em;
	}

	.tabs-list button :global(svg) {
		flex-shrink: 0;
	}

	.tabs-list .count-badge {
		min-width: 1.4rem;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		text-align: center;
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		border: 1px solid var(--color-border);
		transition: all var(--transition-fast);
	}

	@media (hover: hover) {
		.tabs-list button:hover {
			color: var(--color-text-primary);
			background: var(--color-hover);
		}

		.tabs-list button:hover + .count-badge {
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
	}

	.tabs-list button.active {
		color: var(--color-text-primary);
		background: var(--color-hover);
	}

	.tabs-list button.active + .count-badge {
		background: color-mix(in srgb, var(--color-accent), black 15%);
		color: #ffffff;
		border-color: transparent;
	}

	.tabs-list button.active :global(svg) {
		color: var(--color-accent);
	}

	.header-right {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		grid-row: 1;
		grid-column: 3;
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
		height: 40px;
		padding: 0 16px;
		min-width: 130px;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		background-color: var(--color-surface);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast);
		font-weight: 500;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.filter-toggle-button:hover {
			background-color: rgba(99, 102, 241, 0.04);
			border-color: var(--color-accent);
			color: var(--color-accent);
			transform: translateY(-1px);
		}

		:global(.light) .filter-toggle-button:hover {
			background-color: rgba(234, 88, 12, 0.04);
		}

		.filter-toggle-button:hover :global(.filter-icon),
		.filter-toggle-button:hover :global(.filter-chevron-icon) {
			color: var(--color-accent);
		}
	}

	.filter-toggle-button :global(.filter-chevron-icon) {
		transition: transform var(--transition-fast);
	}

	.filter-shortcut {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 1px 3px;
		background: var(--color-surface-elevated);
		border-radius: 2px;
		margin-left: 4px;
		opacity: 0.6;
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
		transition:
			background-color var(--transition-fast),
			border-color var(--transition-fast),
			color var(--transition-fast),
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		font-size: 0.85rem;
		font-weight: 500;
		white-space: nowrap;
		touch-action: manipulation;
		-webkit-tap-highlight-color: transparent;
	}

	@media (hover: hover) {
		.editor-button:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: var(--shadow-sm);
		}
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

	@media (hover: hover) {
		.add-game-button:hover {
			background: rgba(34, 197, 94, 0.2);
			border-color: rgba(34, 197, 94, 0.5);
			color: #4ade80;
		}
	}

	.apply-button {
		border-color: rgba(99, 102, 241, 0.3);
		background: rgba(99, 102, 241, 0.1);
		color: var(--color-accent);
	}

	@media (hover: hover) {
		.apply-button:hover:not(:disabled) {
			background: rgba(99, 102, 241, 0.2);
			border-color: rgba(99, 102, 241, 0.5);
			color: var(--color-accent-hover);
		}
	}

	.discard-button {
		border-color: rgba(239, 68, 68, 0.3);
		background: rgba(239, 68, 68, 0.1);
		color: #ef4444;
		padding: 8px;
	}

	@media (hover: hover) {
		.discard-button:hover:not(:disabled) {
			background: rgba(239, 68, 68, 0.2);
			border-color: rgba(239, 68, 68, 0.5);
			color: #f87171;
		}
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

	@media (hover: hover) {
		.logout-button:hover:not(:disabled),
		.login-button:hover:not(:disabled) {
			background: var(--color-hover);
			border-color: var(--color-accent);
			color: var(--color-accent);
		}
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

		.header-left {
			display: none;
		}

		.header-root {
			padding: 0.25rem 1rem;
			padding-top: calc(0.25rem + env(safe-area-inset-top, 0px));
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
			display: none;
		}

		.apply-button,
		.discard-button {
			padding: 6px 8px;
		}
	}
</style>

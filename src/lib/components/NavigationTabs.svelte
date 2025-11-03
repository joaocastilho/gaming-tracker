<script lang="ts">
	import { goto } from '$app/navigation';
	import { appStore } from '../stores/app.js';
	import { gamesStore } from '../stores/games.js';
	import { filtersStore } from '../stores/filters.js';
	import type { FilteredGameData } from '../stores/filters.js';

	// Type definitions
	type TabId = 'all' | 'completed' | 'planned' | 'tierlist';

	interface Tab {
		id: TabId;
		label: string;
		route: string;
		count: number | null;
	}

	let activeTab = $state<TabId>('all');

	// Game counts - using filtered counts when search is active
	let gameCounts = $state({ total: 0, planned: 0, completed: 0 });

	// Create filtered games store
	const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

	$effect(() => {
		const unsubscribe = appStore.activeTab.subscribe((value) => {
			activeTab = value;
		});
		return unsubscribe;
	});

	$effect(() => {
		const unsubscribe = filteredGamesStore.subscribe((data: FilteredGameData) => {
			gameCounts = {
				total: data.totalCount,
				planned: data.plannedCount,
				completed: data.completedCount
			};
		});
		return unsubscribe;
	});

	const tabs = $derived<Tab[]>([
		{
			id: 'all',
			label: 'Games',
			route: '/',
			count: gameCounts.total
		},
		{
			id: 'completed',
			label: 'Completed',
			route: '/completed',
			count: gameCounts.completed
		},
		{
			id: 'planned',
			label: 'Planned',
			route: '/planned',
			count: gameCounts.planned
		},
		{
			id: 'tierlist',
			label: 'Tier List',
			route: '/tierlist',
			count: null
		}
	]);

	function handleTabClick(tab: Tab) {
		if (tab.id !== activeTab) {
			appStore.activeTab.set(tab.id);

			// Navigate to the route (if not already on it)
			if (typeof window !== 'undefined' && window.location && window.history) {
				goto(tab.route, { replaceState: true });
			}
		}
	}
</script>

<nav class="navigation-tabs" aria-label="Game navigation">
	<ul class="tabs-list" role="tablist">
		{#each tabs as tab (tab.id)}
			<li class="tab-item" role="presentation">
				<button
					type="button"
					class="tab-button"
					class:active={activeTab === tab.id}
					onclick={() => handleTabClick(tab)}
					role="tab"
					aria-selected={activeTab === tab.id}
					aria-controls="main-content"
					tabindex={activeTab === tab.id ? 0 : -1}
					title="Navigate to {tab.label} games"
				>
					<span class="tab-label">{tab.label}</span>
					{#if tab.count !== null}
						<span class="tab-count" aria-label="({tab.count} games)">
							({tab.count})
						</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.navigation-tabs {
		/* Layout */
		display: flex;
		justify-content: center;
		width: 100%;
		height: 50px;
		background-color: #0a0d11;
		padding: 0 24px;

		/* Positioning */
		position: sticky;
		top: 60px; /* Height of header */
		z-index: 30;

		/* Typography */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
	}

	/* Light mode overrides */
	:global(.light) .navigation-tabs {
		background-color: #ffffff;
	}

	.tabs-list {
		/* Layout */
		display: flex;
		gap: 0;
		list-style: none;
		margin: 0;
		padding: 0;
		max-width: 1200px;
		width: 100%;

		/* Center tabs on larger screens */
		justify-content: center;
	}

	.tab-item {
		margin: 0;
	}

	.tab-button {
		/* Layout */
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 14px 20px;
		border: none;
		background: none;
		cursor: pointer;

		/* Typography */
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1;
		color: #6b7280;
		text-decoration: none;

		/* Border for active state */
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;

		/* Minimum touch target size */
		min-height: 44px;
		min-width: 80px;
	}

	.tab-button:hover {
		color: #8b92a8;
		background-color: rgba(42, 47, 58, 0.3);
	}

	.tab-button:focus {
		outline: 2px solid #3b82f6;
		outline-offset: -2px;
		border-radius: 2px;
	}

	/* Active tab styling */
	.tab-button.active {
		color: #ffffff;
		border-bottom-color: #3b82f6;
	}

	/* Light mode active tab */
	:global(.light) .tab-button.active {
		color: #1a1a1a;
	}

	.tab-button.active:hover {
		color: #ffffff;
		background-color: rgba(59, 130, 246, 0.1);
	}

	/* Light mode active tab hover */
	:global(.light) .tab-button.active:hover {
		color: #1a1a1a;
		background-color: rgba(59, 130, 246, 0.1);
	}

	/* Tab content */
	.tab-label {
		white-space: nowrap;
		font-weight: 500;
	}

	.tab-count {
		/* Subtle count styling */
		color: #8b92a8;
		font-size: 0.85rem;
		font-weight: 400;
	}

	.tab-button.active .tab-count {
		color: inherit; /* Inherit active tab color */
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.navigation-tabs {
			padding: 0 16px;
			height: 48px; /* Slightly smaller on mobile */
			top: 56px; /* Adjust for smaller header */
		}

		.tabs-list {
			/* Allow horizontal scroll on mobile */
			overflow-x: auto;
			scrollbar-width: none;
			-ms-overflow-style: none;
			gap: 4px;
		}

		.tabs-list::-webkit-scrollbar {
			display: none;
		}

		.tab-button {
			/* Smaller padding for mobile */
			padding: 12px 16px;
			font-size: 0.9rem;
			min-width: 70px;
			flex-shrink: 0;
		}

		.tab-count {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.navigation-tabs {
			padding: 0 12px;
		}

		.tab-button {
			padding: 10px 12px;
			font-size: 0.85rem;
			min-width: 60px;
			gap: 6px;
		}

		.tab-count {
			font-size: 0.75rem;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.tab-button {
			border-bottom: 2px solid transparent;
		}

		.tab-button.active {
			border-bottom-color: currentColor;
		}

		.tab-button:focus {
			outline: 3px solid currentColor;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.tab-button {
			transition: none;
		}
	}
</style>

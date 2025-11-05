<script lang="ts">
	import Header from '$lib/components/Header.svelte';
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

	// Set active tab based on localStorage or URL hash
	$effect(() => {
		if (typeof window !== 'undefined') {
			// First check localStorage for saved preference
			const savedTab = localStorage.getItem('gaming-tracker-active-tab') as TabId | null;

			// Then check URL hash for direct navigation
			const hash = window.location.hash.replace('#', '');
			let newActiveTab: TabId = savedTab || 'all';

			// URL hash takes precedence for direct navigation
			if (hash === 'completed') {
				newActiveTab = 'completed';
			} else if (hash === 'planned') {
				newActiveTab = 'planned';
			} else if (hash === 'tierlist') {
				newActiveTab = 'tierlist';
			} else if (hash === '') {
				// If no hash, use localStorage preference
				newActiveTab = savedTab || 'all';
			}

			// Only update if different to avoid unnecessary store updates
			if (newActiveTab !== activeTab) {
				appStore.activeTab.set(newActiveTab);
			}
		}
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
			route: 'completed',
			count: gameCounts.completed
		},
		{
			id: 'planned',
			label: 'Planned',
			route: 'planned',
			count: gameCounts.planned
		},
		{
			id: 'tierlist',
			label: 'Tier List',
			route: 'tierlist',
			count: null
		}
	]);

	function handleTabClick(tab: Tab) {
		if (tab.id !== activeTab) {
			appStore.activeTab.set(tab.id);

			// Update URL hash for client-side navigation
			if (typeof window !== 'undefined' && window.location) {
				const newHash = tab.id === 'all' ? '' : `#${tab.id}`;
				window.history.replaceState(
					null,
					'',
					`${window.location.pathname}${window.location.search}${newHash}`
				);
			}
		}
	}
</script>

<Header />
<nav class="navigation-tabs" aria-label="Game navigation">
	<!-- Navigation tabs centered -->
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
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 55px;
		background-color: #0a0d11;
		padding: 0;

		/* Positioning */
		position: sticky;
		top: 60px; /* Height of header */
		z-index: 35; /* Below header (40) but above filter section (30) */
	}



	/* Light mode overrides */
	:global(.light) .navigation-tabs {
		background-color: #f2ebe1;
		border-bottom: 1px solid rgba(229, 231, 235, 0.8);
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
		padding: 12px 16px;
		border: none;
		background: none;
		cursor: pointer;

		/* Typography */
		font-size: 1.1rem;
		font-weight: 500;
		line-height: 1.2;
		color: #475569;
		text-decoration: none;

		/* Border for active state */
		border-bottom: 2px solid transparent;
		transition: all 0.2s ease;

		/* Minimum touch target size */
		min-height: 40px;
		min-width: 70px;
	}

	.tab-button:hover {
		color: #cbd5e1;
		background-color: rgba(255, 255, 255, 0.05);
	}

	.tab-button:focus {
		outline: none;
	}

	/* Active tab styling */
	.tab-button.active {
		color: #ffffff;
		border-bottom-color: #3b82f6;
		font-weight: 600;
	}

	/* Light mode active tab */
	:global(.light) .tab-button.active {
		color: #1e293b;
	}

	.tab-button.active:hover {
		background-color: rgba(59, 130, 246, 0.08);
	}

	/* Tab content */
	.tab-label {
		white-space: nowrap;
		font-weight: 500;
	}

	.tab-count {
		/* Modern count styling with background */
		background: rgba(126, 137, 151, 0.6);
		color: #cbd5e1;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 10px;
		min-width: 18px;
		text-align: center;
		letter-spacing: 0.025em;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.tab-button.active .tab-count {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
		font-weight: 700;
	}

	/* Light mode count styling */
	:global(.light) .tab-count {
		background: rgba(148, 163, 184, 0.4);
		color: #64748b;
	}

	:global(.light) .tab-button.active .tab-count {
		background: rgba(59, 130, 246, 0.2);
		color: #1e40af;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.navigation-tabs {
			padding: 0;
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
			padding: 0;
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

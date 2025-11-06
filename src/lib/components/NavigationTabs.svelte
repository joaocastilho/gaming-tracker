<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { appStore } from '../stores/app.js';
	import { gamesStore } from '../stores/games.js';
	import { filtersStore } from '../stores/filters.js';

	const { activeTab } = appStore;

	type TabId = 'all' | 'completed' | 'planned' | 'tierlist';

	interface Tab {
		id: TabId;
		label: string;
		route: string;
		count: number | null;
	}

	const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

	// Initialize active tab
	if (typeof window !== 'undefined') {
		const savedTab = localStorage.getItem('gaming-tracker-active-tab') as TabId | null;
		const hash = window.location.hash.replace('#', '');
		let newActiveTab: TabId = savedTab || 'all';

		if (hash === 'completed') newActiveTab = 'completed';
		else if (hash === 'planned') newActiveTab = 'planned';
		else if (hash === 'tierlist') newActiveTab = 'tierlist';

		if (newActiveTab !== $activeTab) {
			activeTab.set(newActiveTab);
		}
	}

	const tabs = $derived<Tab[]>([
		{ id: 'all', label: 'Games', route: '/', count: $filteredGamesStore.totalCount },
		{
			id: 'completed',
			label: 'Completed',
			route: 'completed',
			count: $filteredGamesStore.completedCount
		},
		{ id: 'planned', label: 'Planned', route: 'planned', count: $filteredGamesStore.plannedCount },
		{ id: 'tierlist', label: 'Tier List', route: 'tierlist', count: null }
	]);

	function handleTabClick(tab: Tab) {
		if (tab.id !== $activeTab) {
			activeTab.set(tab.id);
			if (typeof window !== 'undefined') {
				const newHash = tab.id === 'all' ? '' : `#${tab.id}`;
				window.history.replaceState(null, '', `${window.location.pathname}${newHash}`);
			}
		}
	}
</script>

<Header />
<nav class="navigation-tabs" aria-label="Game navigation">
	<ul class="tabs-list" role="tablist">
		{#each tabs as tab (tab.id)}
			<li class="tab-item" role="presentation">
				<button
					type="button"
					class="tab-button"
					class:active={$activeTab === tab.id}
					onclick={() => handleTabClick(tab)}
					role="tab"
					aria-selected={$activeTab === tab.id}
					tabindex={$activeTab === tab.id ? 0 : -1}
				>
					<span class="tab-label">{tab.label}</span>
					{#if tab.count !== null}
						<span class="tab-count">({tab.count})</span>
					{/if}
				</button>
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Existing CSS remains unchanged */
</style>

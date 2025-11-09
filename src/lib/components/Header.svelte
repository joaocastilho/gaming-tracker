<script lang="ts">
	import { resolve } from '$app/paths';
	import { appStore } from '../stores/app.js';
	import { filtersStore } from '../stores/filters.js';
	import ThemeToggle from './ThemeToggle.svelte';

	const { activeTab } = appStore;

	function navigateTo(path: string) {
		if (typeof window !== 'undefined') {
			window.history.pushState({}, '', path);
		}
	}

	type TabId = 'all' | 'completed' | 'planned' | 'tierlist';

	interface Tab {
		id: TabId;
		label: string;
		route: string;
		count: number | null;
	}

	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	const tabs = $derived<Tab[]>([
		{
			id: 'all',
			label: 'Games',
			route: resolve('/'),
			count: $filteredGamesStore.totalCount
		},
		{
			id: 'completed',
			label: 'Completed',
			route: 'completed',
			count: $filteredGamesStore.completedCount
		},
		{
			id: 'planned',
			label: 'Planned',
			route: 'planned',
			count: $filteredGamesStore.plannedCount
		},
		{
			id: 'tierlist',
			label: 'Tier List',
			route: 'tierlist',
			count: null
		}
	]);

	function handleLogoClick() {
		filtersStore.resetAllFilters();
		appStore.activeTab.set('all');
		appStore.writeToURLWithFilters(filtersStore);

		scrollToTop();
	}

	function scrollToTop() {
		if (typeof window === 'undefined') return;

		window.scrollTo({ top: 0, behavior: 'instant' });
	}

	function handleTabClick(tab: Tab) {
		if (tab.id !== $activeTab) {
			appStore.setActiveTab(tab.id);
			navigateTo(tab.route);
		}
	}

	function preloadView(tabId: TabId) {
		// Preload the tier list view component
		if (tabId === 'tierlist') {
			import('$lib/views/TierListView.svelte').catch(() => {
				// Silently fail if preload fails
			});
		}
	}
</script>

<header class="header header-background">
	<div class="header-content container mx-auto px-6">
		<div class="header-left">
			<button
				class="logo"
				onclick={handleLogoClick}
				aria-label="Go to homepage and reset all filters"
			>
				<picture class="logo-image">
					<source srcset="logo.webp" type="image/webp" />
					<img src="logo.png" alt="Gaming Tracker Logo" />
				</picture>
			</button>
		</div>

		<div class="header-right">
			<ThemeToggle />
		</div>
	</div>

	<nav class="navigation-tabs" aria-label="Game navigation">
		<div class="navigation-content">
			<ul class="tabs-list" role="tablist">
				{#each tabs as tab (tab.id)}
					<li class="tab-item" role="presentation">
						<button
							type="button"
							class="tab-button"
							class:active={$activeTab === tab.id}
							onclick={() => handleTabClick(tab)}
							onmouseover={() => preloadView(tab.id)}
							onfocus={() => preloadView(tab.id)}
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
		</div>
	</nav>
</header>

<style>
	.header {
		top: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
		border: none;
	}

	.header-background {
		background-color: #0a0d11;
	}

	:global(.light) .header-background {
		background-color: #f2ebe1;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 60px;
		width: 100%;
		position: relative;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
		margin-left: 40px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
		border: none;
		background: none;
		padding: 0;
		cursor: pointer;
		transition: opacity 0.2s ease;
	}

	.logo:hover {
		opacity: 0.8;
	}

	.logo:focus {
		outline: none;
	}

	.logo:active,
	.logo:focus:active {
		outline: none;
		border: none;
		box-shadow: none;
	}

	.logo-image {
		width: auto;
		max-height: 55px;
		max-width: 145px;
		object-fit: contain;
	}

	.navigation-tabs {
		position: relative;
	}

	.navigation-content {
		position: relative;
	}

	.tabs-list {
		display: flex;
		justify-content: center;
		list-style: none;
		margin: 0;
		padding: 0 6rem;
		overflow-x: auto;
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}

	.tabs-list::-webkit-scrollbar {
		display: none; /* WebKit */
	}

	@media (min-width: 768px) {
		.tabs-list {
			padding: 0 8rem;
		}
	}

	@media (min-width: 1024px) {
		.tabs-list {
			padding: 0 10rem;
		}
	}

	.tab-item {
		flex-shrink: 0;
	}

	.tab-button {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		font-family: inherit;
		font-size: 1.2rem;
		font-weight: 500;
		padding: 1rem 1.5rem;
		position: relative;
		text-decoration: none;
		transition: all 0.2s ease;
		white-space: nowrap;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 0;
	}

	.tab-button:hover {
		color: var(--color-text-primary);
		background-color: rgba(255, 255, 255, 0.05);
	}

	:global(.light) .tab-button:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.tab-button:active {
		transform: translateY(1px);
		outline: none;
		border-color: transparent;
	}

	.tab-button.active {
		color: var(--color-accent);
	}

	.tab-button.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background-color: var(--color-accent);
		border-radius: 1px;
	}

	.tab-label {
		font-weight: 500;
	}

	.tab-count {
		color: var(--color-text-tertiary);
		font-weight: 600;
		padding: 0.125rem 0.375rem;
		line-height: 1;
		min-width: 1.5rem;
		text-align: center;
	}

	.tab-button.active .tab-count {
		color: var(--color-accent-foreground);
	}

	/* Mobile Responsive */
	@media (max-width: 768px) {
		.header-content {
			height: 56px;
		}

		.header-left {
			gap: 12px;
			margin-left: 36px; /* 24px container + 12px search bar */
		}

		.tabs-list {
			padding: 0 4rem; /* Reduced padding on mobile */
		}

		.tab-button {
			padding: 0.75rem 1rem;
			font-size: 0.85rem;
		}

		.tab-count {
			font-size: 0.7rem;
			padding: 0.1rem 0.3rem;
		}
	}

	@media (max-width: 480px) {
		.header-left {
			gap: 8px;
			margin-left: 32px;
		}

		.tabs-list {
			padding: 0 2rem;
		}

		.tab-button {
			padding: 0.6rem 0.8rem;
			font-size: 0.8rem;
		}
	}

	@media (prefers-contrast: high) {
		.tab-button {
			border: 1px solid transparent;
		}

		.tab-button:hover,
		.tab-button:focus {
			border-color: var(--color-accent);
		}

		.tab-button.active {
			border-color: var(--color-accent);
			border-bottom-color: transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.tab-button {
			transition: none;
		}

		.tab-button:active {
			transform: none;
		}
	}
</style>

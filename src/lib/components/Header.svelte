<script lang="ts">
	import { appStore } from '../stores/app.js';
	import { gamesStore } from '../stores/games.js';
	import { filtersStore } from '../stores/filters.js';
	import { modalStore } from '../stores/modal.js';
	import ThemeToggle from './ThemeToggle.svelte';

	// Subscribe to theme changes (value used for reactive updates)
	$effect(() => {
		const unsubscribe = appStore.theme.subscribe(() => {
			// Theme changes trigger reactive updates
		});
		return unsubscribe;
	});

	// Game count data - using filtered counts when search is active
	let gameCounts = $state({ total: 0, planned: 0, completed: 0 });
	let isFiltered = $state(false);

	// Create filtered games store
	const filteredGamesStore = filtersStore.createFilteredGamesStore(gamesStore);

	// Subscribe to filtered games store to get counts
	$effect(() => {
		const unsubscribe = filteredGamesStore.subscribe((data) => {
			gameCounts = {
				total: data.totalCount,
				planned: data.plannedCount,
				completed: data.completedCount
			};
		});
		return unsubscribe;
	});

	// Check if any filters are active
	$effect(() => {
		const unsubscribe = filtersStore.filterState.subscribe(() => {
			isFiltered = filtersStore.hasActiveFilters();
		});
		return unsubscribe;
	});

	// Add game handler - opens the add game modal
	function handleAddGame() {
		modalStore.openAddModal();
	}
</script>

<header class="header">
	<!-- Left section: Logo -->
	<div class="header-left">
		<div class="logo">
			<picture class="logo-image">
				<source srcset="/logo.webp" type="image/webp" />
				<img src="/logo.png" alt="Gaming Tracker Logo" />
			</picture>
		</div>
	</div>

	<!-- Right section: Theme Toggle -->
	<div class="header-right">
		<ThemeToggle />
	</div>
</header>

<style>
	.header {
		/* Layout */
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 24px;
		height: 60px;
		width: 100%;

		/* Dark mode colors */
		background-color: #0a0d11;
		color: #ffffff;

		/* Typography */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;

		/* Positioning */
		position: sticky;
		top: 0;
		z-index: 40;

		/* Remove border */
		border: none;
	}

	/* Light mode overrides */
	:global(.light) .header {
		background-color: #f0f9ff;
		color: #1a1a1a;
	}

	/* Left section */
	.header-left {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	/* Logo section */
	.logo {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.logo-image {
		height: 56px;
		width: auto;
		max-width: 180px;
		object-fit: contain;
	}



	/* Right section */
	.header-right {
		display: flex;
		align-items: center;
		gap: 20px;
	}



	/* Responsive design */
	@media (max-width: 768px) {
		.header {
			padding: 0 16px;
			height: 56px;
		}

		.header-left,
		.header-right {
			gap: 12px;
		}
	}

	@media (max-width: 480px) {
		.header {
			padding: 0 12px;
		}

		.header-left,
		.header-right {
			gap: 8px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		/* No transitions to remove since Add Game button is removed */
	}
</style>

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
	<!-- Left section: Logo and Add Game Button -->
	<div class="header-left">
		<div class="logo">
			<picture class="logo-image">
				<source srcset="/logo.webp" type="image/webp" />
				<img src="/logo.png" alt="Gaming Tracker Logo" />
			</picture>
		</div>

		<button
			type="button"
			class="add-game-btn"
			onclick={handleAddGame}
			aria-label="Add new game"
			title="Add new game"
		>
			<span class="add-icon" aria-hidden="true">+</span>
			<span class="add-text">Add Game</span>
		</button>
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

	/* Add Game Button */
	.add-game-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: none;
		border-radius: 6px;
		background-color: rgba(42, 47, 58, 0.4);
		color: #8b92a8;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.add-game-btn:hover {
		background-color: rgba(42, 47, 58, 0.7);
		color: #ffffff;
		transform: translateY(-1px);
	}

	.add-game-btn:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.add-game-btn:active {
		transform: translateY(0);
	}

	.add-icon {
		font-size: 16px;
		font-weight: 600;
		line-height: 1;
	}

	.add-text {
		white-space: nowrap;
	}

	/* Light mode add button */
	:global(.light) .add-game-btn {
		background-color: rgba(243, 244, 246, 0.6);
		color: #6b7280;
	}

	:global(.light) .add-game-btn:hover {
		background-color: rgba(243, 244, 246, 0.8);
		color: #1a1a1a;
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

		.logo-text {
			display: none;
		}

		.add-text {
			display: none;
		}

		.add-game-btn {
			padding: 8px;
			min-width: 36px;
			justify-content: center;
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

		.add-game-btn {
			padding: 6px;
			min-width: 32px;
		}

		.add-icon {
			font-size: 14px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.add-game-btn {
			transition: none;
		}

		.add-game-btn:hover {
			transform: none;
		}
	}
</style>

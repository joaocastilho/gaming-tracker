<script lang="ts">
	import { appStore } from '../stores/app.js';
	import { gamesStore } from '../stores/games.js';
	import { filtersStore } from '../stores/filters.js';
	import { modalStore } from '../stores/modal.js';
	import ThemeToggle from './ThemeToggle.svelte';
	import type { Game } from '../types/game.js';

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

	// Export games handler
	function handleExportGames() {
		// Get current games and export them
		let currentGames: Game[] = [];
		const unsubscribe = gamesStore.subscribe((games) => {
			currentGames = games;
		});
		unsubscribe();

		gamesStore.exportGames(currentGames);
	}
</script>

<header class="header">
	<!-- Left section: Logo and Add Game Button -->
	<div class="header-left">
		<div class="logo">
			<span class="logo-emoji" aria-hidden="true">🎮</span>
			<h1 class="logo-text">Gaming Tracker</h1>
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

	<!-- Right section: Game Count and Action Buttons -->
	<div class="header-right">
		<div class="game-count" aria-live="polite" aria-atomic="true">
			<span class="count-number">{gameCounts.total}</span>
			<span class="count-label">
				{gameCounts.total === 1 ? 'game' : 'games'}
				{isFiltered ? 'found' : 'tracked'}
			</span>
		</div>

		<!-- Export Button -->
		<button
			type="button"
			class="export-btn"
			onclick={handleExportGames}
			aria-label="Export games data"
			title="Export games as JSON"
		>
			<span class="export-icon" aria-hidden="true">⬇️</span>
			<span class="export-text">Export</span>
		</button>

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
		border-bottom: 1px solid #2a2f3a;
		color: #ffffff;

		/* Typography */
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;

		/* Positioning */
		position: relative;
		z-index: 10;
	}

	/* Light mode overrides */
	:global(.light) .header {
		background-color: #ffffff;
		border-bottom: 1px solid #e5e7eb;
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

	.logo-emoji {
		font-size: 24px;
		line-height: 1;
	}

	.logo-text {
		font-size: 18px;
		font-weight: 600;
		margin: 0;
		line-height: 1;
	}

	/* Add Game Button */
	.add-game-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid #2a2f3a;
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
		border-color: #3b82f6;
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
		border-color: #d1d5db;
		color: #6b7280;
	}

	:global(.light) .add-game-btn:hover {
		background-color: rgba(243, 244, 246, 0.8);
		color: #1a1a1a;
		border-color: #3b82f6;
	}

	/* Right section */
	.header-right {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	/* Game Count */
	.game-count {
		display: flex;
		align-items: baseline;
		gap: 4px;
		color: #8b92a8;
		font-size: 0.9rem;
	}

	:global(.light) .game-count {
		color: #6b7280;
	}

	.count-number {
		font-size: 1.1rem;
		font-weight: 600;
		color: #ffffff;
	}

	:global(.light) .count-number {
		color: #1a1a1a;
	}

	.count-label {
		white-space: nowrap;
	}

	/* Export Button */
	.export-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 1px solid #2a2f3a;
		border-radius: 6px;
		background-color: rgba(42, 47, 58, 0.4);
		color: #8b92a8;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		text-decoration: none;
	}

	.export-btn:hover {
		background-color: rgba(42, 47, 58, 0.7);
		color: #ffffff;
		border-color: #10b981;
		transform: translateY(-1px);
	}

	.export-btn:focus {
		outline: 2px solid #10b981;
		outline-offset: 2px;
	}

	.export-btn:active {
		transform: translateY(0);
	}

	.export-icon {
		font-size: 14px;
		line-height: 1;
	}

	.export-text {
		white-space: nowrap;
	}

	/* Light mode export button */
	:global(.light) .export-btn {
		background-color: rgba(243, 244, 246, 0.6);
		border-color: #d1d5db;
		color: #6b7280;
	}

	:global(.light) .export-btn:hover {
		background-color: rgba(243, 244, 246, 0.8);
		color: #1a1a1a;
		border-color: #10b981;
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

		.game-count {
			font-size: 0.8rem;
		}

		.count-number {
			font-size: 1rem;
		}

		.export-text {
			display: none;
		}

		.export-btn {
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

		.game-count {
			font-size: 0.75rem;
		}

		.count-number {
			font-size: 0.9rem;
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

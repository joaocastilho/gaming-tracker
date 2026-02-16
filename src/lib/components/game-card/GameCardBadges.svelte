<script lang="ts">
	import { filtersStore } from '../../stores/filters.svelte';
	import { getPlatformClasses, getGenreClasses } from '../../utils/colorConstants.js';
	import type { Game } from '../../types/game.js';
	import { Users } from 'lucide-svelte';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	function isValidKeyboardAction(event: KeyboardEvent): boolean {
		return event.key === 'Enter' || event.key === ' ';
	}

	function handlePlatformClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.togglePlatform(game.platform);
	}

	function handleGenreClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleGenre(game.genre);
	}

	function handleCoOpClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleCoOp('Yes');
	}
</script>

<div class="metadata-row">
	<div class="badges-left">
		<button
			class="badge platform-badge {getPlatformClasses(game.platform)}"
			onclick={handlePlatformClick}
			onkeydown={handlePlatformClick}
			aria-label="Filter by {game.platform}"
			title="Platform: {game.platform}"
		>
			{game.platform}
		</button>
		<button
			class="badge genre-badge {getGenreClasses(game.genre)}"
			onclick={handleGenreClick}
			onkeydown={handleGenreClick}
			aria-label="Filter by {game.genre}"
			title="Genre: {game.genre}"
		>
			{game.genre}
		</button>
	</div>
	<div class="year-right">
		<span class="game-year">{game.year}</span>
		{#if game.coOp === 'Yes'}
			<button
				class="coop-badge"
				onclick={handleCoOpClick}
				onkeydown={handleCoOpClick}
				aria-label="Filter by Co-op"
				title="Co-op Available"
			>
				<Users size={18} class="text-blue-500" />
			</button>
		{/if}
	</div>
</div>

<style>
	.metadata-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.badges-left {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.year-right {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.game-year {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
	}

	.badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 4px 10px;
		border-radius: 6px;
		white-space: nowrap;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid transparent;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	.coop-badge {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s;
		min-width: 44px;
		min-height: 44px;
	}

	/* Responsive Styles */
	@media (max-width: 768px) {
		.metadata-row {
			gap: 8px;
			align-items: center;
		}

		.badges-left {
			gap: 6px;
			flex-wrap: nowrap;
			overflow: hidden;
		}

		.year-right {
			font-size: 0.8rem;
			gap: 4px;
		}

		.badge {
			font-size: 0.725rem;
			padding: 4px 10px;
			max-width: 160px;
		}
	}

	@media (max-width: 480px) {
		.metadata-row {
			gap: 4px;
		}

		.badges-left {
			gap: 3px;
		}

		.year-right {
			font-size: 0.75rem;
			gap: 3px;
		}

		.badge {
			font-size: clamp(0.65rem, 5.5cqi, 0.75rem);
			padding: 3px 6px;
			max-width: 42cqi;
		}
	}
</style>

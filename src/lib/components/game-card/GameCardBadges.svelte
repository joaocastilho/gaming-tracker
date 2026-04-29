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

let isMobile = $state(false);

$effect(() => {
	const checkMobile = () => {
		isMobile = window.innerWidth < 768;
	};

	checkMobile();
	window.addEventListener('resize', checkMobile);
	return () => window.removeEventListener('resize', checkMobile);
});
</script>

<div class="metadata-row">
	<div class="badges-left">
		<button
			class="badge platform-badge {getPlatformClasses(game.platform)}"
			onclick={handlePlatformClick}
			onkeydown={handlePlatformClick}
			aria-label="Filter by {game.platform}"
			title="Platform: {game.platform}"
			disabled={isMobile}
		>
			{game.platform}
		</button>
		<button
			class="badge genre-badge {getGenreClasses(game.genre)}"
			onclick={handleGenreClick}
			onkeydown={handleGenreClick}
			aria-label="Filter by {game.genre}"
			title="Genre: {game.genre}"
			disabled={isMobile}
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
				disabled={isMobile}
			>
				<Users size={16} class="text-blue-500" />
			</button>
		{/if}
	</div>
</div>

<style>
	.metadata-row {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 8px;
	}

	.badges-left {
		display: flex;
		gap: 8px;
		flex-wrap: nowrap;
		align-items: center;
		min-width: 0;
		padding-top: 2px;
	}

	.year-right {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}

	.game-year {
		font-size: clamp(0.75rem, 0.5rem + 2cqw, 1.1rem);
		font-weight: 600;
		color: var(--color-text-secondary);
		line-height: 1.1;
	}

	.badge {
		font-size: clamp(0.65rem, 5.5cqi, 0.75rem);
		font-weight: 500;
		padding: 4px 8px;
		border-radius: 4px;
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
		margin-left: 0;
	}

	@media (max-width: 768px) {
		.badge,
		.coop-badge {
			pointer-events: none;
		}
	}

	@container game-card (max-width: 300px) {
		.metadata-row {
			display: grid;
			grid-template-columns: 1fr auto;
			grid-template-areas: 
				"platform year"
				"genre coop";
			gap: 8px 4px;
			align-items: flex-start;
		}
		.badges-left {
			display: contents;
		}
		.platform-badge {
			grid-area: platform;
			max-width: 100%;
			justify-self: start;
		}
		.coop-badge {
			grid-area: coop;
			justify-self: end;
		}
		.genre-badge {
			grid-area: genre;
			justify-self: start;
			max-width: 100%;
		}
		.year-right {
			display: contents;
		}
		.game-year {
			grid-area: year;
			padding-top: 6px;
		}
		.badge {
			padding: 2px 6px;
		}
	}
</style>

<script lang="ts">
	import type { Game } from '$lib/types/game';

	interface Props {
		game: Game;
		date: string;
		onclick?: () => void;
	}

	let { game, date, onclick }: Props = $props();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.();
		}
	}
</script>

<div class="timeline-item" role="button" tabindex="0" {onclick} onkeydown={handleKeyDown}>
	<div class="timeline-marker">
		<div class="marker-dot"></div>
		<div class="marker-line"></div>
	</div>

	<div class="timeline-content">
		<div class="game-cover">
			<img src={game.coverImage} alt={`${game.title} cover`} loading="lazy" />
		</div>

		<div class="game-info">
			<span class="completion-date">{date}</span>
			<h3 class="game-title">{game.mainTitle}</h3>
			{#if game.subtitle}
				<span class="game-subtitle">{game.subtitle}</span>
			{/if}
			<span class="game-meta">
				{game.platform} • {game.playtime}
			</span>
		</div>
	</div>
</div>

<style>
	.timeline-item {
		display: flex;
		gap: 1rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: background-color 0.15s ease;
	}

	.timeline-item:hover {
		background-color: var(--color-hover);
	}

	.timeline-item:focus {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.timeline-marker {
		display: flex;
		flex-direction: column;
		align-items: center;
		flex-shrink: 0;
		width: 24px;
	}

	.marker-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: var(--color-primary);
		border: 2px solid var(--color-primary);
		box-shadow: 0 0 0 3px var(--color-background);
		z-index: 1;
	}

	.marker-line {
		flex: 1;
		width: 2px;
		background-color: var(--color-border);
		margin-top: 0.25rem;
		min-height: 60px;
	}

	.timeline-content {
		display: flex;
		gap: 1rem;
		flex: 1;
		min-width: 0;
	}

	.game-cover {
		width: 64px;
		height: 90px;
		border-radius: 0.375rem;
		overflow: hidden;
		flex-shrink: 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.game-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.completion-date {
		font-size: 0.75rem;
		color: var(--color-primary);
		font-weight: 600;
	}

	.game-title {
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		line-height: 1.3;
		margin: 0;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.game-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.game-meta {
		font-size: 0.75rem;
		color: var(--color-text-secondary);
	}

	@media (max-width: 480px) {
		.timeline-content {
			gap: 0.75rem;
		}

		.game-cover {
			width: 56px;
			height: 78px;
		}

		.game-title {
			font-size: 0.9375rem;
		}
	}
</style>

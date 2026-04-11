<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { ChevronRight } from 'lucide-svelte';

	interface Props {
		game: Game;
		day: string;
		onclick?: () => void;
	}

	let { game, day, onclick }: Props = $props();
	let isHovered = $state(false);

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onclick?.();
		}
	}

	function handleMouseEnter() {
		isHovered = true;
	}

	function handleMouseLeave() {
		isHovered = false;
	}
</script>

<div
	class="timeline-item"
	class:hovered={isHovered}
	role="button"
	tabindex="0"
	{onclick}
	onkeydown={handleKeyDown}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
>
	<div class="cover-wrapper">
		<div class="game-cover">
			<img src={game.coverImage} alt={`${game.title} cover`} loading="lazy" />
		</div>
		{#if day}
			<div class="day-badge">
				<span class="day-number">{day}</span>
			</div>
		{/if}
	</div>

	<div class="game-info">
		<h3 class="game-title">{game.mainTitle}</h3>
		{#if game.subtitle}
			<span class="game-subtitle">{game.subtitle}</span>
		{/if}
		<div class="game-meta">
			<span class="platform">{game.platform}</span>
			<span class="separator">•</span>
			<span class="playtime">{game.playtime}</span>
			{#if game.tier}
				<span class="separator">•</span>
				<span class="tier-badge">{game.tier}</span>
			{/if}
		</div>
	</div>

	<div class="chevron-wrapper">
		<ChevronRight size={20} />
	</div>
</div>

<style>
	.timeline-item {
		display: flex;
		gap: 1rem;
		cursor: pointer;
		padding: 0.875rem;
		border-radius: 1rem;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		background-color: var(--color-surface);
		position: relative;
		align-items: center;
	}

	.timeline-item:hover,
	.timeline-item.hovered {
		background-color: var(--color-hover);
		transform: translateY(-2px);
	}

	.timeline-item:focus {
		outline: none;
	}

	.timeline-item:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: 2px;
	}

	.cover-wrapper {
		position: relative;
		flex-shrink: 0;
	}

	.game-cover {
		width: 140px;
		height: 200px;
		border-radius: 0.875rem;
		overflow: hidden;
		box-shadow:
			0 6px 20px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.08);
		transition:
			transform 0.25s ease,
			box-shadow 0.25s ease;
	}

	.timeline-item:hover .game-cover,
	.timeline-item.hovered .game-cover {
		transform: scale(1.02);
		box-shadow:
			0 8px 24px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.game-cover img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.day-badge {
		position: absolute;
		top: -6px;
		right: -6px;
		width: 32px;
		height: 32px;
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark, #6366f1) 100%
		);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
		z-index: 1;
	}

	.day-number {
		font-size: 0.75rem;
		font-weight: 800;
		color: white;
		line-height: 1;
	}

	.game-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
		flex: 1;
	}

	.game-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: var(--color-text-primary);
		line-height: 1.25;
		margin: 0;
		word-wrap: break-word;
		transition: color 0.2s ease;
	}

	.timeline-item:hover .game-title,
	.timeline-item.hovered .game-title {
		color: var(--color-primary);
	}

	.game-subtitle {
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.game-meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--color-text-secondary);
		margin-top: 0.25rem;
	}

	.separator {
		opacity: 0.5;
	}

	.platform {
		font-weight: 600;
	}

	.playtime {
		opacity: 0.8;
	}

	.tier-badge {
		background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.25) 100%);
		color: #fbbf24;
		font-weight: 600;
		font-size: 0.6875rem;
		padding: 0.125rem 0.5rem;
		border-radius: 9999px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.chevron-wrapper {
		color: var(--color-text-tertiary);
		opacity: 0;
		transform: translateX(-8px);
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.timeline-item:hover .chevron-wrapper,
	.timeline-item.hovered .chevron-wrapper {
		opacity: 1;
		transform: translateX(0);
		color: var(--color-primary);
	}

	@media (max-width: 500px) {
		.timeline-item {
			gap: 0.75rem;
			padding: 0.75rem;
		}

		.game-cover {
			width: 100px;
			height: 140px;
		}

		.game-title {
			font-size: 1rem;
		}

		.game-meta {
			font-size: 0.75rem;
		}
	}
</style>

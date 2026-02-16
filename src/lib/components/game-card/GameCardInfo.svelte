<script lang="ts">
	import type { Game } from '../../types/game.js';
	import { Timer, CalendarDays, Presentation, NotebookPen, Gamepad2, Award } from 'lucide-svelte';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	const hasPresentation = $derived(game.status === 'Completed' && game.ratingPresentation !== null);
	const hasStory = $derived(game.status === 'Completed' && game.ratingStory !== null);
	const hasGameplay = $derived(game.status === 'Completed' && game.ratingGameplay !== null);
</script>

<!-- Time and Date Section -->
<div class="time-date-row">
	<div class="time-item" title={game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}>
		<Timer size={18} />
		<span>{game.playtime ?? 'N/A'}</span>
	</div>
	<div
		class="date-item"
		title={game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}
	>
		<CalendarDays size={20} />
		<span
			>{game.status === 'Completed' && game.finishedDate
				? formatDate(game.finishedDate)
				: 'Soon'}</span
		>
	</div>
</div>

<!-- Ratings Section -->
<div class="ratings-compact">
	<div
		class="rating-item {hasPresentation ? '' : 'placeholder'}"
		title={hasPresentation ? `Presentation: ${game.ratingPresentation}/10` : 'Presentation'}
	>
		<Presentation size={32} class={hasPresentation ? 'text-rose-500' : 'text-muted'} />
		{#if hasPresentation}
			<span class="rating-value">{game.ratingPresentation}</span>
		{/if}
	</div>

	<div
		class="rating-item {hasStory ? '' : 'placeholder'}"
		title={hasStory ? `Story: ${game.ratingStory}/10` : 'Story'}
	>
		<NotebookPen size={32} class={hasStory ? 'text-sky-500' : 'text-muted'} />
		{#if hasStory}
			<span class="rating-value">{game.ratingStory}</span>
		{/if}
	</div>

	<div
		class="rating-item {hasGameplay ? '' : 'placeholder'}"
		title={hasGameplay ? `Gameplay: ${game.ratingGameplay}/10` : 'Gameplay'}
	>
		<Gamepad2 size={32} class={hasGameplay ? 'text-emerald-500' : 'text-muted'} />
		{#if hasGameplay}
			<span class="rating-value">{game.ratingGameplay}</span>
		{/if}
	</div>
</div>

<!-- Total Score Section -->
{#if game.status === 'Completed' && game.score !== null}
	<div class="status-indicator score-badge">
		<Award size={18} class="text-amber-400" />
		<span>SCORE {game.score}</span>
	</div>
{:else}
	<div class="status-indicator planned-badge">
		<span>PLANNED</span>
	</div>
{/if}

<style>
	.time-date-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 0px 5px 0px;
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
	}

	.ratings-compact {
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 4px 0;
		/* Center the ratings vertically between the top content (Timer) and bottom (Status) */
		margin: auto 0;
		width: 100%;
	}

	.rating-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.rating-item.placeholder {
		opacity: 0.3;
		filter: grayscale(1);
	}

	/* Text Colors handled by tailwind classes usually, but define muted here if needed */
	:global(.text-muted) {
		color: var(--color-text-tertiary, #888);
	}

	.rating-value {
		font-size: 1.1rem;
		font-weight: 800;
		color: var(--color-text-primary);
	}

	.rating-item :global(svg) {
		width: 32px;
		height: 32px;
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-weight: 800;
		font-size: 0.95rem;
		padding: 8px;
		/* box-shadow handled below */
		margin-top: 4px; /* Default small gap */
		border-radius: 12px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transition: all var(--transition-normal);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.score-badge {
		color: #fbbf24;
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.25);
		box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
	}

	.planned-badge {
		color: #60a5fa;
		background: rgba(59, 130, 246, 0.15);
		border-color: rgba(59, 130, 246, 0.25);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
	}

	:global(.light) .score-badge {
		background: rgba(245, 158, 11, 0.1);
		border-color: rgba(245, 158, 11, 0.2);
	}

	:global(.light) .planned-badge {
		background: rgba(59, 130, 246, 0.1);
		border-color: rgba(59, 130, 246, 0.2);
	}

	/* Responsive Styles using Container Queries */
	@container game-card (max-width: 420px) {
		.time-date-row {
			font-size: clamp(0.7rem, 6cqi, 0.85rem);
			padding: 6px 0 2px 0;
			gap: 4px;
		}

		.time-item,
		.date-item {
			white-space: nowrap;
		}

		.ratings-compact {
			padding: 4px 0;
			justify-content: space-evenly;
			gap: 2px;
			width: 100%;
		}

		.rating-item {
			flex-direction: row;
			align-items: center;
			gap: 4px;
		}

		.rating-item :global(svg) {
			width: 32px;
			height: 32px;
		}

		.rating-value {
			font-size: 1.1rem;
			font-weight: 800;
			color: var(--color-text-primary);
		}

		.status-indicator {
			padding: 8px;
			font-size: clamp(0.75rem, 6cqi, 0.85rem);
			margin-top: 6px;
			border-radius: 10px;
		}

		.status-indicator :global(svg) {
			width: 16px;
			height: 16px;
		}
	}

	@container game-card (max-width: 320px) {
		.ratings-compact {
			padding: 0;
			gap: 2px;
		}

		.time-date-row {
			font-size: 0.75rem;
		}
	}
</style>

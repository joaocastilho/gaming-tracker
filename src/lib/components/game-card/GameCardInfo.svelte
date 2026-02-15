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
</script>

<!-- Time and Date Section -->
<div class="time-date-row">
	<div class="time-item" title={game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}>
		<Timer size={16} />
		<span>{game.playtime ?? 'N/A'}</span>
	</div>
	<div
		class="date-item"
		title={game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}
	>
		<CalendarDays size={18} />
		<span
			>{game.status === 'Completed' && game.finishedDate
				? formatDate(game.finishedDate)
				: 'Soon'}</span
		>
	</div>
</div>

<!-- Ratings Section -->
{#if game.status === 'Completed' && game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null}
	<div class="ratings-compact">
		<div class="rating-item" title="Presentation: {game.ratingPresentation}/10">
			<Presentation size={28} class="text-rose-500" />
			<span class="rating-value">{game.ratingPresentation}</span>
		</div>
		<div class="rating-item" title="Story: {game.ratingStory}/10">
			<NotebookPen size={28} class="text-sky-500" />
			<span class="rating-value">{game.ratingStory}</span>
		</div>
		<div class="rating-item" title="Gameplay: {game.ratingGameplay}/10">
			<Gamepad2 size={28} class="text-emerald-500" />
			<span class="rating-value">{game.ratingGameplay}</span>
		</div>
	</div>
{/if}

<!-- Total Score Section -->
{#if game.status === 'Completed' && game.score !== null}
	<div class="total-score-badge">
		<Award size={20} class="text-amber-500" />
		<span>SCORE {game.score}</span>
	</div>
{:else}
	<div class="planned-indicator">
		<span>PLANNED</span>
	</div>
{/if}

<style>
	.time-date-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 12px 0px 5px 0px;
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
		padding: 8px 0;
	}

	.rating-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
	}

	.rating-value {
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.total-score-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-weight: 800;
		font-size: 1rem;
		color: var(--color-rating-total, #f59e0b);
		padding: 6px;
		margin-top: auto;
	}

	.planned-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-weight: 800;
		font-size: 1rem;
		color: #60a5fa;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1));
		border-radius: 12px;
		padding: 6px;
		margin-top: auto;
	}

	/* Responsive Styles */
	@media (max-width: 768px) {
		.time-date-row {
			font-size: 0.75rem;
			padding: 6px 0;
		}

		.ratings-compact {
			padding: 0;
			gap: 3px;
		}

		.rating-value {
			font-size: clamp(1.1rem, 5cqi, 2rem);
		}

		.total-score-badge {
			padding: 8px 12px;
			font-size: 0.85rem;
		}

		.planned-indicator {
			font-size: 0.8rem;
		}
	}

	@media (max-width: 480px) {
		.ratings-compact {
			padding: 0;
			gap: 2px;
		}

		.time-date-row {
			font-size: 0.75rem;
		}
	}
</style>

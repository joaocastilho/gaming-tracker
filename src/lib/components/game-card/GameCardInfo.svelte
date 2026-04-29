<script lang="ts">
import type { Game } from '../../types/game.js';
import { formatShortDate, formatMobileDate } from '$lib/utils/dateUtils';
import { Timer, CalendarDays, Presentation, NotebookPen, Gamepad2, Award } from 'lucide-svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

function formatSmartTime(timeStr: string | null): string {
	if (!timeStr) return 'N/A';
	let formatted = timeStr.replace(' ', '');
	if (formatted.endsWith('00m')) {
		formatted = formatted.replace('00m', '');
	}
	return formatted;
}

const hasPresentation = $derived(game.status === 'Completed' && game.ratingPresentation !== null);
const hasStory = $derived(game.status === 'Completed' && game.ratingStory !== null);
const hasGameplay = $derived(game.status === 'Completed' && game.ratingGameplay !== null);
</script>

<!-- Time and Date Section -->
<div class="time-date-row">
	<div class="time-item" title={game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}>
		<Timer />
		<span>{formatSmartTime(game.playtime)}</span>
	</div>
	<div class="date-item" title={game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}>
		<CalendarDays />
		<span class="desktop-text">{game.status === 'Completed' && game.finishedDate ? formatShortDate(game.finishedDate) : 'Soon'}</span>
		<span class="mobile-text">{game.status === 'Completed' && game.finishedDate ? formatMobileDate(game.finishedDate) : 'Soon'}</span>
	</div>
</div>

<div class="ratings-and-score-wrapper">
	<!-- Ratings Section -->
<div class="ratings-compact">
	<div
		class="rating-item {hasPresentation ? '' : 'placeholder'}"
		title={hasPresentation ? `Presentation: ${game.ratingPresentation}/10` : 'Presentation'}
	>
		<Presentation size={32} class={hasPresentation ? 'text-rose-500' : 'text-muted'} />
		<span class="rating-value" style="visibility: {hasPresentation ? 'visible' : 'hidden'};">
			{hasPresentation ? game.ratingPresentation : '0'}
		</span>
	</div>

	<div
		class="rating-item {hasStory ? '' : 'placeholder'}"
		title={hasStory ? `Story: ${game.ratingStory}/10` : 'Story'}
	>
		<NotebookPen size={32} class={hasStory ? 'text-sky-500' : 'text-muted'} />
		<span class="rating-value" style="visibility: {hasStory ? 'visible' : 'hidden'};">
			{hasStory ? game.ratingStory : '0'}
		</span>
	</div>

	<div class="rating-item {hasGameplay ? '' : 'placeholder'}" title={hasGameplay ? `Gameplay: ${game.ratingGameplay}/10` : 'Gameplay'}>
		<Gamepad2 size={32} class={hasGameplay ? 'text-emerald-500' : 'text-muted'} />
		<span class="rating-value" style="visibility: {hasGameplay ? 'visible' : 'hidden'};">
			{hasGameplay ? game.ratingGameplay : '0'}
		</span>
	</div>
</div>

<!-- Total Score Section -->
{#if game.status === 'Completed' && game.score !== null}
	<div class="status-indicator score-badge">
		<Award class="text-amber-400" />
		<div class="score-text-wrapper">
			<span class="desktop-text">
				<span class="score-value">{game.score}</span>
			</span>
			<span class="mobile-text">
				<span class="score-value">{game.score}</span>
			</span>
		</div>
	</div>
{:else}
	<div class="status-indicator planned-badge">
		<span>PLANNED</span>
	</div>
{/if}
</div>

<style>
	.time-date-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 2px 0px 3px 0px;
		flex: 1;
		min-width: 0;
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: center;
		gap: clamp(4px, 1.5cqw, 6px);
		font-size: clamp(0.75rem, 0.5rem + 1.5cqw, 0.875rem);
		color: var(--color-text-secondary);
		flex-shrink: 1;
		min-width: 0;
	}

	.time-item :global(svg) {
		width: clamp(14px, 7px + 2.8cqw, 18px);
		height: clamp(14px, 7px + 2.8cqw, 18px);
	}

	.date-item :global(svg) {
		width: clamp(14px, 4px + 4cqw, 20px);
		height: clamp(14px, 4px + 4cqw, 20px);
	}

	.time-item span,
	.date-item span {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.ratings-compact {
		display: flex;
		justify-content: space-evenly;
		align-items: stretch;
		padding: 0;
		flex: 1;
		gap: clamp(4px, 1.5cqw, 8px);
		margin-top: 4px;
	}

	.rating-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: clamp(4px, 1.5cqw, 8px);
		flex: 1;
		min-width: 0;
	}

	.rating-item.placeholder {
		opacity: 0.3;
		filter: grayscale(1);
	}

	:global(.text-muted) {
		color: var(--color-text-tertiary, #888);
	}

	.rating-value {
		font-size: clamp(0.9rem, 0.55rem + 2.2cqw, 1.1rem);
		font-weight: 800;
		color: var(--color-text-primary);
	}

	.rating-item :global(svg) {
		width: clamp(16px, 8cqw, 32px);
		height: clamp(16px, 8cqw, 32px);
	}

	.status-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: clamp(8px, 1px + 2.8cqw, 12px);
		font-weight: 800;
		font-size: clamp(0.8rem, 0.55rem + 1.6cqw, 0.95rem);
		padding: clamp(4px, 1.5cqw, 6px) clamp(6px, 2cqw, 8px);
		flex: 1;
		border-radius: 4px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transition: all var(--transition-normal);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		margin-top: auto;
	}

	.status-indicator :global(svg) {
		width: clamp(16px, 12px + 1.5cqw, 18px);
		height: clamp(16px, 12px + 1.5cqw, 18px);
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

	.mobile-text {
		display: none;
	}

	.desktop-text {
		display: inline-block;
	}

	.score-text-wrapper {
		display: contents;
	}

	.score-value {
		font-size: clamp(0.9rem, 0.65rem + 1.6cqw, 1.05rem);
		font-weight: 900;
	}

	.ratings-and-score-wrapper {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
		margin-top: 8px;
		flex-grow: 1;
	}

	@container game-card (max-width: 300px) {
		.desktop-text {
			display: none !important;
		}

		.mobile-text {
			display: inline-block !important;
		}

		.ratings-compact {
			margin-bottom: 8px;
		}
	}
</style>

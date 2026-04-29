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
		<span class="rating-value">
			{hasPresentation ? game.ratingPresentation : '-'}
		</span>
	</div>

	<div
		class="rating-item {hasStory ? '' : 'placeholder'}"
		title={hasStory ? `Story: ${game.ratingStory}/10` : 'Story'}
	>
		<NotebookPen size={32} class={hasStory ? 'text-sky-500' : 'text-muted'} />
		<span class="rating-value">
			{hasStory ? game.ratingStory : '-'}
		</span>
	</div>

	<div class="rating-item {hasGameplay ? '' : 'placeholder'}" title={hasGameplay ? `Gameplay: ${game.ratingGameplay}/10` : 'Gameplay'}>
		<Gamepad2 size={32} class={hasGameplay ? 'text-emerald-500' : 'text-muted'} />
		<span class="rating-value">
			{hasGameplay ? game.ratingGameplay : '-'}
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
		align-items: flex-end;
		padding: 2px 0px 3px 0px;
		min-width: 0;
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: flex-end;
		gap: clamp(8px, 2.5cqw, 12px);
		font-size: clamp(0.8rem, 0.55rem + 2.2cqw, 1.15rem);
		color: var(--color-text-secondary);
		flex-shrink: 1;
		min-width: 0;
		line-height: 1;
	}

	.time-item :global(svg) {
		width: clamp(14px, 7px + 3.5cqw, 22px);
		height: clamp(14px, 7px + 3.5cqw, 22px);
	}

	.date-item :global(svg) {
		width: clamp(14px, 4px + 5cqw, 24px);
		height: clamp(14px, 4px + 5cqw, 24px);
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
		gap: clamp(4px, 1.5cqw, 8px);
		margin-bottom: 8px;
	}

	.rating-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: clamp(8px, 3cqw, 16px);
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
		font-size: clamp(1.1rem, 0.7rem + 3cqw, 1.4rem);
		font-weight: 800;
		color: var(--color-text-primary);
		line-height: 1;
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
		font-size: clamp(0.9rem, 0.6rem + 2cqw, 1.1rem);
		padding: 6px clamp(6px, 2cqw, 8px);
		flex-shrink: 0;
		border-radius: 4px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transition: all var(--transition-normal);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		line-height: 1;
	}

	.status-indicator :global(svg) {
		width: clamp(20px, 14px + 3.5cqw, 32px);
		height: clamp(20px, 14px + 3.5cqw, 32px);
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
		min-height: clamp(35px, 29px + 3.5cqw, 47px);
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
		font-size: clamp(1.15rem, 0.85rem + 2.8cqw, 1.6rem);
		font-weight: 900;
		line-height: 1;
	}

	.ratings-and-score-wrapper {
		display: flex;
		flex-direction: column;
		gap: 16px;
		width: 100%;
		margin-top: 12px;
	}

	@container game-card (max-width: 300px) {
		.desktop-text {
			display: none !important;
		}

		.mobile-text {
			display: inline-block !important;
		}
	}
</style>


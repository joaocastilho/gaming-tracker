<script lang="ts">
import type { Game } from '../../types/game.js';
import { Timer, CalendarDays, Presentation, NotebookPen, Gamepad2, Award } from 'lucide-svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

function formatDate(dateString: string): string {
	try {
		// Try ISO format first (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.fffZ)
		if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
			const date = new Date(dateString);
			if (!isNaN(date.getTime())) {
				return date.toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric',
					year: 'numeric',
				});
			}
		}

		// Try DD/MM/YYYY format
		const parts = dateString.split('/');
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1;
			const year = parseInt(parts[2], 10);
			if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
				const date = new Date(year, month, day);
				if (!isNaN(date.getTime())) {
					return date.toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
						year: 'numeric',
					});
				}
			}
		}

		return 'Unknown';
	} catch {
		return 'Unknown';
	}
}

function formatMobileDate(dateString: string): string {
	try {
		let date: Date | null = null;
		if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
			date = new Date(dateString);
		} else {
			const parts = dateString.split('/');
			if (parts.length === 3) {
				const day = parseInt(parts[0], 10);
				const month = parseInt(parts[1], 10) - 1;
				const year = parseInt(parts[2], 10);
				date = new Date(year, month, day);
			}
		}

		if (date && !isNaN(date.getTime())) {
			const day = date.getDate().toString().padStart(2, '0');
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear().toString().slice(-2);
			return `${day}/${month}/${year}`;
		}
		return 'Unknown';
	} catch {
		return 'Unknown';
	}
}

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
		<span class="desktop-text">{game.status === 'Completed' && game.finishedDate ? formatDate(game.finishedDate) : 'Soon'}</span>
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
				<span class="score-label">SCORE</span> <span class="score-value">{game.score}</span>
			</span>
			<span class="mobile-text">
				<span class="score-label">SCORE</span><br/>
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
		gap: 6px;
		font-size: 0.875rem;
		color: var(--color-text-secondary);
		flex-shrink: 1;
		min-width: 0;
	}

	.time-item :global(svg) {
		width: 18px;
		height: 18px;
	}

	.date-item :global(svg) {
		width: 20px;
		height: 20px;
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
		gap: 8px;
	}

	.rating-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 4px;
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
		flex: 1;
		border-radius: 4px;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		transition: all var(--transition-normal);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.status-indicator :global(svg) {
		width: 18px;
		height: 18px;
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

	.score-label {
		font-size: 0.65rem;
		font-weight: 700;
		opacity: 0.9;
		letter-spacing: 0.05em;
	}

	.score-value {
		font-size: 1.05rem;
		font-weight: 900;
	}

	.ratings-and-score-wrapper {
		display: contents;
	}

	@container game-card (max-width: 200px) {
		.desktop-text {
			display: none !important;
		}

		.mobile-text {
			display: inline-block !important;
		}

		.time-item,
		.date-item {
			gap: 4px;
			font-size: 0.75rem;
		}

		.time-item :global(svg),
		.date-item :global(svg) {
			width: 14px;
			height: 14px;
		}

		.ratings-and-score-wrapper {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
			gap: 8px;
		}

		.ratings-compact {
			flex-direction: column;
			gap: 6px;
			align-items: flex-start;
			flex: 0 0 auto;
		}

		.rating-item {
			flex-direction: row;
			gap: 8px;
		}

		.rating-value {
			font-size: 1rem;
		}

		.rating-item :global(svg) {
			width: 20px;
			height: 20px;
		}

		.status-indicator {
			flex-direction: column;
			padding: 8px 6px;
			gap: 4px;
			text-align: center;
			flex: 0 0 auto;
			min-width: 60px;
		}

		.status-indicator :global(svg) {
			width: 24px;
			height: 24px;
		}

		.status-indicator .mobile-text {
			line-height: 1.1;
		}

		.score-label {
			font-size: 0.6rem;
		}

		.score-value {
			font-size: 1.0rem;
		}
	}
</style>

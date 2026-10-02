<script lang="ts">
import type { Game } from '$lib/types/game';
import { Presentation, NotebookPen, Gamepad2, Award } from '@lucide/svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const hasRatings = $derived(
	game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null
);
</script>

<div class="ratings-wrapper mt-6 md:mt-0 md:flex md:flex-1 md:flex-col">
	<div class="landscape-hidden-title mb-4 flex items-center gap-3 md:mb-4">
		<h3
			class="text-base font-bold tracking-[0.2em] uppercase md:text-lg"
			style="color: var(--color-text-tertiary);"
		>
			Ratings
		</h3>
		<div class="h-[1px] flex-1 opacity-50" style="background-color: var(--color-border);"></div>
	</div>

	<div class="ratings-container grid grid-cols-3 gap-2 md:gap-3">
		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Presentation</span
			>
			<Presentation size={32} class="rating-icon flex-shrink-0 text-rose-500" />
			<span class="rating-value text-xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingPresentation ?? '-'}</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Story</span
			>
			<NotebookPen size={32} class="rating-icon flex-shrink-0 text-sky-500" />
			<span class="rating-value text-xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingStory ?? '-'}</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Gameplay</span
			>
			<Gamepad2 size={32} class="rating-icon flex-shrink-0 text-emerald-500" />
			<span class="rating-value text-xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingGameplay ?? '-'}</span
			>
		</div>

		<div class="landscape-score hidden items-center gap-2">
			{#if game.status === 'Completed'}
				<span class="status-badge score-badge" class:opacity-40={game.score === null}>
					<Award size={18} />
					<span class="score-num">{game.score ?? '-'}</span>
				</span>
			{:else}
				<span class="status-badge {game.status === 'Playing' ? 'playing-badge' : 'planned-badge'}">
					{game.status === 'Playing' ? 'PLAYING' : 'PLANNED'}
				</span>
			{/if}
		</div>
	</div>

	<!-- The fixed height on .status-badge keeps this block the same size for every
	     status, so the Ratings row above never shifts when swiping between games. -->
	<div class="score-result mx-4 mt-2 md:mt-auto">
		{#if game.status === 'Completed'}
			<span class="status-badge score-badge" class:opacity-40={game.score === null}>
				<Award size={26} />
				<span class="score-num">{game.score ?? '-'}</span>
			</span>
		{:else}
			<span class="status-badge {game.status === 'Playing' ? 'playing-badge' : 'planned-badge'}">
				{game.status === 'Playing' ? 'PLAYING' : 'PLANNED'}
			</span>
		{/if}
	</div>
</div>

<style>
	/* Mirrors the grid card status badge (GameCardInfo.svelte) but spans the full
	   width with a fixed height, so every status occupies exactly the same box
	   regardless of how long its text is or which game is being swiped to. */
	.status-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		width: 100%;
		padding: 6px 16px;
		height: 3.5rem;
		border: 1px solid;
		border-radius: 8px;
		font-size: 1.125rem;
		font-weight: 800;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		line-height: 1;
		white-space: nowrap;
	}

	.score-badge {
		color: var(--color-status-score-text);
		background: var(--color-status-score-bg);
		border-color: var(--color-status-score-border);
	}

	.playing-badge {
		color: var(--color-status-playing-text);
		background: var(--color-status-playing-bg);
		border-color: var(--color-status-playing-border);
	}

	.planned-badge {
		color: var(--color-status-planned-text);
		background: var(--color-status-planned-bg);
		border-color: var(--color-status-planned-border);
	}

	.score-num {
		font-size: 1.875rem;
		font-weight: 900;
		line-height: 1;
	}

	@media (max-width: 767px) and (orientation: portrait) {
		.ratings-wrapper {
			margin-top: auto;
		}

		/* The badge is narrower on phones, so the score digit scales down to suit. */
		.score-num {
			font-size: 1.625rem;
		}

		:global(.score-badge svg) {
			width: 22px;
			height: 22px;
		}
	}

	@media (orientation: landscape) and (max-height: 1000px) and (max-width: 1200px) {
		.ratings-wrapper {
			margin-top: auto !important;
		}

		.landscape-hidden-title {
			display: none !important;
		}

		.ratings-container {
			display: flex !important;
			flex-direction: row !important;
			align-items: center !important;
			justify-content: space-between !important;
			gap: 1rem !important;
			margin-top: 1.5rem !important;
		}

		.rating-card {
			flex-direction: row !important;
			padding: 0.25rem 0.5rem !important;
			background: transparent !important;
			gap: 0.75rem !important;
		}

		:global(.rating-icon) {
			width: 28px !important;
			height: 28px !important;
		}

		.rating-value {
			font-size: 1.75rem !important;
		}

		.rating-label {
			display: none !important;
		}

		.score-result {
			display: none !important;
		}

		.landscape-score {
			display: flex !important;
			margin-left: auto !important;
			padding-left: 1.5rem !important;
			border-left: 1px solid var(--color-border);
			gap: 1.25rem !important;
		}

		.landscape-score .status-badge {
			font-size: 0.95rem !important;
			padding: 6px 12px !important;
			height: 2.5rem !important;
			width: auto !important;
			border-radius: 4px;
		}

		.landscape-score .score-num {
			font-size: 1.25rem !important;
		}
	}
</style>

<script lang="ts">
import type { Game } from '$lib/types/game';
import { Presentation, NotebookPen, Gamepad2 } from 'lucide-svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();

const hasRatings = $derived(
	game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null
);
</script>

<div class="ratings-wrapper mt-6 md:mt-10">
	<div class="landscape-hidden-title mb-4 flex items-center gap-3 md:mb-6">
		<h3
			class="text-base font-bold tracking-[0.2em] uppercase md:text-lg"
			style="color: var(--color-text-tertiary);"
		>
			Ratings
		</h3>
		<div class="h-[1px] flex-1 opacity-50" style="background-color: var(--color-border);"></div>
	</div>

	<div class="ratings-container grid grid-cols-3 gap-2 md:gap-4">
		<div
			class="rating-card flex flex-col items-center gap-4 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Presentation</span
			>
			<Presentation size={32} class="rating-icon flex-shrink-0 text-rose-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingPresentation ?? '-'}</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-4 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Story</span
			>
			<NotebookPen size={32} class="rating-icon flex-shrink-0 text-sky-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingStory ?? '-'}</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-4 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<span
				class="rating-label text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);">Gameplay</span
			>
			<Gamepad2 size={32} class="rating-icon flex-shrink-0 text-emerald-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingGameplay ?? '-'}</span
			>
		</div>

		<div class="landscape-score hidden items-center gap-2">
			<span class="text-2xl font-extrabold" style="color: var(--color-rating-total);">
				{game.score ?? '-'}
			</span>
		</div>
	</div>

	<div
		class="score-result mt-2 rounded-lg border p-2 md:mt-8"
		style="background-color: var(--color-surface-elevated); border-color: var(--color-border);"
		class:opacity-40={game.score === null}
	>
		<div class="flex flex-col items-center justify-center gap-1">
			<span
				class="text-base font-bold tracking-widest uppercase opacity-70 md:text-lg"
				style="color: var(--color-text-tertiary);">Score</span
			>
			<span class="text-3xl font-extrabold md:text-4xl" style="color: var(--color-rating-total);">
				{game.score ?? '-'}
			</span>
		</div>
	</div>
</div>

<style>
	@media (max-width: 767px) and (orientation: portrait) {
		.ratings-wrapper {
			margin-top: auto;
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
			gap: 1rem !important;
		}

		:global(.rating-icon) {
			width: 28px !important;
			height: 28px !important;
		}

		.rating-value {
			font-size: 2rem !important;
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

		.landscape-score span:first-child {
			font-size: 0.75rem !important;
			font-weight: 700 !important;
			letter-spacing: 0.05em !important;
			text-transform: uppercase !important;
			opacity: 0.7 !important;
		}

		.landscape-score span:last-child {
			font-size: 3rem !important;
			line-height: 1 !important;
		}
	}
</style>

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

<div class="ratings-wrapper mt-3 md:mt-4">
	<h3
		class="landscape-hidden-title mb-3 text-base font-semibold md:mb-6 md:text-xl"
		style="color: var(--color-text-primary);"
	>
		Ratings
	</h3>

	<div class="ratings-container mt-3 grid grid-cols-3 gap-3 md:gap-4">
		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<Presentation size={32} class="rating-icon flex-shrink-0 text-rose-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingPresentation ?? '-'}</span
			>
			<span
				class="rating-label text-xs font-semibold tracking-wider uppercase"
				style="color: var(--color-text-secondary);">Presentation</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<NotebookPen size={32} class="rating-icon flex-shrink-0 text-sky-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingStory ?? '-'}</span
			>
			<span
				class="rating-label text-xs font-semibold tracking-wider uppercase"
				style="color: var(--color-text-secondary);">Story</span
			>
		</div>

		<div
			class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			class:opacity-40={!hasRatings}
		>
			<Gamepad2 size={32} class="rating-icon flex-shrink-0 text-emerald-500" />
			<span class="rating-value text-2xl font-bold" style="color: var(--color-text-primary);"
				>{game.ratingGameplay ?? '-'}</span
			>
			<span
				class="rating-label text-xs font-semibold tracking-wider uppercase"
				style="color: var(--color-text-secondary);">Gameplay</span
			>
		</div>

		<!-- Moved score inside grid for landscape but hidden/absolute for normal -->
		<div class="landscape-score hidden items-center gap-2">
			<span class="text-xs font-bold uppercase" style="color: var(--color-text-secondary);"
				>Score</span
			>
			<span class="text-2xl font-extrabold" style="color: var(--color-rating-total);">
				{game.score ?? '-'}
			</span>
		</div>
	</div>

	<div
		class="score-result mt-6 rounded-lg border p-4 md:mt-8"
		style="background-color: var(--color-surface-elevated); border-color: var(--color-border);"
		class:opacity-40={game.score === null}
	>
		<div class="flex flex-col items-center justify-center gap-1">
			<span
				class="text-xs font-bold tracking-widest uppercase md:text-sm"
				style="color: var(--color-text-secondary);">Score</span
			>
			<span class="text-3xl font-extrabold md:text-4xl" style="color: var(--color-rating-total);">
				{game.score ?? '-'}
			</span>
		</div>
	</div>
</div>

<style>
	@media (orientation: landscape) and (max-height: 1000px) {
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
			gap: 0.5rem !important;
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
			display: none !important; /* Hide original score box */
		}

		.landscape-score {
			display: flex !important;
			margin-left: auto !important;
			padding-left: 1.5rem !important;
			border-left: 1px solid var(--color-border);
			gap: 0.75rem !important;
		}

		.landscape-score span:first-child {
			font-size: 0.9rem !important;
		}

		.landscape-score span:last-child {
			font-size: 3rem !important;
			line-height: 1 !important;
		}
	}
</style>

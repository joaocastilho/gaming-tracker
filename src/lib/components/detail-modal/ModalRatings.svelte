<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { Presentation, NotebookPen, Gamepad2, Award } from 'lucide-svelte';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();
</script>

{#if game.status === 'Completed' && game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null}
	<div class="mt-3 md:mt-4">
		<h3
			class="mb-3 text-base font-semibold md:mb-6 md:text-xl"
			style="color: var(--color-text-primary);"
		>
			Ratings
		</h3>

		<div class="mt-3 grid grid-cols-3 gap-3 md:gap-4">
			<div
				class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			>
				<Presentation size={32} class="flex-shrink-0 text-rose-500" />
				<span class="text-2xl font-bold" style="color: var(--color-text-primary);"
					>{game.ratingPresentation}</span
				>
				<span
					class="text-xs font-semibold tracking-wider uppercase"
					style="color: var(--color-text-secondary);">Presentation</span
				>
			</div>

			<div
				class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			>
				<NotebookPen size={32} class="flex-shrink-0 text-sky-500" />
				<span class="text-2xl font-bold" style="color: var(--color-text-primary);"
					>{game.ratingStory}</span
				>
				<span
					class="text-xs font-semibold tracking-wider uppercase"
					style="color: var(--color-text-secondary);">Story</span
				>
			</div>

			<div
				class="rating-card flex flex-col items-center gap-2 rounded-xl p-3 transition-transform duration-200"
			>
				<Gamepad2 size={32} class="flex-shrink-0 text-emerald-500" />
				<span class="text-2xl font-bold" style="color: var(--color-text-primary);"
					>{game.ratingGameplay}</span
				>
				<span
					class="text-xs font-semibold tracking-wider uppercase"
					style="color: var(--color-text-secondary);">Gameplay</span
				>
			</div>
		</div>

		{#if game.score !== null}
			<div
				class="score-result mt-6 rounded-lg border p-4 md:mt-8 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"
			>
				<div class="flex items-center justify-center gap-2">
					<Award size={24} class="text-yellow-500" />
					<span class="text-sm font-bold md:text-lg" style="color: var(--color-text-primary);">
						Score {game.score}
					</span>
				</div>
			</div>
		{/if}
	</div>
{:else}
	<div class="mt-3 md:mt-4">
		<h3
			class="mb-3 text-base font-semibold md:mb-6 md:text-xl"
			style="color: var(--color-text-primary);"
		>
			Ratings
		</h3>
		<div class="flex items-center justify-center rounded-lg border border-dashed py-8 opacity-60">
			<span style="color: var(--color-text-secondary);">No ratings available</span>
		</div>
	</div>
{/if}

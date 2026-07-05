<script lang="ts">
import type { Game } from '$lib/types/game';
import { getPlatformClasses, getGenreClasses } from '$lib/utils/colorConstants';
import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
import { formatDate } from '$lib/utils/dateUtils';
import { Users, Calendar, Flag, Clock } from '@lucide/svelte';

interface Props {
	game: Game;
}

let { game }: Props = $props();
</script>



<div class="mb-6 flex items-center justify-between md:mb-4">
	<div class="flex flex-wrap gap-2">
		<span
			class="badge rounded-md px-3 py-1.5 text-sm font-medium md:text-sm {getPlatformClasses(
				game.platform
			)}"
		>
			{game.platform}
		</span>
		<span
			class="badge rounded-md px-3 py-1.5 text-sm font-medium md:text-sm {getGenreClasses(
				game.genre
			)}"
		>
			{game.genre}
		</span>
		{#if game.coOp === 'Yes'}
			<div
				class="flex items-center justify-center rounded-md bg-blue-500/10 px-2 text-blue-500 dark:text-blue-400"
				title="Co-op Available"
			>
				<Users size={18} />
			</div>
		{/if}
	</div>

	{#if game.tier}
		<span
			class="tier-badge rounded-md px-3 py-1.5 text-sm font-semibold md:text-sm {getTierClass(
				game.tier
			)}"
		>
			{getTierDisplayName(game.tier)}
		</span>
	{/if}
</div>

<div class="metadata-grid mb-4 grid grid-cols-2 gap-4 md:mb-6 md:gap-4">
	<div class="metadata-item">
		<div
			class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
			style="color: var(--color-text-tertiary);"
		>
			Finished Date
		</div>
		<div
			class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
			style="color: var(--color-text-primary);"
		>
			<Flag size={16} class="landscape-icon hidden" />
			{game.finishedDate ? formatDate(game.finishedDate) : '-'}
		</div>
	</div>

	<div class="metadata-item flex flex-col items-end">
		<div
			class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
			style="color: var(--color-text-tertiary);"
		>
			Year
		</div>
		<div
			class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
			style="color: var(--color-text-primary);"
		>
			<Calendar size={16} class="landscape-icon hidden" />
			{game.year}
		</div>
	</div>

	{#if game.status === 'Completed'}
		<div class="metadata-item">
			<div
				class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);"
			>
				Hours Played
			</div>
			<div
				class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
				style="color: var(--color-text-primary);"
			>
				<Clock size={16} class="landscape-icon hidden" />
				{game.playtime}
			</div>
		</div>
	{:else}
		<div class="metadata-item">
			<div
				class="metadata-label mb-1.5 text-base font-bold tracking-wider uppercase opacity-70"
				style="color: var(--color-text-tertiary);"
			>
				Time to Beat
			</div>
			<div
				class="metadata-value flex items-center gap-2 text-base font-semibold md:text-lg"
				style="color: var(--color-text-primary);"
			>
				<Clock size={16} class="landscape-icon hidden" />
				{game.playtime || '-'}
			</div>
		</div>
	{/if}
</div>

<style>
	@media (orientation: landscape) and (max-height: 1000px) and (max-width: 1200px) {
		.metadata-grid {
			display: grid !important;
			grid-template-columns: repeat(3, 1fr) !important; /* 3 Columns: Year | Date | Time */
			gap: 1.5rem !important;
			margin-bottom: 2rem !important;
			align-items: start !important;
		}

		.metadata-item {
			display: block !important;
		}

		.metadata-label {
			display: block !important;
			margin-bottom: 0.5rem !important;
			font-size: 0.75rem !important;
			font-weight: 700 !important;
			letter-spacing: 0.05em !important;
			text-transform: uppercase !important;
			opacity: 0.7 !important;
		}

		.metadata-value {
			font-size: 1rem !important;
		}

		:global(.landscape-icon) {
			display: none !important;
		}

		.spacer-div {
			display: none !important;
		}
	}
</style>

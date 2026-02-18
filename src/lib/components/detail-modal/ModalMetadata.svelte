<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getPlatformClasses, getGenreClasses } from '$lib/utils/colorConstants';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import { Users, Calendar, Flag, Clock } from 'lucide-svelte';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Not completed';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return 'Invalid date';
		}
	}
</script>

<div class="mb-3 flex items-center justify-between md:mb-4">
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

<div class="metadata-grid mb-3 grid grid-cols-2 gap-3 md:mb-8">
	<div class="metadata-item">
		<div class="metadata-label mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
			Year Released
		</div>
		<div
			class="metadata-value flex items-center gap-2 text-base font-semibold md:text-base"
			style="color: var(--color-text-primary);"
		>
			<Calendar size={16} class="landscape-icon hidden" />
			{game.year}
		</div>
	</div>

	<!-- Keep first row second column empty for alignment as per screenshots -->
	<div class="spacer-div"></div>

	<div class="metadata-item">
		<div class="metadata-label mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
			Finished Date
		</div>
		<div
			class="metadata-value flex items-center gap-2 text-base font-semibold md:text-base"
			style="color: var(--color-text-primary);"
		>
			<Flag size={16} class="landscape-icon hidden" />
			{game.finishedDate ? formatDate(game.finishedDate) : '-'}
		</div>
	</div>

	{#if game.status === 'Completed'}
		<div class="metadata-item">
			<div
				class="metadata-label mb-1 text-sm md:text-sm"
				style="color: var(--color-text-tertiary);"
			>
				Hours Played
			</div>
			<div
				class="metadata-value flex items-center gap-2 text-base font-semibold md:text-base"
				style="color: var(--color-text-primary);"
			>
				<Clock size={16} class="landscape-icon hidden" />
				{game.playtime}
			</div>
		</div>
	{:else}
		<div class="metadata-item">
			<div
				class="metadata-label mb-1 text-sm md:text-sm"
				style="color: var(--color-text-tertiary);"
			>
				Time to Beat
			</div>
			<div
				class="metadata-value flex items-center gap-2 text-base font-semibold md:text-base"
				style="color: var(--color-text-primary);"
			>
				<Clock size={16} class="landscape-icon hidden" />
				{game.playtime || '-'}
			</div>
		</div>
	{/if}
</div>

<style>
	@media (orientation: landscape) and (max-height: 1000px) {
		.metadata-grid {
			display: grid !important;
			grid-template-columns: repeat(3, 1fr) !important; /* 3 Columns: Year | Date | Time */
			gap: 1.5rem !important;
			margin-bottom: 2rem !important;
			align-items: start !important;
		}

		.metadata-item {
			display: block !important; /* Stack vertical */
		}

		.metadata-label {
			display: block !important; /* Show Label */
			margin-bottom: 0.5rem !important;
			font-size: 0.875rem !important;
		}

		.metadata-value {
			font-size: 1rem !important; /* Restore normal size */
		}

		:global(.landscape-icon) {
			display: none !important; /* Hide Icon */
		}

		.spacer-div {
			display: none !important; /* Hide Spacer */
		}
	}
</style>

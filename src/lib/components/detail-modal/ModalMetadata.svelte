<script lang="ts">
	import type { Game } from '$lib/types/game';
	import { getPlatformClasses, getGenreClasses } from '$lib/utils/colorConstants';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import { Users } from 'lucide-svelte';

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

<div class="mb-3 grid grid-cols-2 gap-3 md:mb-8">
	<div>
		<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
			Year Released
		</div>
		<div class="text-base font-semibold md:text-base" style="color: var(--color-text-primary);">
			{game.year}
		</div>
	</div>

	<!-- Keep first row second column empty for alignment as per screenshots -->
	<div></div>

	<div>
		<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
			Finished Date
		</div>
		<div class="text-base font-semibold md:text-base" style="color: var(--color-text-primary);">
			{game.finishedDate ? formatDate(game.finishedDate) : '-'}
		</div>
	</div>

	{#if game.status === 'Completed'}
		<div>
			<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
				Hours Played
			</div>
			<div class="text-base font-semibold md:text-base" style="color: var(--color-text-primary);">
				{game.playtime}
			</div>
		</div>
	{:else}
		<div>
			<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
				Time to Beat
			</div>
			<div class="text-base font-semibold md:text-base" style="color: var(--color-text-primary);">
				{game.playtime || '-'}
			</div>
		</div>
	{/if}
</div>

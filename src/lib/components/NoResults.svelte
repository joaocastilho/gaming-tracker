<script lang="ts">
	interface Props {
		message?: string;
		description?: string;
		onReset?: () => void;
	}

	let {
		message = 'No games match your current filters',
		description = 'Try adjusting or clearing your filters to see more games.',
		onReset
	}: Props = $props();
</script>

<div class="no-results flex flex-col items-center justify-center gap-3 py-10 text-center">
	<h2 class="font-semibold">{message}</h2>
	<p class="text-gray-600 dark:text-gray-400">
		{description}
	</p>
	{#if onReset}
		<button
			class="reset-button bg-surface hover:bg-accent hover:text-accent-foreground flex h-[44px] w-[44px] items-center justify-center rounded-md transition-colors"
			type="button"
			onclick={onReset}
			aria-label="Reset filters"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
				<path d="M3 3v5h5" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.no-results {
		min-height: 200px;
	}
</style>

<script lang="ts">
	interface Props {
		message?: string;
		description?: string;
		onReset?: () => void;
	}

	let {
		message = 'No games match your filters',
		description = 'Try adjusting your selection or clearing all filters to see more results.',
		onReset
	}: Props = $props();
</script>

<div class="no-results-container flex w-full flex-col items-center justify-center px-4 py-16">
	<div class="empty-state-card animate-fade-in-up flex w-full max-w-md flex-col items-center gap-6">
		<div
			class="icon-wrapper bg-surface-elevated border-border flex items-center justify-center rounded-2xl border shadow-lg"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="var(--color-accent)"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="opacity-100"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="M16 16s-1.5-2-4-2-4 2-4 2" />
				<line x1="9" y1="9" x2="9.01" y2="9" />
				<line x1="15" y1="9" x2="15.01" y2="9" />
			</svg>
		</div>

		<div class="text-content space-y-3 text-center">
			<h2 class="message-title text-2xl font-bold tracking-tight">
				{message}
			</h2>
			<p class="description-text leading-relaxed font-medium">
				{description}
			</p>
		</div>

		{#if onReset}
			<button
				class="clear-filters-btn group hover:shadow-glow relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
				onclick={onReset}
				aria-label="Clear all filters"
			>
				<span class="relative z-10 flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
						<path d="M3 3v5h5" />
					</svg>
					Clear all filters
				</span>
				<div
					class="absolute inset-0 z-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100"
				></div>
			</button>
		{/if}
	</div>
</div>

<style>
	.no-results-container {
		min-height: 440px;
	}

	.empty-state-card {
		padding: 3rem 2.5rem;
		border-radius: 1.5rem;
		background: var(--glass-bg);
		backdrop-filter: var(--glass-backdrop);
		border: 1px solid var(--glass-border);
		box-shadow: var(--shadow-xl);
	}

	.icon-wrapper {
		width: 110px;
		height: 110px;
		background: radial-gradient(
			circle at center,
			rgba(var(--color-accent-rgb), 0.15) 0%,
			transparent 75%
		);
	}

	.animate-fade-in-up {
		animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.message-title {
		color: var(--color-text-primary);
	}

	.description-text {
		color: var(--color-text-secondary);
	}

	.clear-filters-btn {
		background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-hover) 100%);
		color: var(--color-accent-foreground);
	}
</style>

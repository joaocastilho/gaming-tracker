<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg' | 'xl';
		variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
		message?: string;
		fullscreen?: boolean;
		overlay?: boolean;
	}

	let {
		size = 'md',
		variant = 'spinner',
		message,
		fullscreen = false,
		overlay = false
	}: Props = $props();

	// Size mappings
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	};

	const dotSizeClasses = {
		sm: 'w-1 h-1',
		md: 'w-2 h-2',
		lg: 'w-3 h-3',
		xl: 'w-4 h-4'
	};

	const barSizeClasses = {
		sm: 'w-1 h-4',
		md: 'w-1.5 h-6',
		lg: 'w-2 h-8',
		xl: 'w-2.5 h-10'
	};
</script>

{#if fullscreen}
	<div class="loading-fullscreen" class:overlay>
		<div class="loading-container">
			{#if variant === 'spinner'}
				<div class="spinner {sizeClasses[size]}" aria-hidden="true"></div>
			{:else if variant === 'dots'}
				<div class="dots-container" aria-hidden="true">
					<div class="dot {dotSizeClasses[size]}"></div>
					<div class="dot {dotSizeClasses[size]}"></div>
					<div class="dot {dotSizeClasses[size]}"></div>
				</div>
			{:else if variant === 'pulse'}
				<div class="pulse {sizeClasses[size]}" aria-hidden="true"></div>
			{:else if variant === 'bars'}
				<div class="bars-container" aria-hidden="true">
					<div class="bar {barSizeClasses[size]}"></div>
					<div class="bar {barSizeClasses[size]}"></div>
					<div class="bar {barSizeClasses[size]}"></div>
					<div class="bar {barSizeClasses[size]}"></div>
				</div>
			{/if}
			{#if message}
				<p class="loading-message">{message}</p>
			{/if}
		</div>
	</div>
{:else}
	<div class="loading-inline">
		{#if variant === 'spinner'}
			<div class="spinner {sizeClasses[size]}" aria-hidden="true"></div>
		{:else if variant === 'dots'}
			<div class="dots-container" aria-hidden="true">
				<div class="dot {dotSizeClasses[size]}"></div>
				<div class="dot {dotSizeClasses[size]}"></div>
				<div class="dot {dotSizeClasses[size]}"></div>
			</div>
		{:else if variant === 'pulse'}
			<div class="pulse {sizeClasses[size]}" aria-hidden="true"></div>
		{:else if variant === 'bars'}
			<div class="bars-container" aria-hidden="true">
				<div class="bar {barSizeClasses[size]}"></div>
				<div class="bar {barSizeClasses[size]}"></div>
				<div class="bar {barSizeClasses[size]}"></div>
				<div class="bar {barSizeClasses[size]}"></div>
			</div>
		{/if}
		{#if message}
			<p class="loading-message">{message}</p>
		{/if}
	</div>
{/if}

<style>
	/* Fullscreen Loading */
	.loading-fullscreen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 9999;
		background-color: var(--color-background);
		transition: opacity 0.3s ease;
	}

	.loading-fullscreen.overlay {
		background-color: rgba(15, 20, 25, 0.8);
		backdrop-filter: blur(4px);
	}

	:global(.light) .loading-fullscreen:not(.overlay) {
		background-color: var(--color-background);
	}

	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	/* Inline Loading */
	.loading-inline {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	/* Spinner Animation */
	.spinner {
		border: 3px solid rgba(59, 130, 246, 0.2);
		border-top: 3px solid var(--color-accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Dots Animation */
	.dots-container {
		display: flex;
		gap: 0.25rem;
		align-items: center;
	}

	.dot {
		background-color: var(--color-accent);
		border-radius: 50%;
		animation: dots-bounce 1.4s ease-in-out infinite both;
	}

	.dot:nth-child(1) {
		animation-delay: -0.32s;
	}
	.dot:nth-child(2) {
		animation-delay: -0.16s;
	}
	.dot:nth-child(3) {
		animation-delay: 0s;
	}

	@keyframes dots-bounce {
		0%,
		80%,
		100% {
			transform: scale(0.8);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Pulse Animation */
	.pulse {
		background-color: var(--color-accent);
		border-radius: 50%;
		animation: pulse-glow 2s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	/* Bars Animation */
	.bars-container {
		display: flex;
		gap: 0.125rem;
		align-items: end;
	}

	.bar {
		background-color: var(--color-accent);
		border-radius: 1px;
		animation: bars-wave 1.2s ease-in-out infinite both;
	}

	.bar:nth-child(1) {
		animation-delay: -0.24s;
	}
	.bar:nth-child(2) {
		animation-delay: -0.12s;
	}
	.bar:nth-child(3) {
		animation-delay: 0s;
	}
	.bar:nth-child(4) {
		animation-delay: 0.12s;
	}

	@keyframes bars-wave {
		0%,
		40%,
		100% {
			transform: scaleY(0.4);
			opacity: 0.7;
		}
		20% {
			transform: scaleY(1);
			opacity: 1;
		}
	}

	/* Loading Message */
	.loading-message {
		color: var(--color-text-secondary);
		font-size: 0.875rem;
		font-weight: 500;
		text-align: center;
		margin: 0;
		animation: fade-in 0.3s ease-in;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.spinner,
		.dot,
		.pulse,
		.bar {
			animation: none;
		}

		.spinner {
			border-top-color: var(--color-accent);
			opacity: 0.7;
		}

		.dot {
			opacity: 1;
			transform: scale(1);
		}

		.pulse {
			opacity: 1;
			transform: scale(1);
		}

		.bar {
			transform: scaleY(1);
			opacity: 1;
		}
	}
</style>

<script lang="ts">
	import { page } from '$app/state';

	let status = $derived(page.status);
	let message = $derived(page.error?.message || 'Something went wrong');
</script>

<svelte:head>
	<title>Error {status} | Gaming Tracker</title>
</svelte:head>

<div class="error-page">
	<div class="error-container">
		<div class="error-code">{status}</div>
		<h1 class="error-title">{message}</h1>
		<p class="error-description">
			{#if status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else}
				An unexpected error occurred. Please try again later.
			{/if}
		</p>
		<a href="/" class="error-link">← Back to Home</a>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.error-container {
		text-align: center;
		max-width: 480px;
	}

	.error-code {
		font-size: 6rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-accent);
		opacity: 0.8;
		margin-bottom: 0.5rem;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin-bottom: 0.75rem;
	}

	.error-description {
		color: var(--color-text-secondary);
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.error-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.5rem;
		background: var(--color-accent);
		color: var(--color-accent-foreground);
		border-radius: 8px;
		font-weight: 500;
		text-decoration: none;
		transition: opacity var(--transition-fast);
	}

	.error-link:hover {
		opacity: 0.9;
	}
</style>

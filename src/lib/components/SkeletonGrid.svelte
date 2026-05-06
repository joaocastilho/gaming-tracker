<script lang="ts">
</script>

<div class="skeleton-grid">
	{#each Array(15) as _, i (i)}
		<div class="skeleton-card">
			<div class="skeleton-cover"></div>
			<div class="skeleton-info">
				<div class="skeleton-title"></div>
				<div class="skeleton-meta"></div>
				<div class="skeleton-score"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.skeleton-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(185px, 1fr));
		gap: clamp(0.75rem, 0.75rem + 2vw, 1.5rem);
		width: 100%;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		padding-bottom: 20px;
	}

	.skeleton-card {
		border-radius: 8px;
		background: var(--color-surface);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		box-shadow: var(--shadow-md);
	}

	.skeleton-cover {
		width: 100%;
		aspect-ratio: 2/3;
		background: var(--color-surface-elevated);
		opacity: 0.7;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.skeleton-info {
		padding: 12px 14px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		height: 220px;
	}

	.skeleton-title {
		height: 20px;
		width: 80%;
		background: var(--color-surface-elevated);
		border-radius: 4px;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.skeleton-meta {
		height: 14px;
		width: 60%;
		background: var(--color-surface-elevated);
		border-radius: 4px;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.skeleton-score {
		height: 28px;
		width: 100%;
		margin-top: auto;
		background: var(--color-surface-elevated);
		border-radius: 8px;
		opacity: 0.5;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 0.4;
		}
	}
</style>

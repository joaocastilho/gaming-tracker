<script lang="ts">
	interface Props {
		containerWidth: number;
	}

	let { containerWidth }: Props = $props();

	let columns = $derived(
		!containerWidth || containerWidth < 768 ? 2 : Math.max(1, Math.floor(containerWidth / 320))
	);

	let itemHeight = $derived(
		(() => {
			const containerPadding = 16;
			const gap = 12;
			const totalGapWidth = (columns - 1) * gap;
			const availableWidth = containerWidth - containerPadding - totalGapWidth;
			const columnWidth = availableWidth / columns;
			const coverHeight = columnWidth * 1.5;

			const infoRatio = 1.35;
			const infoHeight = Math.max(220, Math.min(260, columnWidth * infoRatio));

			return coverHeight + infoHeight;
		})()
	);
</script>

<div class="skeleton-grid">
	{#each Array(4) as _, i (i)}
		<div
			class="skeleton-row"
			style="height: {itemHeight}px; gap: clamp(0.5rem, 0.5rem + 2vw, 1.5rem);"
		>
			{#each Array(columns) as _, j (j)}
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
	{/each}
</div>

<style>
	.skeleton-grid {
		width: 100%;
		padding-bottom: 20px;
	}

	.skeleton-row {
		display: flex;
		width: 100%;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		margin-bottom: 1.25rem;
	}

	.skeleton-card {
		flex: 1;
		border-radius: 16px;
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
		padding: 16px;
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.skeleton-title {
		height: 24px;
		width: 80%;
		margin: 0 auto;
		background: var(--color-surface-elevated);
		border-radius: 4px;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.skeleton-meta {
		height: 16px;
		width: 60%;
		margin: 0 auto;
		background: var(--color-surface-elevated);
		border-radius: 4px;
		animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.skeleton-score {
		height: 32px;
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

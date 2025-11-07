<script lang="ts">
	interface Props {
		count?: number;
	}

	let { count = 1 }: Props = $props();
</script>

<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
{#each Array(count) as _, i (i)}
	<div class="game-card-skeleton">
		<!-- Cover Image Skeleton -->
		<div class="cover-skeleton">
			<div class="image-skeleton"></div>
		</div>

		<!-- Game Info Skeleton -->
		<div class="info-skeleton">
			<!-- Title Skeleton -->
			<div class="title-skeleton">
				<div class="title-line"></div>
				<div class="title-line short"></div>
			</div>

			<!-- Platform/Genre/Year Skeleton -->
			<div class="meta-skeleton">
				<div class="meta-line"></div>
				<div class="meta-line"></div>
			</div>

			<!-- Ratings Skeleton -->
			<div class="ratings-skeleton">
				<div class="rating-item-skeleton"></div>
				<div class="rating-item-skeleton"></div>
				<div class="rating-item-skeleton"></div>
			</div>

			<!-- Time/Date Skeleton -->
			<div class="time-date-skeleton">
				<div class="time-line"></div>
				<div class="date-line"></div>
			</div>
		</div>
	</div>
{/each}

<style>
	.game-card-skeleton {
		/* Layout */
		display: flex;
		flex-direction: column;
		width: 300px;
		border-radius: 6px;
		overflow: hidden;
		margin-top: 16px;

		/* Shadow */
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

		/* Background */
		background-color: var(--color-surface);
	}

	/* Cover Skeleton */
	.cover-skeleton {
		position: relative;
		width: 300px;
		height: 450px;
		margin: 0 auto;
		background: linear-gradient(135deg, #2a2d3a 0%, #1a1f27 100%);
	}

	:global(.light) .cover-skeleton {
		background: linear-gradient(135deg, #e5e7eb 0%, #f9fafb 100%);
	}

	.image-skeleton {
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, #2a2d3a 0%, #1a1f27 100%);
		animation-name: strongPulse;
		animation-duration: 1s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		animation-fill-mode: forwards;
		overflow: hidden;
		position: relative;
	}

	.image-skeleton::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		animation: shimmer 1.2s ease-in-out infinite;
	}

	:global(.light) .image-skeleton {
		background: linear-gradient(135deg, #ede3d3 0%, #f7f2eb 100%);
	}

	:global(.light) .image-skeleton::before {
		background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	/* Info Skeleton */
	.info-skeleton {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* Title Skeleton */
	.title-skeleton {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-height: 40px;
		justify-content: center;
	}

	.title-line {
		height: 1.2rem;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		border-radius: 2px;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.1s;
	}

	:global(.light) .title-line {
		background: linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%);
	}

	.title-line.short {
		width: 60%;
		animation-delay: 0.2s;
	}

	/* Meta Skeleton */
	.meta-skeleton {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.meta-line {
		height: 0.875rem;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		border-radius: 2px;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.3s;
		width: 80%;
	}

	:global(.light) .meta-line {
		background: linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%);
	}

	.meta-line:nth-child(2) {
		width: 60%;
		animation-delay: 0.4s;
	}

	/* Ratings Skeleton */
	.ratings-skeleton {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 5px;
		margin-bottom: 5px;
	}

	.rating-item-skeleton {
		display: flex;
		align-items: center;
		gap: 8px;
		height: 1.25rem;
		flex: 1;
		justify-content: center;
	}

	.rating-item-skeleton::before {
		content: '';
		width: 20px;
		height: 20px;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		border-radius: 50%;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.5s;
	}

	:global(.light) .rating-item-skeleton::before {
		background: linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%);
	}

	.rating-item-skeleton::after {
		content: '';
		width: 24px;
		height: 1rem;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		border-radius: 2px;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.6s;
	}

	:global(.light) .rating-item-skeleton::after {
		background: linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%);
	}

	/* Time/Date Skeleton */
	.time-date-skeleton {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		height: 0.8rem;
	}

	.time-line,
	.date-line {
		height: 0.8rem;
		background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
		border-radius: 2px;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.7s;
	}

	:global(.light) .time-line,
	:global(.light) .date-line {
		background: linear-gradient(135deg, #d1d5db 0%, #f3f4f6 100%);
	}

	.time-line {
		width: 60px;
	}

	.date-line {
		width: 50px;
		animation-delay: 0.8s;
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.image-skeleton,
		.image-skeleton::before,
		.title-line,
		.meta-line,
		.rating-item-skeleton::before,
		.rating-item-skeleton::after,
		.time-line,
		.date-line {
			animation: none;
			opacity: 0.7;
		}
	}
</style>

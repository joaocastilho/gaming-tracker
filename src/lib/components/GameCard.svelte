<script lang="ts">
	import { modalStore } from '../stores/modal.js';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS, TIER_COLORS, getTierDisplayName } from '../utils/colorConstants.js';
	import { Presentation, NotebookPen, Award, Gamepad2, Timer, CalendarDays } from 'lucide-svelte';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	// Image loading state
	let isImageLoaded = $state(false);
	let hasImageError = $state(false);

	// Calculate total score for completed games
	let totalScore = $derived(
		game.status === 'Completed' &&
			game.ratingPresentation !== null &&
			game.ratingStory !== null &&
			game.ratingGameplay !== null
			? Math.round(((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2)
			: null
	);

	// Extract parenthetical content from title for subtitle display
	let titleParts = $derived(() => {
		const match = game.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
		if (match) {
			return {
				mainTitle: match[1].trim(),
				subtitle: `(${match[2]})`
			};
		}
		return {
			mainTitle: game.title,
			subtitle: null
		};
	});



	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	// Handle image load success
	function handleImageLoad() {
		isImageLoaded = true;
		hasImageError = false;
	}

	// Handle image load error
	function handleImageError() {
		isImageLoaded = false;
		hasImageError = true;
	}

	// Handle keyboard interaction for accessibility
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			modalStore.openViewModal(game);
		}
	}
</script>

<button
	class="game-card"
	style="background-color: var(--color-surface); color: var(--color-text-primary);"
	onclick={() => modalStore.openViewModal(game)}
	onkeydown={handleKeyDown}
	aria-label="View details for {game.title}"
>
	<!-- Cover Image Container -->
	<div class="cover-container">
		{#if !isImageLoaded && !hasImageError}
			<div class="image-placeholder"></div>
		{/if}
		<img
			src="/{game.coverImage}"
			alt="{game.title} cover"
			class="cover-image"
			class:loaded={isImageLoaded}
			class:error={hasImageError}
			loading="lazy"
			onload={handleImageLoad}
			onerror={handleImageError}
		/>

		<!-- Badges on Cover -->
		{#if game.coOp === 'Yes'}
			<div class="co-op-badge">
				<span class="co-op-icon" aria-hidden="true" title="Co-op game">👥</span>
				<span class="co-op-text">Co-op</span>
			</div>
		{/if}

		{#if game.status === 'Completed' && game.tier}
			<div class="tier-badge {TIER_COLORS[getTierDisplayName(game.tier)] || 'bg-gray-600 text-white'}">
				{getTierDisplayName(game.tier)}
			</div>
		{/if}
	</div>

	<!-- Game Info -->
	<div class="game-info">
		<!-- Title with subtitle (if exists) -->
		<div class="title-section">
			<h3 class="game-title">
				{titleParts().mainTitle}
				{#if titleParts().subtitle}
					<br>
					<span class="game-subtitle">{titleParts().subtitle}</span>
				{/if}
			</h3>
		</div>

		<!-- Platform/Genre left, Year right (always shown) -->
		<div class="platform-genre-year-section">
			<div class="first-line">
				<span class="platform-badge {PLATFORM_COLORS[game.platform] || 'bg-gray-600 text-white'}">
					{game.platform}
				</span>
				<span class="game-year">{game.year}</span>
			</div>
			<div class="second-line">
				<span class="genre-badge {GENRE_COLORS[game.genre] || 'bg-gray-600 text-white'}">
					{game.genre}
				</span>
				<div class="total-score">
					<span class="rating-icon" aria-label="Total score">🏆</span>
					<span class="rating-score">{totalScore ?? '-'}</span>
				</div>
			</div>
		</div>

		<!-- Ratings Section (always present) -->
		<div class="ratings-section">
			<div class="rating-item">
				<Presentation class="rating-icon text-cyan-500" aria-label="Presentation rating" size={20} />
				<span class="rating-score">{game.ratingPresentation ?? '-'}</span>
			</div>
			<div class="rating-item">
				<NotebookPen class="rating-icon text-orange-500" aria-label="Story rating" size={20} />
				<span class="rating-score">{game.ratingStory ?? '-'}</span>
			</div>
			<div class="rating-item">
				<Gamepad2 class="rating-icon text-pink-500" aria-label="Gameplay rating" size={20} />
				<span class="rating-score">{game.ratingGameplay ?? '-'}</span>
			</div>
		</div>

		<!-- Time/Date Section (always present) -->
		<div class="time-date-section">
			<div class="time-item">
				<Timer class="time-icon" aria-label="Time played / Time to beat" size={20} />
				<span class="time-text">{game.status === 'Completed' ? (game.hoursPlayed ?? 'N/A') : (game.timeToBeat ?? 'N/A')}</span>
			</div>
			<div class="date-item">
				<CalendarDays class="date-icon" aria-label="Completion date" size={20} />
				<span class="date-text">{game.finishedDate ? formatDate(game.finishedDate) : 'Soon'}</span>
			</div>
		</div>
	</div>
</button>

<style>
	.game-card {
		/* Layout */
		display: flex;
		flex-direction: column;
		width: 260px;
		border-radius: 6px;
		overflow: hidden;
		margin-top: 16px;

		/* Shadow */
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

		/* Transitions */
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		/* Hover effect */
		cursor: pointer;
	}

	.game-card:hover,
	.game-card:focus {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}

	/* Cover Container */
	.cover-container {
		position: relative;
		width: 260px;
		height: 400px;
		margin: 0 auto;
	}

	/* Image Placeholder */
	.image-placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #2a2d3a 0%, #1a1f27 100%);
		animation: pulse 1.5s ease-in-out infinite;
	}

	:global(.light) .image-placeholder {
		background: linear-gradient(135deg, #e5e7eb 0%, #f9fafb 100%);
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.7;
		}
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.cover-image.loaded {
		opacity: 1;
	}

	.cover-image.error {
		display: none;
	}

	/* Co-op Badge */
	.co-op-badge {
		position: absolute;
		top: 8px;
		left: 8px;
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: 4px;
		background-color: rgba(59, 130, 246, 0.9);
		color: white;
		font-size: 0.7rem;
		font-weight: 500;
		backdrop-filter: blur(4px);
	}

	.co-op-icon {
		font-size: 0.8rem;
	}

	/* Tier Badge */
	.tier-badge {
		position: absolute;
		top: 8px;
		right: 8px;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		min-width: 24px;
		text-align: center;
		backdrop-filter: blur(4px);
	}

	/* Game Info */
	.game-info {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* Title Section */
	.title-section {
		margin-bottom: 2px;
		min-height: 2.4rem; /* 2 lines at 1.2 line-height */
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.game-title {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		word-wrap: break-word;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-align: center;
		width: 100%;
	}

	.game-subtitle {
		font-size: 0.85rem;
		font-weight: 600;
		color: #8b92a8;
		line-height: 1.2;
	}

	:global(.light) .game-subtitle {
		color: #6b7280;
	}

	/* Platform/Genre/Year Section */
	.platform-genre-year-section {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.first-line,
	.second-line {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.game-year {
		font-size: 0.9rem;
		color: #8b92a8;
		flex-shrink: 0;
		white-space: nowrap;
	}

	:global(.light) .game-year {
		color: #6b7280;
	}

	/* Badges Section */
	.badges-section {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.platform-badge,
	.genre-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Ratings Section */
	.ratings-section {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-top: 5px;
		margin-bottom: 5px;
	}

	.rating-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.85rem;
		color: #8b92a8;
		min-width: 0;
		flex: 1;
		justify-content: center;
	}

	:global(.light) .rating-item {
		color: #6b7280;
	}

	.rating-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
	}

	.rating-score {
		font-weight: 700;
		font-size: 1rem;
	}

	.total-score {
		display: flex;
		align-items: center;
		font-weight: 700;
		color: #ffffff;
		font-size: 0.9rem;
		gap: 4px;
	}

	.total-score .rating-icon {
		font-size: 1.1rem;
	}

	.total-score .rating-score {
		font-size: 1.2rem;
	}

	:global(.light) .total-score {
		color: #1a1a1a;
	}

	/* Time/Date Section */
	.time-date-section {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		font-size: 0.8rem;
		color: #8b92a8;
	}

	:global(.light) .time-date-section {
		color: #6b7280;
	}

	.time-item,
	.date-item {
		display: flex;
		gap: 6px;
	}

	.time-icon {
		font-size: 0.8rem;
	}

	.date-icon {
		font-size: 0.7rem;
	}

	.time-text,
	.date-text {
		font-weight: 500;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.game-title {
			font-size: 0.9rem;
		}

		.game-year {
			font-size: 0.75rem;
		}

		.ratings-section {
			gap: 6px;
		}

		.rating-item {
			font-size: 0.7rem;
		}

		.time-date-section {
			font-size: 0.7rem;
		}
	}

	@media (max-width: 480px) {
		.game-info {
			padding: 8px;
		}

		.title-section {
			min-height: 2.04rem; /* Adjusted for smaller font size */
		}

		.game-title {
			font-size: 0.85rem;
		}

		.platform-genre-year-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}

		.badges-section {
			gap: 4px;
		}

		.platform-badge,
		.genre-badge {
			font-size: 0.65rem;
			padding: 3px 6px;
		}

		.ratings-section {
			flex-direction: column;
			gap: 4px;
		}

		.rating-item {
			font-size: 0.65rem;
			justify-content: flex-start;
		}

		.time-date-section {
			flex-direction: column;
			align-items: flex-start;
			gap: 2px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.game-card {
			transition: none;
		}

		.game-card:hover {
			transform: none;
		}
	}
</style>

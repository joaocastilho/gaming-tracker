<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from '../types/game.js';

	interface Props {
		game: Game;
	}

	let { game }: Props = $props();

	// Lazy loading state
	let isImageLoaded = $state(false);
	let hasImageError = $state(false);
	let imgElement: HTMLImageElement | undefined;

	// Calculate total score for completed games
	let totalScore = $derived(
		game.status === 'Completed' &&
			game.ratingPresentation !== null &&
			game.ratingStory !== null &&
			game.ratingGameplay !== null
			? Math.round(((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2)
			: null
	);

	// Badge color mappings
	const platformColors: Record<string, string> = {
		PC: 'bg-[#1e3a5f] text-[#60a5fa]',
		PS5: 'bg-[#1e293b] text-[#38bdf8]',
		Xbox: 'bg-[#14532d] text-[#4ade80]',
		Switch: 'bg-[#7c2d12] text-[#fb923c]'
	};

	const genreColors: Record<string, string> = {
		'Action RPG': 'bg-[#2d1f3f] text-[#c084fc]',
		'Story Adventure': 'bg-[#422006] text-[#fbbf24]',
		'Action Adventure': 'bg-[#164e63] text-[#22d3ee]',
		Puzzle: 'bg-[#3f1f4d] text-[#e879f9]',
		Metroidvania: 'bg-[#4c1d95] text-[#a78bfa]',
		RPG: 'bg-[#7c2d12] text-[#fb923c]',
		Action: 'bg-[#dc2626] text-[#fca5a5]',
		Adventure: 'bg-[#16a34a] text-[#86efac]',
		Indie: 'bg-[#ca8a04] text-[#fde047]',
		Strategy: 'bg-[#7c3aed] text-[#c4b5fd]',
		Simulation: 'bg-[#0891b2] text-[#67e8f9]',
		Sports: 'bg-[#be123c] text-[#f9a8d4]',
		Racing: 'bg-[#b91c1c] text-[#fecaca]',
		Shooter: 'bg-[#991b1b] text-[#fca5a5]',
		Platformer: 'bg-[#c2410c] text-[#fdba74]',
		Horror: 'bg-[#581c87] text-[#d8b4fe]',
		'Visual Novel': 'bg-[#be185d] text-[#f9a8d4]',
		JRPG: 'bg-[#7c2d12] text-[#fb923c]',
		'Western RPG': 'bg-[#92400e] text-[#fed7aa]',
		Roguelike: 'bg-[#7f1d1d] text-[#fecaca]',
		'Battle Royale': 'bg-[#dc2626] text-[#fca5a5]',
		MOBA: 'bg-[#7c2d12] text-[#fb923c]',
		MMORPG: 'bg-[#5b21b6] text-[#c4b5fd]',
		'Card Game': 'bg-[#15803d] text-[#86efac]',
		Music: 'bg-[#7c3aed] text-[#c4b5fd]',
		Party: 'bg-[#ea580c] text-[#fed7aa]',
		'Board Game': 'bg-[#059669] text-[#a7f3d0]',
		Trivia: 'bg-[#0891b2] text-[#67e8f9]',
		Word: 'bg-[#7c3aed] text-[#c4b5fd]',
		Casual: 'bg-[#16a34a] text-[#86efac]',
		Arcade: 'bg-[#dc2626] text-[#fca5a5]',
		Pinball: 'bg-[#b91c1c] text-[#fecaca]',
		'Flight Simulator': 'bg-[#0891b2] text-[#67e8f9]',
		'Space Simulator': 'bg-[#1e40af] text-[#93c5fd]',
		'Life Simulator': 'bg-[#059669] text-[#a7f3d0]',
		'Vehicle Simulator': 'bg-[#dc2626] text-[#fca5a5]',
		'City Builder': 'bg-[#7c2d12] text-[#fb923c]',
		'God Game': 'bg-[#5b21b6] text-[#c4b5fd]',
		'Tower Defense': 'bg-[#16a34a] text-[#86efac]',
		RTS: 'bg-[#92400e] text-[#fed7aa]',
		'Turn-Based Strategy': 'bg-[#7c3aed] text-[#c4b5fd]',
		'4X': 'bg-[#dc2626] text-[#fca5a5]',
		Wargame: 'bg-[#b91c1c] text-[#fecaca]',
		Management: 'bg-[#0891b2] text-[#67e8f9]',
		Tycoon: 'bg-[#16a34a] text-[#86efac]',
		Farming: 'bg-[#15803d] text-[#86efac]',
		'Dating Sim': 'bg-[#be185d] text-[#f9a8d4]',
		Romance: 'bg-[#dc2626] text-[#fca5a5]',
		Comedy: 'bg-[#ea580c] text-[#fed7aa]',
		Drama: 'bg-[#7c2d12] text-[#fb923c]',
		Mystery: 'bg-[#581c87] text-[#d8b4fe]',
		Thriller: 'bg-[#7f1d1d] text-[#fecaca]',
		'Sci-Fi': 'bg-[#1e40af] text-[#93c5fd]',
		Fantasy: 'bg-[#7c3aed] text-[#c4b5fd]',
		Historical: 'bg-[#92400e] text-[#fed7aa]',
		'Alternate History': 'bg-[#b91c1c] text-[#fecaca]',
		Cyberpunk: 'bg-[#0891b2] text-[#67e8f9]',
		'Post-Apocalyptic': 'bg-[#dc2626] text-[#fca5a5]',
		Steampunk: 'bg-[#7c2d12] text-[#fb923c]',
		Medieval: 'bg-[#16a34a] text-[#86efac]',
		Modern: 'bg-[#059669] text-[#a7f3d0]',
		Future: 'bg-[#1e40af] text-[#93c5fd]',
		Space: 'bg-[#581c87] text-[#d8b4fe]',
		Underwater: 'bg-[#0891b2] text-[#67e8f9]',
		'Wild West': 'bg-[#92400e] text-[#fed7aa]',
		Superhero: 'bg-[#dc2626] text-[#fca5a5]',
		Anime: 'bg-[#be185d] text-[#f9a8d4]',
		Cartoon: 'bg-[#ea580c] text-[#fed7aa]',
		Realistic: 'bg-[#059669] text-[#a7f3d0]',
		Stylized: 'bg-[#7c3aed] text-[#c4b5fd]',
		'Pixel Art': 'bg-[#16a34a] text-[#86efac]',
		'3D': 'bg-[#0891b2] text-[#67e8f9]',
		'2.5D': 'bg-[#7c2d12] text-[#fb923c]',
		Isometric: 'bg-[#5b21b6] text-[#c4b5fd]',
		'Top-Down': 'bg-[#15803d] text-[#86efac]',
		'Side-Scroll': 'bg-[#dc2626] text-[#fca5a5]',
		'First-Person': 'bg-[#b91c1c] text-[#fecaca]',
		'Third-Person': 'bg-[#ea580c] text-[#fed7aa]',
		VR: 'bg-[#0891b2] text-[#67e8f9]',
		'Co-op': 'bg-[#16a34a] text-[#86efac]',
		Multiplayer: 'bg-[#7c2d12] text-[#fb923c]',
		'Single Player': 'bg-[#059669] text-[#a7f3d0]',
		Online: 'bg-[#1e40af] text-[#93c5fd]',
		Local: 'bg-[#92400e] text-[#fed7aa]',
		Competitive: 'bg-[#dc2626] text-[#fca5a5]',
		Cooperative: 'bg-[#15803d] text-[#86efac]',
		PvP: 'bg-[#b91c1c] text-[#fecaca]',
		PvE: 'bg-[#16a34a] text-[#86efac]'
	};

	const tierColors: Record<string, string> = {
		S: 'bg-[#dc2626] text-white',
		A: 'bg-[#f97316] text-white',
		B: 'bg-[#eab308] text-black',
		C: 'bg-[#22c55e] text-white',
		D: 'bg-[#06b6d4] text-white',
		E: 'bg-[#6b7280] text-white'
	};

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

	// Setup Intersection Observer for lazy loading
	onMount(() => {
		if (!imgElement) return;

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const img = entry.target as HTMLImageElement;
						img.src = img.dataset.src || '';
						observer.unobserve(img);
					}
				});
			},
			{
				rootMargin: '50px'
			}
		);

		observer.observe(imgElement);

		return () => {
			observer.disconnect();
		};
	});
</script>

<article class="game-card">
	<!-- Cover Image Container -->
	<div class="cover-container">
		{#if !isImageLoaded && !hasImageError}
			<div class="image-placeholder"></div>
		{/if}
		<img
			bind:this={imgElement}
			data-src="/{game.coverImage}"
			alt="{game.title} cover"
			class="cover-image"
			class:loaded={isImageLoaded}
			class:error={hasImageError}
			onload={handleImageLoad}
			onerror={handleImageError}
		/>

		<!-- Badges on Cover -->
		{#if game.coOp === 'Yes'}
			<div class="co-op-badge">
				<span class="co-op-icon" aria-hidden="true">👥</span>
				<span class="co-op-text">Co-op</span>
			</div>
		{/if}

		{#if game.status === 'Completed' && game.tier}
			<div class="tier-badge {tierColors[game.tier]}">
				{game.tier}
			</div>
		{/if}
	</div>

	<!-- Game Info -->
	<div class="game-info">
		<!-- Title and Year -->
		<div class="title-section">
			<h3 class="game-title">{game.title}</h3>
			<span class="game-year">{game.year}</span>
		</div>

		<!-- Platform and Genre Badges -->
		<div class="badges-section">
			<span class="platform-badge {platformColors[game.platform] || 'bg-gray-600 text-white'}">
				{game.platform}
			</span>
			<span class="genre-badge {genreColors[game.genre] || 'bg-gray-600 text-white'}">
				{game.genre}
			</span>
		</div>

		<!-- Ratings Section (Completed games only) -->
		{#if game.status === 'Completed' && game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null}
			<div class="ratings-section">
				<div class="rating-item">
					<span class="rating-icon" aria-hidden="true">👁️</span>
					<span class="rating-score">{game.ratingPresentation}/10</span>
				</div>
				<div class="rating-item">
					<span class="rating-icon" aria-hidden="true">✏️</span>
					<span class="rating-score">{game.ratingStory}/10</span>
				</div>
				<div class="rating-item">
					<span class="rating-icon" aria-hidden="true">🎮</span>
					<span class="rating-score">{game.ratingGameplay}/10</span>
				</div>
				<div class="rating-item total-score">
					<span class="rating-icon" aria-hidden="true">🏆</span>
					<span class="rating-score">{totalScore}/20</span>
				</div>
			</div>
		{/if}

		<!-- Time/Date Section (Completed games only) -->
		{#if game.status === 'Completed' && game.hoursPlayed && game.finishedDate}
			<div class="time-date-section">
				<div class="time-item">
					<span class="time-icon" aria-hidden="true">⏱️</span>
					<span class="time-text">{game.hoursPlayed}</span>
				</div>
				<div class="date-item">
					<span class="date-icon" aria-hidden="true">✓</span>
					<span class="date-text">{formatDate(game.finishedDate)}</span>
				</div>
			</div>
		{/if}
	</div>
</article>

<style>
	.game-card {
		/* Layout */
		display: flex;
		flex-direction: column;
		width: 100%;
		border-radius: 12px;
		overflow: hidden;

		/* Dark mode colors */
		background-color: #1a1f27;
		color: #ffffff;

		/* Shadow */
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);

		/* Transitions */
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		/* Hover effect */
		cursor: pointer;
	}

	.game-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}

	/* Light mode */
	:global(.light) .game-card {
		background-color: #ffffff;
		color: #1a1a1a;
	}

	/* Cover Container */
	.cover-container {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 3;
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
		gap: 8px;
	}

	/* Title Section */
	.title-section {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 8px;
	}

	.game-title {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		flex: 1;
		min-width: 0;
		word-wrap: break-word;
	}

	.game-year {
		font-size: 0.8rem;
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
		font-size: 0.7rem;
		font-weight: 500;
		white-space: nowrap;
	}

	/* Ratings Section */
	.ratings-section {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.rating-item {
		display: flex;
		align-items: center;
		gap: 2px;
		font-size: 0.75rem;
		color: #8b92a8;
	}

	:global(.light) .rating-item {
		color: #6b7280;
	}

	.rating-icon {
		font-size: 0.8rem;
	}

	.rating-score {
		font-weight: 500;
	}

	.total-score {
		font-weight: 600;
		color: #ffffff;
	}

	:global(.light) .total-score {
		color: #1a1a1a;
	}

	/* Time/Date Section */
	.time-date-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: #8b92a8;
	}

	:global(.light) .time-date-section {
		color: #6b7280;
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.time-icon,
	.date-icon {
		font-size: 0.8rem;
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

		.game-title {
			font-size: 0.85rem;
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

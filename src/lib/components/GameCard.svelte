<script lang="ts">
	import { onMount } from 'svelte';
	import { modalStore } from '../stores/modal.js';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS, getTierDisplayName } from '../utils/colorConstants.js';
	import { getTierClass } from '../utils/tierUtils.js';
	import { imageCache } from '../utils/imageCache.js';
	import { browser } from '$app/environment';
	import { generateSrcset, generateTinySrcset, generateSizes } from '../utils/imageSrcset.js';
	import {
		Award,
		Presentation,
		NotebookPen,
		Gamepad2,
		Timer,
		CalendarDays,
		Users
	} from 'lucide-svelte';

	interface Props {
		game: Game;
		size?: 'small' | 'large' | 'tiny';
		showTierBadge?: boolean;
		isAboveFold?: boolean;
	}

	let { game, size = 'small', showTierBadge = true, isAboveFold = false }: Props = $props();

	const imageSrcset = $derived(() => {
		if (size === 'tiny') {
			return generateTinySrcset(game.coverImage);
		}
		return generateSrcset(game.coverImage);
	});

	const imageSizes = $derived(() => {
		if (size === 'tiny') {
			return generateSizes('tiny');
		}
		return generateSizes(isAboveFold ? 'card' : 'gallery');
	});

	const imageEntry = $derived.by(() => imageCache.getImage(game.coverImage));

	let isImageLoaded = $derived(imageEntry.isLoaded);
	let hasImageError = $derived(imageEntry.hasError);
	let isActive = $derived(isAboveFold || isImageLoaded);
	let imageElement = $state<HTMLImageElement>();

	let totalScore = $derived(
		game.status === 'Completed' &&
			game.ratingPresentation !== null &&
			game.ratingStory !== null &&
			game.ratingGameplay !== null
			? Math.round(((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2)
			: null
	);

	// Dynamic font size calculation for title
	let titleFontSize = $derived(() => {
		const title = game.mainTitle || game.title || '';
		const baseSize = 1.25;
		const minSize = 0.65;
		const maxLength = 25;

		if (!title || title.length <= maxLength) {
			return baseSize;
		}

		const reduction = Math.min((title.length - maxLength) * 0.015, baseSize - minSize);
		return Math.max(baseSize - reduction, minSize);
	});

	let subtitleFontSize = $derived(() => {
		const title = game.subtitle || '';
		const baseSize = 0.95;
		const minSize = 0.55;
		const maxLength = 25;

		if (!title || title.length <= maxLength) {
			return baseSize;
		}

		const reduction = Math.min((title.length - maxLength) * 0.015, baseSize - minSize);
		return Math.max(baseSize - reduction, minSize);
	});

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	}

	function handleImageLoad() {
		imageCache.setLoaded(game.coverImage);
	}

	function handleImageError() {
		imageCache.setError(game.coverImage);
	}

	// Handle keyboard interaction for accessibility
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			modalStore.openViewModal(game);
		}
	}

	function preloadDetailImage() {
		const detailImageSrc = game.coverImage.replace('.webp', '-detail.webp');
		imageCache.preload(detailImageSrc);
	}

	$effect(() => {
		if (!browser || !imageElement || isAboveFold) return;

		const element = imageElement;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						isActive = true;

						if (imageCache.isImageCached(game.coverImage)) {
							isImageLoaded = true;
						}

						if (element) {
							observer.unobserve(element);
						}
						break;
					}
				}
			},
			{
				rootMargin: '150px',
				threshold: 0.15
			}
		);

		if (element) {
			observer.observe(element);
		}

		return () => {
			observer.disconnect();
		};
	});

	// If the image is loaded *eagerly* and is *already in the cache*,
	// we need to bypass the 'onload' event which may not fire.
	onMount(() => {
		if (isAboveFold && imageElement?.complete) {
			if (imageElement.naturalWidth > 0) {
				handleImageLoad();
			} else {
				handleImageError();
			}
		}
	});
</script>

<button
	class="game-card"
	style="background-color: var(--color-surface); color: var(--color-text-primary); --card-width: {size ===
	'large'
		? '250px'
		: size === 'tiny'
			? '200px'
			: '300px'}; --cover-height: {size === 'large'
		? '375px'
		: size === 'tiny'
			? '300px'
			: '450px'};"
	onclick={() => modalStore.openViewModal(game)}
	onkeydown={handleKeyDown}
	onmouseover={preloadDetailImage}
	onfocus={preloadDetailImage}
	aria-label="View details for {game.title}"
>
	<div class="cover-container">
		{#if !isImageLoaded && !hasImageError}
			<div class="image-placeholder"></div>
		{/if}
		<img
			bind:this={imageElement}
			src={size === 'tiny' ? game.coverImage.replace('.webp', '-200w.webp') : game.coverImage}
			srcset={isActive ? imageSrcset() : undefined}
			sizes={isActive ? imageSizes() : undefined}
			alt=""
			class="cover-image"
			class:loaded={isImageLoaded}
			class:error={hasImageError}
			loading={isAboveFold ? 'eager' : 'lazy'}
			fetchpriority={isAboveFold ? 'high' : 'low'}
			decoding="async"
			onload={handleImageLoad}
			onerror={handleImageError}
		/>

		{#if game.coOp === 'Yes'}
			<div class="co-op-badge">
				<Users class="co-op-icon" aria-hidden="true" size={14} />
				<span class="co-op-text">Co-op</span>
			</div>
		{/if}

		{#if showTierBadge && game.status === 'Completed' && game.tier}
			<div class="tier-badge {getTierClass(game.tier)}">
				<span class="tier-text">{getTierDisplayName(game.tier)}</span>
			</div>
		{/if}
	</div>

	<div class="game-info">
		<div class="title-section">
			<h3 class="game-title" style="font-size: {titleFontSize()}rem;">
				{game.mainTitle}
				{#if game.subtitle}
					<br />
					<span class="game-subtitle" style="font-size: {subtitleFontSize()}rem;"
						>{game.subtitle}</span
					>
				{/if}
			</h3>
		</div>

		{#if size === 'small'}
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
						<Award class="rating-icon text-yellow-400" aria-label="Total score" />
						<span class="rating-score">{totalScore ?? '-'}</span>
					</div>
				</div>
			</div>

			<div class="ratings-section">
				<div class="rating-item">
					<Presentation
						class="rating-icon text-cyan-500"
						aria-label="Presentation rating"
						size={20}
					/>
					<span class="rating-score">{game.ratingPresentation ?? '-'}</span>
				</div>
				<div class="rating-item">
					<NotebookPen class="rating-icon text-amber-600" aria-label="Story rating" size={20} />
					<span class="rating-score">{game.ratingStory ?? '-'}</span>
				</div>
				<div class="rating-item">
					<Gamepad2 class="rating-icon text-pink-500" aria-label="Gameplay rating" size={20} />
					<span class="rating-score">{game.ratingGameplay ?? '-'}</span>
				</div>
			</div>

			<div class="time-date-section">
				<div class="time-item">
					<Timer class="time-icon" aria-label="Time played / Time to beat" size={20} />
					<span class="time-text"
						>{game.status === 'Completed'
							? (game.hoursPlayed ?? 'N/A')
							: (game.timeToBeat ?? 'N/A')}</span
					>
				</div>
				<div class="date-item">
					<CalendarDays class="date-icon" aria-label="Completion date" size={20} />
					<span class="date-text">{game.finishedDate ? formatDate(game.finishedDate) : 'Soon'}</span
					>
				</div>
			</div>
		{/if}
	</div>
</button>

<style>
	.game-card {
		display: flex;
		flex-direction: column;
		width: var(--card-width, 300px);
		border-radius: 6px;
		overflow: hidden;
		margin-top: 8px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
		cursor: pointer;
	}

	.game-card:hover,
	.game-card:focus {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
	}

	.cover-container {
		position: relative;
		width: var(--card-width, 300px);
		height: var(--cover-height, 450px);
		margin: 0 auto;
	}

	.image-placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #2a2d3a 0%, #1a1f27 100%);
		animation-name: strongPulse;
		animation-duration: 1.5s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		animation-fill-mode: forwards;
		overflow: hidden;
	}

	.image-placeholder::before {
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
		animation: shimmer 2s ease-in-out infinite;
	}

	:global(.light) .image-placeholder {
		background: linear-gradient(135deg, #ede3d3 0%, #f7f2eb 100%);
	}

	:global(.light) .image-placeholder::before {
		background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
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

	.tier-badge {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		align-items: center;
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 600;
		backdrop-filter: blur(4px);
		min-width: 24px;
		justify-content: center;
	}

	.tier-text {
		font-size: 0.9rem;
		font-weight: 700;
	}

	.game-info {
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.title-section {
		margin-bottom: 2px;
		min-height: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}

	.game-title {
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		word-wrap: break-word;
		height: 45px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 100%;
	}

	.game-subtitle {
		font-weight: 500;
		color: #8b92a8;
		line-height: 1.2;
	}

	:global(.light) .game-subtitle {
		color: #6b7280;
	}

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

	.total-score .rating-score {
		font-size: 1.2rem;
	}

	:global(.light) .total-score {
		color: #1a1a1a;
	}

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

	@media (max-width: 768px) {
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
			min-height: 1rem;
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

	@media (prefers-reduced-motion: reduce) {
		.game-card {
			transition: none;
		}

		.game-card:hover {
			transform: none;
		}
	}
</style>

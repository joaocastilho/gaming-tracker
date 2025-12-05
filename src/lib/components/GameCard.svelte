<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS } from '../utils/colorConstants.js';
	import { getTierClass, getTierDisplayName } from '../utils/tierUtils.js';
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
		size?: 'small' | 'large' | 'tiny' | 'tierlist';
		showTierBadge?: boolean;
		isAboveFold?: boolean;
		isPriority?: boolean;
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
	}

	let {
		game,
		size = 'small',
		showTierBadge = true,
		isAboveFold = false,
		isPriority = false,
		displayedGames = [],
		onOpenModal
	}: Props = $props();

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

	let imageElement = $state<HTMLImageElement>();
	let isVisible = $state(true);

	let totalScore = $derived(game.score);

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null;
	let cachedFont: string = '';

	function getFont(node: HTMLElement) {
		if (cachedFont) return cachedFont;
		if (typeof getComputedStyle === 'undefined') return '600 1rem sans-serif';
		const style = getComputedStyle(node);
		cachedFont = `600 1rem ${style.fontFamily}`;
		return cachedFont;
	}

	function getTextWidth(text: string, font: string): number {
		if (typeof document === 'undefined') return 0;
		if (!canvas) {
			canvas = document.createElement('canvas');
			context = canvas.getContext('2d');
		}
		if (context) {
			context.font = font;
			return context.measureText(text).width;
		}
		return 0;
	}

	function fitTitle(node: HTMLElement, params: { title: string; subtitle?: string }) {
		if (size === 'tierlist') return;

		let currentParams = params;

		const resizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				adjustTitleSize(node, !!currentParams.subtitle, entry.contentRect.width);
			}
		});
		resizeObserver.observe(node);

		return {
			update(newParams: { title: string; subtitle?: string }) {
				currentParams = newParams;
				adjustTitleSize(node, !!newParams.subtitle);
			},
			destroy() {
				resizeObserver.disconnect();
			}
		};
	}

	function adjustTitleSize(node: HTMLElement, hasSubtitle: boolean, width?: number) {
		if (typeof window !== 'undefined' && window.innerWidth <= 768) {
			node.style.whiteSpace = '';
			node.style.fontSize = '';
			return;
		}

		const minSize = 0.75;
		const maxSize = 1.25;
		const singleLineMinSize = 0.85;

		const containerWidth = width ?? node.clientWidth;
		if (containerWidth === 0) return;

		const text = node.textContent || '';
		const font = getFont(node);
		const textWidthAt1Rem = getTextWidth(text, font);

		if (!hasSubtitle) {
			let newSize = containerWidth / textWidthAt1Rem;
			if (newSize > maxSize) newSize = maxSize;

			if (newSize >= singleLineMinSize) {
				node.style.whiteSpace = 'nowrap';
				node.style.fontSize = `${newSize}rem`;
				return;
			}
		}

		node.style.whiteSpace = 'normal';
		let newSize = (1.9 * containerWidth) / textWidthAt1Rem;

		if (newSize > maxSize) newSize = maxSize;
		if (newSize < minSize) newSize = minSize;

		node.style.fontSize = `${newSize}rem`;
	}

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
		if (imageElement) {
			imageElement.classList.add('loaded');
			const skeleton = imageElement.previousElementSibling as HTMLElement;
			if (skeleton && skeleton.classList.contains('skeleton-loader')) {
				skeleton.style.opacity = '0';
			}
		}
	}

	function handleImageError() {
		if (imageElement) {
			imageElement.classList.add('loaded');
			const skeleton = imageElement.previousElementSibling as HTMLElement;
			if (skeleton && skeleton.classList.contains('skeleton-loader')) {
				skeleton.style.opacity = '0';
			}
		}
	}

	function handleCardClick() {
		if (onOpenModal) {
			onOpenModal(game, displayedGames);
		} else {
			modalStore.openViewModal(game, displayedGames);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	function preloadDetailImage() {
		if (game.coverImage) {
			const detailImg = new Image();
			detailImg.src = game.coverImage.replace('.webp', '-detail.webp');
		}
	}

	function isValidKeyboardAction(event: KeyboardEvent): boolean {
		return event.key === 'Enter' || event.key === ' ';
	}

	function handlePlatformClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.togglePlatform(game.platform);
	}

	function handleGenreClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleGenre(game.genre);
	}

	function handleCoOpClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleCoOp('Yes');
	}

	function handleTierClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		if (game.tier) {
			filtersStore.toggleTier(game.tier);
		}
	}

	$effect(() => {
		if (!imageElement) return;

		queueMicrotask(() => {
			if (imageElement && imageElement.complete && imageElement.naturalHeight !== 0) {
				handleImageLoad();
			}
		});
	});
</script>

<div
	class="game-card {size === 'tierlist' ? 'tierlist-size' : ''}"
	style="background-color: {game.status === 'Completed'
		? 'var(--color-surface-completed)'
		: 'var(--color-surface)'}; color: var(--color-text-primary);"
	role="button"
	tabindex="0"
	onclick={handleCardClick}
	onkeydown={handleKeyDown}
	onmouseover={preloadDetailImage}
	onfocus={preloadDetailImage}
	aria-label="View details for {game.title}"
>
	<div class="cover-container">
		<div class="image-wrapper">
			<div class="skeleton-loader"></div>
			<img
				bind:this={imageElement}
				src={size === 'tiny' ? game.coverImage.replace('.webp', '-200w.webp') : game.coverImage}
				srcset={imageSrcset()}
				sizes={imageSizes()}
				alt=""
				class="cover-image"
				class:visible={isVisible}
				loading={isPriority ? 'eager' : 'lazy'}
				fetchpriority={isPriority ? 'high' : undefined}
				decoding="async"
				onload={handleImageLoad}
				onerror={handleImageError}
			/>
		</div>

		{#if showTierBadge && game.status === 'Completed' && game.tier}
			<button
				class="tier-badge {getTierClass(game.tier)}"
				onclick={handleTierClick}
				onkeydown={handleTierClick}
				aria-label="Filter by Tier {game.tier}"
			>
				<span class="tier-text">{getTierDisplayName(game.tier)}</span>
			</button>
		{/if}
	</div>

	<div class="game-info">
		<div class="title-section">
			<h3
				class="game-title"
				use:fitTitle={{ title: game.mainTitle || game.title, subtitle: game.subtitle }}
			>
				{game.mainTitle || game.title}
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
					<button
						class="platform-badge {PLATFORM_COLORS[game.platform] || 'bg-gray-600 text-white'}"
						onclick={handlePlatformClick}
						onkeydown={handlePlatformClick}
						aria-label="Filter by {game.platform}"
					>
						{game.platform}
					</button>
					<span class="game-year">{game.year}</span>
				</div>
				<div class="second-line">
					<div class="flex items-center gap-2">
						<button
							class="genre-badge {GENRE_COLORS[game.genre] || 'bg-gray-600 text-white'}"
							onclick={handleGenreClick}
							onkeydown={handleGenreClick}
							aria-label="Filter by {game.genre}"
						>
							{game.genre}
						</button>
						{#if game.coOp === 'Yes'}
							<button
								class="coop-badge"
								onclick={handleCoOpClick}
								onkeydown={handleCoOpClick}
								aria-label="Filter by Co-op"
							>
								<Users size={16} class="text-blue-400" aria-label="Co-op available" />
							</button>
						{/if}
					</div>
					<div class="total-score">
						<Award class="rating-icon text-yellow-400" aria-label="Total score" />
						<span class="rating-score">{totalScore ?? '-'}</span>
					</div>
				</div>
			</div>

			<div class="ratings-section">
				<div class="rating-item">
					<Presentation
						class="rating-icon text-rose-500"
						aria-label="Presentation rating"
						size={20}
					/>
					<span class="rating-score">{game.ratingPresentation ?? '-'}</span>
				</div>
				<div class="rating-item">
					<NotebookPen class="rating-icon text-sky-500" aria-label="Story rating" size={20} />
					<span class="rating-score">{game.ratingStory ?? '-'}</span>
				</div>
				<div class="rating-item">
					<Gamepad2 class="rating-icon text-emerald-500" aria-label="Gameplay rating" size={20} />
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
</div>

<style>
	.game-card.tierlist-size {
		width: 200px;
		--cover-height: 300px;
	}

	.game-card {
		display: flex;
		flex-direction: column;
		width: 100%;
		border-radius: 6px;
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.3s ease-in-out,
			box-shadow 0.3s ease-in-out;
		cursor: pointer;
		height: 100%;
		border: none;
		padding: 0;
		text-align: left;
	}

	.game-card:hover,
	.game-card:focus-visible {
		transform: translateY(-2px) scale(1.01);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
		outline: none;
	}

	.cover-container {
		position: relative;
		width: 100%;
		aspect-ratio: 2 / 3;
		margin: 0 auto;
	}

	.image-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
		border-radius: 6px 6px 0 0;
	}

	.skeleton-loader {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-surface) 0%,
			var(--color-surface) 25%,
			#4a4a4a 50%,
			var(--color-surface) 75%,
			var(--color-surface) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 3s ease-in-out infinite;
		z-index: 1;
		opacity: 0.6;
		transition: opacity 0.5s ease-in-out;
	}

	:global(.light) .skeleton-loader {
		background: linear-gradient(
			90deg,
			#f8f9fa 0%,
			#f8f9fa 25%,
			#d1d5db 50%,
			#f8f9fa 75%,
			#f8f9fa 100%
		);
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: relative;
		z-index: 2;
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
		filter: blur(2px);
	}

	.cover-image.loaded {
		opacity: 1;
		filter: blur(0px);
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
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
		z-index: 10;
		max-width: calc(100% - 16px);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		border: none;
		cursor: pointer;
		transition: transform 0.2s;
	}

	.tier-badge:hover {
		transform: scale(1.1);
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
		flex: 1;
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
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		word-wrap: break-word;
		height: 50px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 100%;
		overflow: hidden;
	}

	.game-card.tierlist-size .game-title {
		font-size: 1rem;
	}

	.game-subtitle {
		font-weight: 500;
		color: #8b92a8;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
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
		border: none;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.platform-badge:hover,
	.genre-badge:hover,
	.coop-badge:hover {
		opacity: 0.8;
	}

	.coop-badge {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: opacity 0.2s;
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
		margin-top: auto;
	}

	:global(.light) .time-date-section {
		color: #6b7280;
	}

	.time-item,
	.date-item {
		display: flex;
		gap: 5px;
		align-items: flex-end;
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
		line-height: 1.1;
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
			font-size: 0.75rem;
		}
	}

	@media (max-width: 768px) {
		.game-card.tierlist-size {
			width: 100%;
			--cover-height: auto;
		}

		.game-title {
			font-size: 0.9rem;
		}

		.game-subtitle {
			font-size: 0.75rem !important;
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
			gap: 8px;
			justify-content: space-between;
		}

		.rating-item {
			font-size: 0.65rem;
			justify-content: flex-start;
			flex: 0 1 auto;
		}

		.time-date-section {
			gap: 4px;
			font-size: 0.7rem;
		}

		.tier-badge {
			padding: 2px 6px;
			min-width: 20px;
			top: 4px;
			right: 4px;
		}

		.tier-text {
			font-size: 0.75rem;
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

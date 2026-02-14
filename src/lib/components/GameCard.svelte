<script module>
	let canvasSingleton: HTMLCanvasElement;
	let contextSingleton: CanvasRenderingContext2D | null;
</script>

<script lang="ts">
	import { modalStore } from '$lib/stores/modal.svelte';
	import { filtersStore } from '$lib/stores/filters.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { offlineStore } from '$lib/stores/offline.svelte';
	import type { Game } from '../types/game.js';
	import { getPlatformClasses, getGenreClasses } from '../utils/colorConstants.js';
	import { getTierClass, getTierDisplayName } from '../utils/tierUtils.js';
	import { generateSrcset, generateTinySrcset, generateSizes } from '../utils/imageSrcset.js';
	import {
		Award,
		Presentation,
		NotebookPen,
		Gamepad2,
		Timer,
		CalendarDays,
		Users,
		Pencil,
		Trash2
	} from 'lucide-svelte';

	interface Props {
		game: Game;
		size?: 'small' | 'large' | 'tiny' | 'tierlist';
		showTierBadge?: boolean;
		isAboveFold?: boolean;
		isPriority?: boolean;
		displayedGames?: Game[];
		onOpenModal?: (game: Game, displayedGames: Game[]) => void;
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let {
		game,
		size = 'small',
		showTierBadge = true,
		isAboveFold = false,
		isPriority = false,
		displayedGames = [],
		onOpenModal,
		onEditGame,
		onDeleteGame
	}: Props = $props();

	let isEditor = $derived(editorStore.editorMode);
	let isOffline = $derived(!offlineStore.isOnline);

	// Placeholder constants
	const PLACEHOLDER_SRC = 'covers/placeholder_cover.webp';
	const PLACEHOLDER_SRCSET =
		'covers/placeholder_cover.webp 300w, covers/placeholder_cover-detail.webp 400w';
	const OFFLINE_FALLBACK_DATA_URI =
		'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

	const effectiveImageSrc = $derived(() => {
		if (isOffline) {
			return OFFLINE_FALLBACK_DATA_URI;
		}
		if (size === 'tiny') {
			return (game.coverImage || PLACEHOLDER_SRC).replace('.webp', '-200w.webp');
		}
		return game.coverImage || PLACEHOLDER_SRC;
	});

	const effectiveImageSrcset = $derived(() => {
		if (isOffline) {
			return '';
		}
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
		if (!canvasSingleton) {
			canvasSingleton = document.createElement('canvas');
			contextSingleton = canvasSingleton.getContext('2d');
		}
		if (contextSingleton) {
			contextSingleton.font = font;
			return contextSingleton.measureText(text).width;
		}
		return 0;
	}

	function fitTitle(node: HTMLElement, params: { title: string; subtitle?: string }) {
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

		const isTierList = size === 'tierlist';
		const minSize = isTierList ? 0.65 : 0.85;
		const maxSize = isTierList ? 1.05 : 1.4;
		const singleLineMinSize = isTierList ? 0.9 : 1.1;

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
		const baseSize = 0.85;
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

			if (!imageElement.src.includes('placeholder_cover')) {
				imageElement.src = PLACEHOLDER_SRC;
				imageElement.srcset = PLACEHOLDER_SRCSET;
			} else {
				imageElement.src =
					'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
				imageElement.srcset = '';
			}
		}
	}

	let cardElement = $state<HTMLDivElement>();

	function handleCardClick() {
		const rect = cardElement?.getBoundingClientRect();
		const cardRect = rect
			? {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
				}
			: undefined;

		if (onOpenModal) {
			onOpenModal(game, displayedGames);
		} else {
			modalStore.openViewModal(game, displayedGames, undefined, cardRect);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	function preloadDetailImage() {
		const imgPath = game.coverImage || 'covers/placeholder_cover.webp';
		const detailImg = new Image();
		detailImg.src = imgPath.replace('.webp', '-detail.webp');
	}

	function isValidKeyboardAction(event: KeyboardEvent): boolean {
		return event.key === 'Enter' || event.key === ' ';
	}

	function handlePlatformClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.togglePlatform(game.platform);
	}

	function handleGenreClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleGenre(game.genre);
	}

	function handleCoOpClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !isValidKeyboardAction(event)) {
			return;
		}
		filtersStore.toggleCoOp('Yes');
	}

	function handleTierClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
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
	bind:this={cardElement}
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
				src={effectiveImageSrc()}
				srcset={effectiveImageSrcset()}
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
				title="Tier: {getTierDisplayName(game.tier)}"
			>
				<span class="tier-text">{getTierDisplayName(game.tier)}</span>
			</button>
		{/if}

		{#if isEditor}
			<div class="editor-controls">
				<button
					type="button"
					class="editor-control-btn edit-btn"
					onclick={(e) => {
						e.stopPropagation();
						onEditGame?.(game);
					}}
					title="Edit game"
					aria-label="Edit {game.title}"
				>
					<Pencil size={16} />
				</button>
				<button
					type="button"
					class="editor-control-btn delete-btn"
					onclick={(e) => {
						e.stopPropagation();
						onDeleteGame?.(game);
					}}
					title="Delete game"
					aria-label="Delete {game.title}"
				>
					<Trash2 size={16} />
				</button>
			</div>
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
			<!-- Metadata Section - Single row with left/right alignment -->
			<div class="metadata-row">
				<div class="badges-left">
					<button
						class="badge platform-badge {getPlatformClasses(game.platform)}"
						onclick={handlePlatformClick}
						onkeydown={handlePlatformClick}
						aria-label="Filter by {game.platform}"
						title="Platform: {game.platform}"
					>
						{game.platform}
					</button>
					<button
						class="badge genre-badge {getGenreClasses(game.genre)}"
						onclick={handleGenreClick}
						onkeydown={handleGenreClick}
						aria-label="Filter by {game.genre}"
						title="Genre: {game.genre}"
					>
						{game.genre}
					</button>
				</div>
				<div class="year-right">
					<span class="game-year">{game.year}</span>
					{#if game.coOp === 'Yes'}
						<button
							class="coop-badge"
							onclick={handleCoOpClick}
							onkeydown={handleCoOpClick}
							aria-label="Filter by Co-op"
							title="Co-op Available"
						>
							<Users size={16} class="text-blue-500" />
						</button>
					{/if}
				</div>
			</div>

			<!-- Time and Date Section - Common position for both types -->
			<div class="time-date-row">
				<div
					class="time-item"
					title={game.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}
				>
					<Timer size={16} />
					<span>{game.playtime ?? 'N/A'}</span>
				</div>
				<div
					class="date-item"
					title={game.status === 'Completed' ? 'Completed On' : 'Expected Completion'}
				>
					<CalendarDays size={16} />
					<span
						>{game.status === 'Completed' && game.finishedDate
							? formatDate(game.finishedDate)
							: 'Soon'}</span
					>
				</div>
			</div>

			<!-- Ratings Section - Compact horizontal layout -->
			{#if game.status === 'Completed' && game.ratingPresentation !== null && game.ratingStory !== null && game.ratingGameplay !== null}
				<div class="ratings-compact">
					<div class="rating-item" title="Presentation: {game.ratingPresentation}/10">
						<Presentation size={28} class="text-rose-500" />
						<span class="rating-value">{game.ratingPresentation}</span>
					</div>
					<div class="rating-item" title="Story: {game.ratingStory}/10">
						<NotebookPen size={28} class="text-sky-500" />
						<span class="rating-value">{game.ratingStory}</span>
					</div>
					<div class="rating-item" title="Gameplay: {game.ratingGameplay}/10">
						<Gamepad2 size={28} class="text-emerald-500" />
						<span class="rating-value">{game.ratingGameplay}</span>
					</div>
				</div>
			{:else}
				<div class="ratings-placeholder">
					<span>Ratings after completion</span>
				</div>
			{/if}

			<!-- Total Score Section -->
			{#if game.status === 'Completed' && game.score !== null}
				<div class="total-score-badge">
					<Award size={16} class="text-amber-500" />
					<span>TOTAL: {game.score}/20</span>
				</div>
			{:else}
				<div class="planned-indicator">
					<span>PLANNED</span>
				</div>
			{/if}
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
		min-width: 280px;
		border-radius: 16px;
		overflow: hidden;
		background: var(--color-surface);
		border: 0px;
		box-shadow: var(--shadow-md);
		transition: all var(--transition-normal);
		cursor: pointer;
		padding: 0;
		text-align: left;
		contain: layout style paint;
	}

	.game-card:hover,
	.game-card:focus-visible {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
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
		border-radius: 12px 12px 0 0;
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
			var(--color-surface-elevated) 25%,
			var(--color-border-subtle) 50%,
			var(--color-surface-elevated) 75%,
			var(--color-surface) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s ease-in-out infinite;
		z-index: 1;
		opacity: 0.7;
		transition: opacity var(--transition-normal);
	}

	:global(.light) .skeleton-loader {
		background: linear-gradient(
			90deg,
			var(--color-surface) 0%,
			var(--color-surface-elevated) 25%,
			var(--color-border) 50%,
			var(--color-surface-elevated) 75%,
			var(--color-surface) 100%
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
		top: 10px;
		right: 10px;
		display: flex;
		align-items: center;
		padding: 6px 12px;
		border-radius: 8px;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		min-width: 32px;
		justify-content: center;
		z-index: 10;
		max-width: calc(100% - 20px);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.tier-badge:hover {
		transform: translateY(-2px) scale(1.05);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
	}

	.tier-text {
		font-size: 0.85rem;
		font-weight: 700;
	}

	.game-info {
		padding: 16px 16px 0px 16px;
		display: flex;
		flex-direction: column;
		gap: 15px;
		flex: 0 0 auto;
	}

	.title-section {
		margin-bottom: 0;
		min-height: 52px;
		max-height: 52px;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		overflow: hidden;
	}

	.game-title {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.2;
		word-wrap: break-word;
		display: flex;
		flex-direction: column;
		justify-content: center;
		text-align: center;
		width: 100%;
		overflow: hidden;
		color: var(--color-text-primary);
	}

	.game-subtitle {
		font-weight: 500;
		color: var(--color-text-secondary);
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		width: 100%;
		font-size: 0.75rem;
	}

	/* Metadata Section - Single row layout */
	.metadata-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.badges-left {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: flex-start;
		flex: 1;
	}

	.year-right {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.85rem;
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.game-year {
		font-weight: 500;
	}

	/* Badge Styles */
	.badge {
		font-size: 0.75rem;
		font-weight: 500;
		padding: 4px 10px;
		border-radius: 6px;
		white-space: nowrap;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: 1px solid transparent;
		max-width: 140px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.badge:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
	}

	/* Co-op Badge */
	.coop-badge {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: opacity 0.2s;
	}

	/* Total Score Badge - No box background */
	.total-score-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-weight: 800;
		font-size: 1rem;
		color: var(--color-rating-total);
		padding: 8px 0 4px 0;
		margin-top: 4px;
		border-top: 1px dashed var(--color-border);
	}

	/* Planned Indicator - Simple text, no box */
	.planned-indicator {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		padding: 12px 0;
		margin-top: auto;
	}

	/* Time and Date Row */
	.time-date-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.9rem;
		color: var(--color-text-secondary);
		padding: 0;
	}

	.time-date-row.completed {
		padding-top: 8px;
		margin-top: 4px;
	}

	.time-item,
	.date-item {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	/* Compact Ratings - Horizontal layout */
	.ratings-compact {
		display: flex;
		justify-content: space-around;
		gap: 8px;
		padding: 12px 4px 8px 4px;
		margin-top: auto;
		flex: 1;
	}

	.rating-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: 8px;
		flex: 1;
		transition: transform var(--transition-fast);
	}

	.rating-item:hover {
		transform: translateY(-2px);
	}

	.rating-value-container {
		display: flex;
		align-items: baseline;
		justify-content: center;
	}

	.rating-value {
		font-size: 2rem;
		font-weight: 800;
		line-height: 1;
		color: var(--color-text-primary);
	}

	.rating-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.ratings-placeholder {
		text-align: center;
		padding: 0;
		font-size: 0.75rem;
		color: var(--color-text-muted);
		font-style: italic;
	}

	/* Legacy styles for compatibility */
	.ratings-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
	}

	.rating-row {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}

	.rating-label {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.rating-bar-container {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.progress-bar {
		flex: 1;
		height: 5px;
		background: var(--color-border);
		border-radius: 3px;
		overflow: hidden;
	}

	.progress-bar-fill.high {
		background: linear-gradient(90deg, #22c55e, #4ade80);
	}

	.progress-bar-fill.medium {
		background: linear-gradient(90deg, #eab308, #facc15);
	}

	.progress-bar-fill.low {
		background: linear-gradient(90deg, #f97316, #fb923c);
	}

	.progress-bar-fill.very-low {
		background: linear-gradient(90deg, #ef4444, #f87171);
	}

	.progress-bar-fill-empty {
		background: var(--color-border);
	}

	.rating-value {
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--color-text-primary);
		min-width: 20px;
		text-align: right;
	}

	/* Editor Controls */
	.editor-controls {
		position: absolute;
		bottom: 12px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 10px;
		opacity: 0;
		transition: all var(--transition-normal);
		z-index: 20;
	}

	.game-card:hover .editor-controls,
	.game-card:focus-within .editor-controls {
		opacity: 1;
	}

	.editor-control-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: all var(--transition-fast);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.edit-btn {
		background: rgba(99, 102, 241, 0.2);
		color: #a5b4fc;
	}

	.edit-btn:hover {
		background: rgba(99, 102, 241, 0.4);
		color: #ffffff;
		transform: scale(1.1);
		box-shadow: 0 0 12px rgba(99, 102, 241, 0.4);
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.2);
		color: #fca5a5;
	}

	.delete-btn:hover {
		background: rgba(239, 68, 68, 0.4);
		color: #ffffff;
		transform: scale(1.1);
		box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
	}

	/* Responsive Styles */
	@media (max-width: 768px) {
		.game-card {
			min-width: auto;
		}

		.game-card.tierlist-size {
			width: 100%;
			--cover-height: auto;
		}

		.title-section {
			min-height: 40px;
			max-height: 40px;
		}

		.game-title {
			font-size: 0.95rem;
			line-height: 1.15;
		}

		.game-subtitle {
			font-size: 0.7rem !important;
		}

		.game-info {
			padding: 12px 12px 0px 12px;
			gap: 8px;
		}

		.metadata-row {
			gap: 6px;
		}

		.badges-left {
			gap: 4px;
		}

		.year-right {
			font-size: 0.8rem;
			gap: 4px;
		}

		.tier-badge {
			padding: 5px 10px;
			font-size: 0.75rem;
		}

		.tier-text {
			font-size: 0.85rem;
		}

		.badge {
			font-size: 0.7rem;
			padding: 3px 8px;
			max-width: 120px;
		}

		.total-score-badge {
			padding: 8px 12px;
			font-size: 0.85rem;
		}

		.planned-indicator {
			font-size: 0.8rem;
		}

		.ratings-compact {
			padding: 0;
			gap: 3px;
		}

		.rating-mini {
			gap: 5px;
		}

		.mini-rating-value {
			font-size: 0.75rem;
		}

		.ratings-placeholder {
			padding: 0;
			font-size: 0.75rem;
		}

		.time-date-row {
			font-size: 0.75rem;
		}

		.editor-controls {
			opacity: 1;
			bottom: 8px;
		}

		.editor-control-btn {
			width: 32px;
			height: 32px;
		}
	}

	@media (max-width: 480px) {
		.game-info {
			padding: 10px 10px 0px 10px;
			gap: 6px;
		}

		.title-section {
			min-height: 36px;
			max-height: 36px;
		}

		.game-title {
			font-size: 0.9rem;
			line-height: 1.15;
		}

		.metadata-row {
			gap: 4px;
		}

		.badges-left {
			gap: 3px;
		}

		.year-right {
			font-size: 0.75rem;
			gap: 3px;
		}

		.badge {
			font-size: 0.65rem;
			padding: 2px 6px;
			max-width: 100px;
		}

		.ratings-compact {
			padding: 0;
			gap: 2px;
		}

		.rating-mini {
			gap: 4px;
		}

		.mini-rating-value {
			font-size: 0.7rem;
			min-width: 16px;
		}

		.ratings-list {
			padding: 6px 0;
			gap: 6px;
		}

		.rating-row {
			gap: 2px;
		}

		.time-date-row {
			font-size: 0.75rem;
		}

		.tier-badge {
			padding: 4px 8px;
			min-width: 26px;
			top: 8px;
			right: 8px;
		}

		.tier-text {
			font-size: 0.8rem;
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

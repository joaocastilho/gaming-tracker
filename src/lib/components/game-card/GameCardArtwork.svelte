<script lang="ts">
	import { editorStore } from '../../stores/editor.svelte';
	import { offlineStore } from '../../stores/offline.svelte';
	import { filtersStore } from '../../stores/filters.svelte';
	import { getTierClass, getTierDisplayName } from '../../utils/tierUtils.js';
	import { generateSrcset, generateTinySrcset, generateSizes } from '../../utils/imageSrcset.js';
	import type { Game } from '../../types/game.js';
	import { Pencil, Trash2 } from 'lucide-svelte';

	interface Props {
		game: Game;
		size?: 'small' | 'large' | 'tiny' | 'tierlist';
		showTierBadge?: boolean;
		isAboveFold?: boolean;
		isPriority?: boolean;
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let {
		game,
		size = 'small',
		showTierBadge = true,
		isAboveFold = false,
		isPriority = false,
		onEditGame,
		onDeleteGame
	}: Props = $props();

	let isEditor = $derived(editorStore.editorMode);
	let isOffline = $derived(!offlineStore.isOnline);
	let imageElement = $state<HTMLImageElement>();
	let isVisible = $state(true);

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

	function handleTierClick(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) {
			return;
		}
		if (event instanceof KeyboardEvent && !(event.key === 'Enter' || event.key === ' ')) {
			return;
		}
		if (game.tier) {
			filtersStore.toggleTier(game.tier);
		}
	}

	function preloadDetailImage() {
		const imgPath = game.coverImage || 'covers/placeholder_cover.webp';
		const detailImg = new Image();
		detailImg.src = imgPath.replace('.webp', '-detail.webp');
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
			onmouseover={preloadDetailImage}
			onfocus={preloadDetailImage}
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

<style>
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

	:global(.game-card:hover) .editor-controls,
	:global(.game-card:focus-within) .editor-controls {
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

	/* Responsive Styles using Container Queries */
	@container game-card (max-width: 420px) {
		.editor-controls {
			opacity: 1;
			bottom: 48px;
		}

		.editor-control-btn {
			width: 32px;
			height: 32px;
		}

		.tier-badge {
			padding: 4px 8px;
			min-width: 26px;
			top: 8px;
			right: 8px;
		}

		.tier-text {
			font-size: clamp(0.7rem, 5cqi, 0.85rem);
		}
	}
</style>

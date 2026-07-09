<script lang="ts">
import { editorStore } from '../../stores/editor.svelte';
import { offlineStore } from '../../stores/offline.svelte';
import { filtersStore } from '../../stores/filters.svelte';
import { imageErrorStore } from '../../stores/imageErrors.svelte.js';
import { getTierClass, getTierDisplayName } from '../../utils/tierUtils.js';
import type { Game } from '../../types/game.js';
import { Pencil, Trash2 } from '@lucide/svelte';

interface Props {
	game: Game;
	size?: 'small' | 'large' | 'tiny' | 'tierlist';
	showTierBadge?: boolean;
	isAboveFold?: boolean;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
}

let { game, showTierBadge = true, isAboveFold = false, onEditGame, onDeleteGame }: Props = $props();

let isEditor = $derived(editorStore.editorMode);
let isOffline = $derived(!offlineStore.isOnline);

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

function imageAction(node: HTMLImageElement) {
	const mountTime = performance.now();

	function handleLoad(instant = false) {
		if (node) {
			const isInstant = instant || performance.now() - mountTime < 50;
			if (isInstant) {
				node.style.transition = 'none';
			}

			node.classList.add('loaded');
			const skeleton = node.previousElementSibling as HTMLElement;
			if (skeleton && skeleton.classList.contains('skeleton-loader')) {
				if (isInstant) {
					skeleton.style.transition = 'none';
				}
				skeleton.style.opacity = '0';
			}
		}
	}

	function handleError() {
		const failedSrc = node.currentSrc || node.src;
		if (failedSrc && !failedSrc.includes('placeholder_cover')) {
			imageErrorStore.markFailed(failedSrc);
		}

		if (!failedSrc || !failedSrc.includes('placeholder_cover')) {
			node.src = PLACEHOLDER_SRC;
			node.srcset = '';
		} else {
			node.src = OFFLINE_FALLBACK_DATA_URI;
			node.srcset = '';
		}
		handleLoad();
	}

	if (node.complete && node.naturalHeight !== 0) {
		// Image is already cached, disable transition to prevent flickering
		node.style.transition = 'none';
		handleLoad(true);
	}

	function onLoadEvent() {
		handleLoad(false);
	}

	node.addEventListener('load', onLoadEvent);
	node.addEventListener('error', handleError);

	return {
		destroy() {
			node.removeEventListener('load', onLoadEvent);
			node.removeEventListener('error', handleError);
		},
	};
}

const effectiveImageSrc = $derived(() => {
	if (isOffline) {
		return OFFLINE_FALLBACK_DATA_URI;
	}
	const baseImage = game.coverImage ? `/${game.coverImage}` : PLACEHOLDER_SRC;
	if (imageErrorStore.hasFailed(baseImage)) {
		return PLACEHOLDER_SRC;
	}
	return baseImage;
});

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
	const imgPath = game.coverImage ? `/${game.coverImage}` : PLACEHOLDER_SRC;
	const detailImg = new Image();
	detailImg.src = imgPath.replace('.webp', '-detail.webp');
}

function getCompletionDay(dateStr: string | null): string {
	if (!dateStr) return '';
	const parts = dateStr.split('/');
	if (parts.length !== 3) return '';
	const day = parseInt(parts[0], 10);
	return isNaN(day) ? '' : String(day);
}
</script>

<div class="cover-container">
	<div class="image-wrapper">
		<div class="skeleton-loader"></div>
		<img
			src={effectiveImageSrc()}
			alt={game.title}
			class="cover-image"
			loading="eager"
			fetchpriority={isAboveFold ? 'high' : 'auto'}
			decoding="async"
			width="300"
			height="450"
			use:imageAction
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

	{#if game.status === 'Completed' && game.finishedDate}
		{@const completionDay = getCompletionDay(game.finishedDate)}
		{#if completionDay}
			<div class="completion-badge">
				<span class="completion-day">{completionDay}</span>
			</div>
		{/if}
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
		border-radius: 8px 8px 0 0;
	}

	.skeleton-loader {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--color-surface-elevated);
		overflow: hidden;
		z-index: 1;
		opacity: 0.7;
		transition: opacity var(--transition-normal);
	}

	.skeleton-loader::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--color-border-subtle) 50%,
			transparent 100%
		);
		animation: skeleton-shimmer 2s ease-in-out infinite;
		will-change: transform;
	}

	:global(.light) .skeleton-loader {
		background: var(--color-surface-elevated-solid);
	}

	.cover-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		position: relative;
		z-index: 2;
		opacity: 0;
		transition: opacity 0.4s ease-in-out;
	}

	.cover-image.loaded {
		opacity: 1;
	}

	@keyframes skeleton-shimmer {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.tier-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		display: flex;
		align-items: center;
		padding: 6px 12px;
		border-radius: 4px;
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
		transition:
			transform var(--transition-fast),
			box-shadow var(--transition-fast);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	@media (hover: hover) {
		.tier-badge:hover {
			transform: translateY(-2px) scale(1.05);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		}
	}

	.tier-text {
		font-size: 0.85rem;
		font-weight: 700;
	}

	.completion-badge {
		position: absolute;
		bottom: 10px;
		left: 10px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 36px;
		min-height: 36px;
		background: linear-gradient(
			135deg,
			var(--color-primary) 0%,
			var(--color-primary-dark, #6366f1) 100%
		);
		border-radius: 4px;
		font-weight: 800;
		z-index: 10;
		box-shadow: 0 4px 12px rgba(99, 102, 241, 0.45);
		border: 2px solid rgba(255, 255, 255, 0.25);
	}

	.completion-day {
		font-size: 1rem;
		font-weight: 800;
		color: white;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.editor-controls {
		position: absolute;
		bottom: 8px;
		left: 8px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity var(--transition-normal);
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
		border-radius: 50%;
		border: 1px solid rgba(255, 255, 255, 0.3);
		cursor: pointer;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition:
			transform var(--transition-fast),
			box-shadow var(--transition-fast),
			background var(--transition-fast);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	}

	.edit-btn {
		background: rgba(0, 0, 0, 0.6);
		color: #ffffff;
	}

	@media (hover: hover) {
		.edit-btn:hover {
			background: rgba(0, 0, 0, 0.8);
			color: #ffffff;
			transform: scale(1.1);
			box-shadow: 0 0 16px rgba(0, 0, 0, 0.5);
		}
	}

	.delete-btn {
		background: rgba(239, 68, 68, 0.6);
		color: #ffffff;
	}

	@media (hover: hover) {
		.delete-btn:hover {
			background: rgba(239, 68, 68, 0.9);
			color: #ffffff;
			transform: scale(1.1);
			box-shadow: 0 0 16px rgba(239, 68, 68, 0.6);
		}
	}

	@container game-card (max-width: 420px) {
		.editor-controls {
			opacity: 0.85;
		}

		.editor-control-btn {
			width: 32px;
			height: 32px;
			border: 1px solid rgba(255, 255, 255, 0.15);
			/* Remove backdrop-filter on small cards for performance */
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
		}

		.edit-btn {
			background: rgba(0, 0, 0, 0.65);
		}

		.delete-btn {
			background: rgba(180, 30, 30, 0.75);
		}

		.tier-badge {
			padding: 4px 8px;
			min-width: 26px;
			top: 8px;
			right: 8px;
			background-color: rgba(0, 0, 0, 0.55);
			backdrop-filter: none;
			-webkit-backdrop-filter: none;
			border: 1px solid rgba(255, 255, 255, 0.1);
		}

		.tier-text {
			font-size: clamp(0.7rem, 5cqi, 0.85rem);
		}
	}
</style>

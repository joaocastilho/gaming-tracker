import { Pencil, Trash2 } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { editorStore } from '#lib/stores/editor.js';
import { filtersStore } from '#lib/stores/filters.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { offlineStore } from '#lib/stores/offline.js';
import type { Game } from '#lib/types/game.js';
import { preloadImage } from '#lib/utils/imagePreload.js';
import { generateSizes, generateSrcset } from '#lib/utils/imageSrcset.js';
import { getTierClass, getTierDisplayName } from '#lib/utils/tierUtils.js';
import './GameCardArtwork.css';

export interface GameCardArtworkProps {
	game: Game;
	size?: 'small' | 'large' | 'tiny' | 'tierlist';
	showTierBadge?: boolean;
	isAboveFold?: boolean;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
}

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

function getCompletionDay(dateStr: string | null): string {
	if (!dateStr) return '';
	const parts = dateStr.split('/');
	if (parts.length !== 3) return '';
	const day = parseInt(parts[0], 10);
	return Number.isNaN(day) ? '' : String(day);
}

export default function GameCardArtwork(props: GameCardArtworkProps): JSX.Element {
	const [imgEl, setImgEl] = createSignal<HTMLImageElement | null>(null);
	const isOffline = createMemo(() => !offlineStore.isOnline);
	const showTierBadge = createMemo(() => props.showTierBadge !== false);

	const effectiveImageSrc = createMemo(() => {
		if (isOffline()) return OFFLINE_FALLBACK_DATA_URI;
		const baseImage = props.game.coverImage ? `/${props.game.coverImage}` : PLACEHOLDER_SRC;
		if (imageErrorStore.hasFailed(baseImage)) return PLACEHOLDER_SRC;
		return baseImage;
	});

	const srcset = createMemo(() => (!isOffline() ? generateSrcset(effectiveImageSrc()) : undefined));
	const completionDay = createMemo(() =>
		props.game.status === 'Completed' && props.game.finishedDate ? getCompletionDay(props.game.finishedDate) : ''
	);

	createEffect(
		() => ({ node: imgEl(), coverImage: props.game.coverImage }),
		({ node, coverImage }) => {
			if (!node) return;
			const mountTime = performance.now();

			function handleLoad(instant = false): void {
				if (!node) return;
				const isInstant = instant || performance.now() - mountTime < 50;
				if (isInstant) {
					node.style.transition = 'none';
				}
				node.classList.add('loaded');
				const skeleton = node.previousElementSibling;
				if (skeleton instanceof HTMLElement && skeleton.classList.contains('skeleton-loader')) {
					if (isInstant) {
						skeleton.style.transition = 'none';
					}
					skeleton.classList.add('loaded');
					skeleton.style.opacity = '0';
				}
			}

			function handleError(): void {
				if (!node) return;
				const failedSrc = node.currentSrc || node.src;
				if (failedSrc && !failedSrc.includes('placeholder_cover')) {
					imageErrorStore.markFailed(failedSrc);
					if (coverImage) {
						imageErrorStore.markFailed(`/${coverImage}`);
					}
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
				node.style.transition = 'none';
				handleLoad(true);
			}

			const onLoadEvent = () => handleLoad(false);
			node.addEventListener('load', onLoadEvent);
			node.addEventListener('error', handleError);

			return () => {
				node.removeEventListener('load', onLoadEvent);
				node.removeEventListener('error', handleError);
			};
		}
	);

	function handleTierClick(event: MouseEvent | KeyboardEvent): void {
		event.stopPropagation();
		if (typeof window !== 'undefined' && window.innerWidth < 768) return;
		if (event instanceof KeyboardEvent && !(event.key === 'Enter' || event.key === ' ')) return;
		if (props.game.tier) {
			filtersStore.toggleTier(props.game.tier);
		}
	}

	function preloadDetailImage(): void {
		const imgPath = props.game.coverImage ? `/${props.game.coverImage}` : PLACEHOLDER_SRC;
		preloadImage(imgPath.replace('.webp', '-detail.webp'));
	}

	return (
		<div class="cover-container">
			<div class="image-wrapper">
				<div class="skeleton-loader" />
				<img
					ref={setImgEl}
					src={effectiveImageSrc()}
					srcset={srcset()}
					sizes={generateSizes('gallery')}
					alt={props.game.title}
					class="cover-image"
					loading="eager"
					fetchpriority={props.isAboveFold ? 'high' : 'auto'}
					decoding="async"
					width={300}
					height={450}
					onMouseOver={preloadDetailImage}
					onFocus={preloadDetailImage}
				/>
			</div>

			<Show when={showTierBadge() && props.game.status === 'Completed' && props.game.tier}>
				<button
					type="button"
					class={['tier-badge', getTierClass(props.game.tier ?? '')]}
					onClick={handleTierClick}
					onKeyDown={handleTierClick}
					aria-label={`Filter by Tier ${props.game.tier}`}
					title={`Tier: ${getTierDisplayName(props.game.tier ?? '')}`}
				>
					<span class="tier-text" aria-hidden="true">
						{getTierDisplayName(props.game.tier ?? '')}
					</span>
				</button>
			</Show>

			<Show when={completionDay()}>
				<div class="completion-badge" aria-hidden="true">
					<span class="completion-day">{completionDay()}</span>
				</div>
			</Show>

			<Show when={editorStore.editorMode}>
				<div class="editor-controls">
					<button
						type="button"
						class="editor-control-btn edit-btn"
						onClick={(e) => {
							e.stopPropagation();
							props.onEditGame?.(props.game);
						}}
						title="Edit game"
						aria-label={`Edit ${props.game.title}`}
					>
						<Pencil size={16} />
					</button>
					<button
						type="button"
						class="editor-control-btn delete-btn"
						onClick={(e) => {
							e.stopPropagation();
							props.onDeleteGame?.(props.game);
						}}
						title="Delete game"
						aria-label={`Delete ${props.game.title}`}
					>
						<Trash2 size={16} />
					</button>
				</div>
			</Show>
		</div>
	);
}

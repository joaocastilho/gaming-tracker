import { Pencil, Share2, Trash2, X } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createMemo, createSignal, Show } from 'solid-js';
import { editorStore } from '#lib/stores/editor.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { modalStore } from '#lib/stores/modal.js';
import { offlineStore } from '#lib/stores/offline.js';
import type { Game } from '#lib/types/game.js';
import { browser } from '#lib/utils/env.js';
import { generateSizes, generateSrcset } from '#lib/utils/imageSrcset.js';
import { createGameSlug } from '#lib/utils/slugUtils.js';
import ModalHeader from './ModalHeader.js';
import ModalMetadata from './ModalMetadata.js';
import ModalRatings from './ModalRatings.js';
import './GameDetailCard.css';

export interface GameDetailCardProps {
	game: Game;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
	onClose?: () => void;
	onImageLoad?: () => void;
	onImageClick?: () => void;
}

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const PLACEHOLDER_DETAIL_SRC = '/covers/placeholder_cover-detail.webp';
const PLACEHOLDER_SRCSET = '/covers/placeholder_cover.webp 300w, /covers/placeholder_cover-detail.webp 400w';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

const DETAIL_IMAGE_SIZES = generateSizes('modal');

export default function GameDetailCard(props: GameDetailCardProps): JSX.Element {
	const [linkCopied, setLinkCopied] = createSignal('');
	let modalImageElement: HTMLImageElement | undefined;

	const isOffline = createMemo(() => !offlineStore.isOnline);

	const detailImageSrc = createMemo(() => {
		if (isOffline()) return OFFLINE_FALLBACK_DATA_URI;
		const coverImage = props.game.coverImage;
		const src = (coverImage ? `/${coverImage}` : PLACEHOLDER_SRC).replace('.webp', '-detail.webp');
		return imageErrorStore.hasFailed(src) ? PLACEHOLDER_DETAIL_SRC : src;
	});

	const detailImageSrcset = createMemo(() => {
		if (isOffline()) return '';
		const src = detailImageSrc();
		if (src.includes('placeholder_cover')) return PLACEHOLDER_SRCSET;

		const generatedSrcset = generateSrcset(src.replace('-detail.webp', ''));
		const parts = generatedSrcset.split(',').map((p) => p.trim());
		const validParts = parts.filter((part) => !imageErrorStore.hasFailed(part.split(' ')[0]));
		return validParts.length === 0 ? PLACEHOLDER_SRCSET : validParts.join(', ');
	});

	async function shareGame(): Promise<void> {
		if (!browser || !props.game) return;
		const url = new URL(window.location.href);
		const slug = createGameSlug(props.game.title);
		url.searchParams.set('game', slug);
		const shareUrl = url.toString();
		const shareData = { title: props.game.title, url: shareUrl };

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareUrl);
				setLinkCopied('Copied');
				setTimeout(() => setLinkCopied(''), 2000);
			}
		} catch {
			setLinkCopied('Failed');
			setTimeout(() => setLinkCopied(''), 2000);
		}
	}

	function handleImageError(): void {
		if (!modalImageElement) return;
		const failedSrc = modalImageElement.currentSrc || modalImageElement.src;
		if (failedSrc && !failedSrc.includes('placeholder_cover')) {
			imageErrorStore.markFailed(failedSrc);
		}

		if (!failedSrc || !failedSrc.includes('placeholder_cover')) {
			modalImageElement.src = PLACEHOLDER_DETAIL_SRC;
			modalImageElement.srcset = PLACEHOLDER_SRCSET;
		} else {
			modalImageElement.src = OFFLINE_FALLBACK_DATA_URI;
			modalImageElement.srcset = '';
		}
	}

	return (
		<div class="modal-layout flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:overflow-hidden">
			<div class="modal-image-container relative shrink-0 overflow-hidden md:h-auto md:w-[360px] md:min-h-0 md:rounded-t-xl md:rounded-l-xl md:rounded-tr-none">
				<div class="absolute top-3 right-3 z-20 flex items-center gap-2 md:hidden">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							void shareGame();
						}}
						class={[
							'flex h-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/40 text-white/90 backdrop-blur-md transition-colors outline-none hover:bg-black/60 touch-manipulation [-webkit-tap-highlight-color:transparent]',
							linkCopied() ? 'gap-1.5 px-3' : 'w-8',
						]}
						title="Share"
						aria-label={`Share ${props.game.title}`}
					>
						<Share2 size={18} />
						<Show when={linkCopied()}>
							<span class="text-xs font-medium">{linkCopied()}</span>
						</Show>
					</button>
					<Show when={props.onClose}>
						{(closeFn) => (
							<button
								type="button"
								onClick={() => closeFn()()}
								class="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/40 text-white/90 backdrop-blur-md transition-colors outline-none hover:bg-black/60 touch-manipulation [-webkit-tap-highlight-color:transparent]"
								aria-label="Close modal"
							>
								<X size={20} />
							</button>
						)}
					</Show>
				</div>

				<div class="h-full bg-gray-900 md:min-h-0">
					<button
						type="button"
						class="contents"
						onClick={() => props.onImageClick?.()}
						aria-label="View full screen"
						data-continuum-drag-handle=""
					>
						<img
							ref={(el) => {
								modalImageElement = el;
							}}
							src={detailImageSrc()}
							srcset={detailImageSrcset()}
							sizes={DETAIL_IMAGE_SIZES}
							alt={`${props.game.title} cover`}
							class="modal-cover-image h-full w-full cursor-pointer object-cover transition-transform select-none md:cursor-grab md:active:cursor-grabbing"
							loading="eager"
							draggable={false}
							onLoad={() => props.onImageLoad?.()}
							onError={handleImageError}
						/>
					</button>
				</div>

				<Show when={editorStore.editorMode}>
					<div class="absolute bottom-2 left-2 z-10 flex items-center gap-1">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								modalStore.closeModal();
								props.onEditGame?.(props.game);
							}}
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80 hover:shadow-black/50"
							title="Edit game"
							aria-label={`Edit ${props.game.title}`}
						>
							<Pencil size={18} />
						</button>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								modalStore.closeModal();
								props.onDeleteGame?.(props.game);
							}}
							class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-red-500/60 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500/90 hover:shadow-red-500/50"
							title="Delete game"
							aria-label={`Delete ${props.game.title}`}
						>
							<Trash2 size={18} />
						</button>
					</div>
				</Show>
			</div>

			<div class="modal-details-wrapper flex flex-1 flex-col min-h-0 max-h-full">
				<div class="modal-details-section flex-1 overflow-y-auto px-5 pb-6 md:flex md:flex-col md:pb-6 lg:pr-8 lg:pb-6 lg:pl-8">
					<ModalHeader
						game={props.game}
						onClose={props.onClose}
						onShare={() => void shareGame()}
						linkCopied={linkCopied()}
					/>
					<ModalMetadata game={props.game} />
					<ModalRatings game={props.game} />
				</div>
			</div>
		</div>
	);
}

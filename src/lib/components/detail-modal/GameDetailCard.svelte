<script lang="ts">
import { editorStore } from '$lib/stores/editor.svelte';
import { offlineStore } from '$lib/stores/offline.svelte';
import type { Game } from '$lib/types/game.js';
import { generateSrcset, generateSizes } from '$lib/utils/imageSrcset.js';
import { X, Pencil, Trash2 } from 'lucide-svelte';
import { modalStore } from '$lib/stores/modal.svelte';
import { imageErrorStore } from '$lib/stores/imageErrors.svelte.js';
import { createGameSlug } from '$lib/utils/slugUtils';
import { browser } from '$app/environment';
import ModalHeader from './ModalHeader.svelte';
import ModalMetadata from './ModalMetadata.svelte';
import ModalRatings from './ModalRatings.svelte';

interface Props {
	game: Game;
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
	onClose?: () => void;
	onImageLoad?: () => void;
	onImageClick?: () => void;
}

let { game, onEditGame, onDeleteGame, onClose, onImageLoad, onImageClick }: Props = $props();

let isEditor = $derived(editorStore.editorMode);
let isOffline = $derived(!offlineStore.isOnline);

let linkCopied = $state('');

async function shareGame() {
	if (!browser || !game) return;
	try {
		const url = new URL(window.location.href);
		const slug = createGameSlug(game.title);
		url.searchParams.set('game', slug);
		await navigator.clipboard.writeText(url.toString());
		linkCopied = 'Copied';
		setTimeout(() => {
			linkCopied = '';
		}, 2000);
	} catch {
		linkCopied = 'Failed';
		setTimeout(() => {
			linkCopied = '';
		}, 2000);
	}
}

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const PLACEHOLDER_DETAIL_SRC = '/covers/placeholder_cover-detail.webp';
const PLACEHOLDER_SRCSET = '/covers/placeholder_cover.webp 300w, /covers/placeholder_cover-detail.webp 400w';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

const detailImageSrc = $derived.by(() => {
	if (isOffline) return OFFLINE_FALLBACK_DATA_URI;
	const coverImage = game.coverImage;
	const src = (coverImage ? `/${coverImage}` : PLACEHOLDER_SRC).replace('.webp', '-detail.webp');
	if (imageErrorStore.hasFailed(src)) {
		return PLACEHOLDER_DETAIL_SRC;
	}
	return src;
});

const detailImageSizes = generateSizes('modal');

const detailImageSrcset = $derived.by(() => {
	if (isOffline) return '';
	const src = detailImageSrc;
	if (src.includes('placeholder_cover')) return PLACEHOLDER_SRCSET;

	const generatedSrcset = generateSrcset(src.replace('-detail.webp', ''));
	const parts = generatedSrcset.split(',').map((p) => p.trim());
	const validParts = parts.filter((part) => {
		const url = part.split(' ')[0];
		return !imageErrorStore.hasFailed(url);
	});

	if (validParts.length === 0) return PLACEHOLDER_SRCSET;
	return validParts.join(', ');
});

let modalImageElement = $state<HTMLImageElement>();

function handleImageLoad() {
	onImageLoad?.();
}

function handleImageError() {
	if (modalImageElement) {
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
}
</script>

{#if onClose}
	<button
		onclick={onClose}
		class="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/20 text-white backdrop-blur-sm transition-colors outline-none hover:bg-black/40 md:hidden touch-manipulation [-webkit-tap-highlight-color:transparent]"
		aria-label="Close modal"
	>
		<X size={20} />
	</button>
{/if}

<div
	class="modal-layout flex h-full min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:grid md:grid-cols-[250px_1fr] md:overflow-hidden lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]"
>
	<div class="flex min-h-full flex-col md:contents">
		<div
			class="modal-image-container relative min-h-[20vh] flex-1 shrink-0 overflow-hidden rounded-t-xl md:h-full md:flex-none md:rounded-l-xl md:rounded-tr-none"
		>
			<div class="modal-image-wrapper h-full bg-gray-900">
				<button class="contents" onclick={onImageClick} aria-label="View full screen">
					<img
						bind:this={modalImageElement}
						src={detailImageSrc}
						srcset={detailImageSrcset}
						sizes={detailImageSizes}
						alt="{game.title} cover"
						class="modal-cover-image h-full w-full cursor-pointer object-cover transition-transform"
						loading="eager"
						onload={handleImageLoad}
						onerror={handleImageError}
					/>
				</button>
			</div>

			{#if isEditor}
				<div class="absolute bottom-2 left-2 z-10 hidden items-center gap-1 md:flex">
					<button
						onclick={(e) => {
							e.stopPropagation();
							modalStore.closeModal();
							onEditGame?.(game);
						}}
						class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-black/60 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-black/80 hover:shadow-black/50"
						title="Edit game"
						aria-label="Edit {game.title}"
					>
						<Pencil size={18} />
					</button>
					<button
						onclick={(e) => {
							e.stopPropagation();
							modalStore.closeModal();
							onDeleteGame?.(game);
						}}
						class="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-red-500/60 text-white shadow-lg backdrop-blur-md transition-all hover:scale-110 hover:bg-red-500/90 hover:shadow-red-500/50"
						title="Delete game"
						aria-label="Delete {game.title}"
					>
						<Trash2 size={18} />
					</button>
				</div>
			{/if}
		</div>

		<div
			class="modal-details-section flex-none px-5 md:flex-1 md:overflow-y-auto md:pb-6 lg:pr-8 lg:pb-5 lg:pl-8"
		>
			<ModalHeader {game} {onClose} onShare={shareGame} {linkCopied} />
			<ModalMetadata {game} />
			<ModalRatings {game} />

			<div class="mt-4 md:hidden"></div>
		</div>
	</div>
</div>

<style>
	.modal-details-section {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.modal-details-section::-webkit-scrollbar {
		display: none;
	}

	@media (orientation: landscape) and (max-height: 1000px) {
		.modal-layout {
			display: grid !important;
			grid-template-columns: 250px 1fr !important;
			overflow: hidden !important;
		}

		.modal-image-container {
			height: 100% !important;
			flex: 0 0 auto !important; /* Fixed syntax error 'flex: mb-auto' ? no, assuming flex: none or similar. 'mb-auto' is invalid. */
			border-radius: 0 !important;
		}

		.modal-details-section {
			overflow-y: auto !important;
			height: 100% !important;
			padding: 1.5rem !important;
		}
	}
</style>

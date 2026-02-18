<script lang="ts">
	import { editorStore } from '$lib/stores/editor.svelte';
	import { offlineStore } from '$lib/stores/offline.svelte';
	import type { Game } from '$lib/types/game.js';
	import { generateSrcset, generateSizes } from '$lib/utils/imageSrcset.js';
	import { X } from 'lucide-svelte';
	import ModalHeader from './ModalHeader.svelte';
	import ModalMetadata from './ModalMetadata.svelte';
	import ModalRatings from './ModalRatings.svelte';

	interface Props {
		game: Game;
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
		onClose?: () => void;
		onImageLoad?: () => void;
		// Optional transition props
		isTransitioningImage?: boolean;
		transitionImage?: string;
	}

	let {
		game,
		onEditGame,
		onDeleteGame,
		onClose,
		onImageLoad,
		isTransitioningImage = false,
		transitionImage = ''
	}: Props = $props();

	let isEditor = $derived(editorStore.editorMode);
	let isOffline = $derived(!offlineStore.isOnline);

	// Placeholders
	const PLACEHOLDER_SRC = 'covers/placeholder_cover.webp';
	const PLACEHOLDER_DETAIL_SRC = 'covers/placeholder_cover-detail.webp';
	const PLACEHOLDER_SRCSET =
		'covers/placeholder_cover.webp 300w, covers/placeholder_cover-detail.webp 400w';
	const OFFLINE_FALLBACK_DATA_URI =
		'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

	// Image logic
	const detailImageSrc = $derived.by(() => {
		if (isOffline) return OFFLINE_FALLBACK_DATA_URI;
		const coverImage = game.coverImage;
		return (coverImage || PLACEHOLDER_SRC).replace('.webp', '-detail.webp');
	});

	const detailImageSizes = generateSizes('modal');

	const detailImageSrcset = $derived.by(() => {
		if (isOffline) return '';
		const src = detailImageSrc;
		if (src.includes('placeholder_cover')) return PLACEHOLDER_SRCSET;
		return generateSrcset(src.replace('-detail.webp', ''));
	});

	let modalImageElement = $state<HTMLImageElement>();

	function handleImageLoad() {
		onImageLoad?.();
	}

	function handleImageError() {
		if (modalImageElement) {
			if (!modalImageElement.src.includes('placeholder_cover')) {
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
		class="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/20 text-white backdrop-blur-sm transition-colors outline-none hover:bg-black/40 md:top-4 md:right-4"
		aria-label="Close modal"
	>
		<X size={20} />
	</button>
{/if}

<div
	class="modal-layout flex h-full min-h-0 flex-1 flex-col overflow-y-auto md:grid md:grid-cols-[250px_1fr] md:overflow-hidden lg:grid-cols-[350px_1fr] xl:grid-cols-[400px_1fr]"
>
	<!-- Mobile flexible wrapper (display: contents on desktop to preserve grid) -->
	<div class="flex min-h-full flex-col md:contents">
		<!-- Image Section -->
		<div
			class="modal-image-container relative min-h-[20vh] flex-1 shrink-0 overflow-hidden rounded-t-xl md:h-full md:flex-none md:rounded-l-xl md:rounded-tr-none"
		>
			<div class="modal-image-wrapper h-full bg-gray-900">
				{#if isTransitioningImage && transitionImage}
					<img
						src={transitionImage}
						alt="Transitioning..."
						class="absolute inset-0 z-10 h-full w-full object-cover"
						aria-hidden="true"
					/>
				{/if}

				<button class="contents" onclick={() => {}} aria-label="View full screen">
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
		</div>

		<!-- Details Section -->
		<div
			class="modal-details-section flex-none px-5 md:flex-1 md:overflow-y-auto md:pb-6 lg:pr-8 lg:pb-5 lg:pl-8"
		>
			<ModalHeader {game} {isEditor} onEdit={onEditGame} onDelete={onDeleteGame} />
			<ModalMetadata {game} />
			<ModalRatings {game} />
			
			<!-- Visual bottom spacer to ensure content clears rounded corners -->
			<div class="mt-4 md:hidden"></div>
		</div>
	</div>
</div>

<style>
	@media (orientation: landscape) and (max-height: 1000px) {
		.modal-layout {
			/* Force grid layout even if some styles try to override */
			display: grid !important;
			/* Ensure we have 2 columns. Adjust width as needed for smaller screens */
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

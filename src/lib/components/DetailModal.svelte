<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { modalStore } from '$lib/stores/modal.svelte';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { offlineStore } from '$lib/stores/offline.svelte';
	import { gamesStore } from '$lib/stores/games.svelte';
	import type { Game } from '$lib/types/game.js';
	import { generateSrcset, generateSizes } from '../utils/imageSrcset.js';
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';

	import ModalHeader from './detail-modal/ModalHeader.svelte';
	import ModalMetadata from './detail-modal/ModalMetadata.svelte';
	import ModalRatings from './detail-modal/ModalRatings.svelte';
	import { SwipeController } from './detail-modal/SwipeController.svelte';

	interface Props {
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let { onEditGame, onDeleteGame }: Props = $props();

	let isEditor = $derived(editorStore.editorMode);
	let isOffline = $derived(!offlineStore.isOnline);

	// Platform detection
	let isIOS = $state(false);
	let isAndroid = $state(false);

	$effect(() => {
		if (browser) {
			const ua = navigator.userAgent;
			isIOS =
				/iPad|iPhone|iPod/.test(ua) ||
				(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
			isAndroid = /Android/.test(ua);
		}
	});

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
		const coverImage = $modalStore.activeGame?.coverImage;
		return (coverImage || PLACEHOLDER_SRC).replace('.webp', '-detail.webp');
	});

	const detailImageSizes = $derived(generateSizes('modal'));

	const detailImageSrcset = $derived.by(() => {
		if (isOffline) return '';
		const src = detailImageSrc;
		if (src.includes('placeholder_cover')) return PLACEHOLDER_SRCSET;
		return generateSrcset(src.replace('-detail.webp', ''));
	});

	function getPreviewImageSrc(coverImage: string | undefined): string {
		if (isOffline) return OFFLINE_FALLBACK_DATA_URI;
		return (coverImage || PLACEHOLDER_SRC).replace('.webp', '-detail.webp');
	}

	// Navigation Logic
	let displayedGames = $derived.by(() => {
		if ($modalStore.displayedGames.length > 0) return $modalStore.displayedGames;
		const allGames = $gamesStore;
		if (allGames.length === 0) return [];
		return modalStore.getReactiveNavigationGames(allGames);
	});

	let currentGameIndex = $derived.by(() => {
		if (!$modalStore.activeGame) return -1;
		return displayedGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
	});

	let nextGamePreview = $derived(
		currentGameIndex < displayedGames.length - 1 ? displayedGames[currentGameIndex + 1] : null
	);
	let prevGamePreview = $derived(
		currentGameIndex > 0 ? displayedGames[currentGameIndex - 1] : null
	);

	// Image transition state
	let transitionImage = $state('');
	let isTransitioningImage = $state(false);
	let modalImageElement = $state<HTMLImageElement>();

	function navigateToPrevious() {
		if (currentGameIndex > 0) {
			const prevGame = displayedGames[currentGameIndex - 1];
			// Pre-set transition
			transitionImage = getPreviewImageSrc(prevGame.coverImage);
			isTransitioningImage = true;
			modalStore.openViewModal(prevGame, displayedGames);
		}
	}

	function navigateToNext() {
		if (currentGameIndex < displayedGames.length - 1) {
			const nextGame = displayedGames[currentGameIndex + 1];
			// Pre-set transition
			transitionImage = getPreviewImageSrc(nextGame.coverImage);
			isTransitioningImage = true;
			modalStore.openViewModal(nextGame, displayedGames);
		}
	}

	// Swipe Controller
	const swipe = new SwipeController(
		navigateToNext,
		navigateToPrevious,
		() => nextGamePreview,
		() => prevGamePreview
	);

	// Interaction Handlers
	function handleKeydown(event: KeyboardEvent) {
		if (!$modalStore.isOpen || $modalStore.mode !== 'view') return;

		if (event.key === 'Escape') {
			event.preventDefault();
			modalStore.closeModal();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			navigateToPrevious();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			navigateToNext();
		}
	}

	function handleImageLoad() {
		setTimeout(() => {
			isTransitioningImage = false;
		}, 50);
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
		isTransitioningImage = false;
	}

	// Swipe Hint Logic
	const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';
	let showSwipeIndicator = $state(false);
	let swipeIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;
	let swipeHideTimeout: ReturnType<typeof setTimeout> | null = null;
	let hasTriggeredHint = false;

	$effect(() => {
		const games = displayedGames;
		if (!browser || !$modalStore.isOpen || $modalStore.mode !== 'view') return;

		if (sessionStorage.getItem(SWIPE_HINT_KEY)) return;
		if (window.innerWidth >= 768 || games.length <= 1) return;
		if (hasTriggeredHint || showSwipeIndicator) return;

		hasTriggeredHint = true;
		swipeIndicatorTimeout = setTimeout(() => {
			showSwipeIndicator = true;
			swipeHideTimeout = setTimeout(() => {
				showSwipeIndicator = false;
				sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
			}, 5000);
		}, 300);
	});

	function dismissSwipeHint() {
		if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
		if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
		showSwipeIndicator = false;
		sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
	}

	onMount(() => {
		if (browser) {
			document.addEventListener('keydown', handleKeydown, true);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleKeydown, true);
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}
		if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
		if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
	});

	$effect(() => {
		if (browser) {
			if ($modalStore.isOpen) {
				document.body.style.overflow = 'hidden';
				document.documentElement.style.overflow = 'hidden';
			} else {
				document.body.style.overflow = '';
				document.documentElement.style.overflow = '';
			}
		}
	});
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4"
		style="background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);"
		transition:fade={{ duration: isIOS ? 250 : 200 }}
		onclick={(e: MouseEvent) => {
			if (e.target === e.currentTarget) modalStore.closeModal();
		}}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Escape') modalStore.closeModal();
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<!-- Swipe Hint Overlay -->
		{#if showSwipeIndicator}
			<div
				class="swipe-hint-overlay md:hidden"
				transition:fade={{ duration: 400 }}
				onclick={dismissSwipeHint}
				onkeydown={(e: KeyboardEvent) =>
					(e.key === 'Escape' || e.key === 'Enter') && dismissSwipeHint()}
				role="button"
				tabindex="0"
				aria-label="Dismiss swipe hint"
			>
				<div class="swipe-hint-content">
					<svg
						class="swipe-hint-svg"
						viewBox="0 0 120 80"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							class="swipe-arrow swipe-arrow-left"
							d="M20 33 L13 40 L20 47 M30 33 L23 40 L30 47"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							class="swipe-arrow swipe-arrow-down"
							d="M55 58 L60 63 L65 58 M55 66 L60 71 L65 66"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							class="swipe-arrow swipe-arrow-right"
							d="M100 33 L107 40 L100 47 M90 33 L97 40 L90 47"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="swipe-hint-text">Swipe to navigate</span>
					<span class="swipe-hint-dismiss">Tap to dismiss</span>
				</div>
			</div>
		{/if}

		<!-- Parallax Preview: Previous -->
		{#if prevGamePreview && swipe.swipeDirection === 'right' && Math.abs(swipe.swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-left"
				style="transform: translateX({100 + swipe.parallaxOffset}%); opacity: {Math.min(
					Math.abs(swipe.swipeOffsetX) / 50,
					1
				)}; background-color: {prevGamePreview.status === 'Completed'
					? 'var(--color-surface-completed)'
					: 'var(--color-surface)'};"
			>
				<div class="parallax-title-container p-4">
					<h3 class="parallax-title text-xl font-bold">
						{prevGamePreview.mainTitle || prevGamePreview.title}
					</h3>
				</div>
			</div>
		{/if}

		<!-- Parallax Preview: Next -->
		{#if nextGamePreview && swipe.swipeDirection === 'left' && Math.abs(swipe.swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-right"
				style="transform: translateX({-100 + swipe.parallaxOffset}%); opacity: {Math.min(
					Math.abs(swipe.swipeOffsetX) / 50,
					1
				)}; background-color: {nextGamePreview.status === 'Completed'
					? 'var(--color-surface-completed)'
					: 'var(--color-surface)'};"
			>
				<div class="parallax-title-container p-4">
					<h3 class="parallax-title text-xl font-bold">
						{nextGamePreview.mainTitle || nextGamePreview.title}
					</h3>
				</div>
			</div>
		{/if}

		<!-- Desktop Nav Arrows -->
		{#if currentGameIndex > 0}
			<button
				onclick={navigateToPrevious}
				class="nav-arrow-btn absolute top-1/2 left-[calc(50%-600px)] z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 md:flex"
				aria-label="Previous game"
			>
				<ChevronLeft size={28} />
			</button>
		{/if}
		{#if currentGameIndex < displayedGames.length - 1}
			<button
				onclick={navigateToNext}
				class="nav-arrow-btn absolute top-1/2 right-[calc(50%-600px)] z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 md:flex"
				aria-label="Next game"
			>
				<ChevronRight size={28} />
			</button>
		{/if}

		<!-- Main Modal Content -->
		<div
			class="modal-content relative flex h-auto w-full max-w-[500px] flex-col overflow-hidden rounded-xl shadow-2xl md:max-h-[85vh] md:w-[95%] md:max-w-[1000px]"
			class:ios-modal={isIOS}
			class:android-modal={isAndroid}
			class:swiping-close={swipe.isClosingGesture}
			style="background-color: {$modalStore.activeGame.status === 'Completed'
				? 'var(--color-surface-completed)'
				: 'var(--color-surface)'}; 
				transform: translateX({swipe.swipeOffsetX}px) translateY({swipe.swipeOffsetY}px) scale({1 -
				Math.abs(swipe.swipeOffsetX) * 0.0003 -
				swipe.swipeOffsetY * 0.0008}); 
				opacity: {1 - Math.abs(swipe.swipeOffsetX) * 0.002 - swipe.swipeOffsetY * 0.002};
				border-radius: {12 + swipe.swipeOffsetY * 0.1}px;"
			role="document"
			ontouchstart={(e: TouchEvent) => swipe.handleTouchStart(e)}
			ontouchmove={(e: TouchEvent) => swipe.handleTouchMove(e)}
			ontouchend={() => swipe.handleTouchEnd()}
			in:fly={{
				y: isIOS ? 60 : 40,
				duration: isIOS ? 400 : 250,
				easing: isIOS ? backOut : cubicOut
			}}
			out:fly={{ y: isIOS ? 100 : 30, duration: isIOS ? 300 : 200, easing: cubicOut }}
		>
			<button
				onclick={() => modalStore.closeModal()}
				class="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white backdrop-blur-sm transition-colors outline-none hover:bg-black/30 md:top-4 md:right-4"
				aria-label="Close modal"
			>
				<X size={20} />
			</button>

			<div
				class="modal-layout flex h-full flex-col md:grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr]"
			>
				<!-- Image Section -->
				<div
					class="modal-image-container relative flex-1 overflow-hidden rounded-t-xl md:flex-none md:shrink-0 md:rounded-l-xl md:rounded-tr-none"
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
								alt="{$modalStore.activeGame.title} cover"
								class="modal-cover-image h-full w-full cursor-pointer object-cover transition-transform"
								class:swiping={swipe.isSwipeTransitioning}
								loading="eager"
								onload={handleImageLoad}
								onerror={handleImageError}
							/>
						</button>
					</div>
				</div>

				<!-- Details Section -->
				<div
					class="modal-details-section shrink-0 overflow-hidden px-5 pt-4 pb-4 md:flex-1 md:overflow-y-auto md:pb-6 lg:pr-8 lg:pb-5 lg:pl-8"
				>
					<ModalHeader
						game={$modalStore.activeGame}
						{isEditor}
						onEdit={onEditGame}
						onDelete={onDeleteGame}
					/>
					<ModalMetadata game={$modalStore.activeGame} />
					<ModalRatings game={$modalStore.activeGame} />
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Keep existing animations/styles but minimize inline styles where possible */
	.swipe-hint-overlay {
		position: fixed;
		inset: 0;
		z-index: 70;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(2px);
	}
	.swipe-hint-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		animation: pulse-hint 2s infinite;
	}
	.swipe-hint-svg {
		width: 100px;
		height: 80px;
		margin-bottom: 16px;
	}
	.swipe-arrow {
		transform-origin: center;
		animation: swipe-hint-anim 2s infinite;
	}
	.swipe-arrow-left {
		animation-delay: 0s;
	}
	.swipe-arrow-right {
		animation-delay: 1s;
	}
	.swipe-arrow-down {
		animation-name: swipe-down-anim;
		animation-duration: 2s;
		animation-iteration-count: infinite;
	}

	@keyframes swipe-hint-anim {
		0%,
		100% {
			transform: translateX(0);
			opacity: 0.3;
		}
		50% {
			transform: translateX(10px);
			opacity: 1;
		}
	}
	@keyframes swipe-down-anim {
		0%,
		100% {
			transform: translateY(0);
			opacity: 0.3;
		}
		50% {
			transform: translateY(10px);
			opacity: 1;
		}
	}

	.parallax-preview {
		position: fixed;
		top: 50%;
		left: 50%;
		width: 90vw;
		max-width: 450px;
		height: 80vh;
		max-height: 800px;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
		z-index: 55;
		margin-left: -45vw;
		margin-top: -40vh;
		pointer-events: none;
	}
	@media (min-width: 768px) {
		.parallax-preview {
			width: 60vw;
			max-width: 900px;
			margin-left: -30vw;
		}
	}
</style>

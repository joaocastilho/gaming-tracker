<script lang="ts">
	// Svelte 5 Runes - no legacy lifecycle imports needed
	import { fade, fly } from 'svelte/transition';
	import { cubicOut, backOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { modalStore } from '$lib/stores/modal.svelte';
	import { gamesStore } from '$lib/stores/games.svelte';
	import { offlineStore } from '$lib/stores/offline.svelte';
	import type { Game } from '$lib/types/game.js';
	import { ChevronLeft, ChevronRight, X } from 'lucide-svelte';

	import { SwipeController } from './detail-modal/SwipeController.svelte';
	import GameDetailCard from './detail-modal/GameDetailCard.svelte';

	interface Props {
		onEditGame?: (game: Game) => void;
		onDeleteGame?: (game: Game) => void;
	}

	let { onEditGame, onDeleteGame }: Props = $props();

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
	const OFFLINE_FALLBACK_DATA_URI =
		'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

	function getPreviewImageSrc(coverImage: string | undefined): string {
		let isOffline = !offlineStore.isOnline;
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

	function navigateToPrevious(skipTransition = false) {
		if (currentGameIndex > 0) {
			const prevGame = displayedGames[currentGameIndex - 1];
			modalStore.openViewModal(prevGame, displayedGames);
		}
	}

	function navigateToNext(skipTransition = false) {
		if (currentGameIndex < displayedGames.length - 1) {
			const nextGame = displayedGames[currentGameIndex + 1];
			modalStore.openViewModal(nextGame, displayedGames);
		}
	}

	// Swipe Controller
	const swipe = new SwipeController(
		navigateToNext,
		navigateToPrevious,
		() => nextGamePreview,
		() => prevGamePreview,
		dismissSwipeHint
	);

	// Full-screen Image Logic
	let isImageExpanded = $state(false);

	function toggleImageExpansion() {
		if (window.innerWidth < 768) {
			isImageExpanded = !isImageExpanded;
		}
	}

	// Interaction Handlers
	function handleKeydown(event: KeyboardEvent) {
		if (!$modalStore.isOpen || $modalStore.mode !== 'view') return;

		if (event.key === 'Escape') {
			event.preventDefault();
			if (isImageExpanded) {
				isImageExpanded = false;
			} else {
				modalStore.closeModal();
			}
		} else if (!isImageExpanded) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				navigateToPrevious();
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				navigateToNext();
			}
		}
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

	// Effect to manage keyboard event listeners based on modal state
	$effect(() => {
		if (!browser) return;

		// Only add listener when modal is open in view mode
		if ($modalStore.isOpen && $modalStore.mode === 'view') {
			document.addEventListener('keydown', handleKeydown, true);

			// Cleanup function removes listener when modal closes or component destroys
			return () => {
				document.removeEventListener('keydown', handleKeydown, true);
			};
		}
	});

	// Effect to manage body overflow when modal opens/closes
	$effect(() => {
		if (!browser) return;

		if ($modalStore.isOpen || isImageExpanded) {
			document.body.style.overflow = 'hidden';
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		}

		// Cleanup to ensure styles are reset when component destroys
		return () => {
			document.body.style.overflow = '';
			document.documentElement.style.overflow = '';
		};
	});

	// Effect to clear swipe timeouts when component is destroyed
	$effect(() => {
		return () => {
			if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
			if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
		};
	});
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<div
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-3 backdrop-blur-[4px] md:p-4"
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
				class="swipe-hint-overlay pointer-events-none md:hidden"
				transition:fade={{ duration: 400 }}
				aria-hidden="true"
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
				</div>
			</div>
		{/if}

		<!-- Previous Game Card (Full Preview) -->
		{#if prevGamePreview && swipe.swipeDirection === 'right'}
			<div
				class="pointer-events-none absolute inset-0 z-[59] flex items-center justify-center p-3 md:p-4"
			>
				<div
					class="modal-content flex h-full min-h-0 max-w-full flex-col overflow-hidden bg-neutral-900 shadow-2xl md:h-auto md:max-h-[85vh] md:max-w-[1000px] md:rounded-xl md:shadow-2xl"
					class:ios-modal={isIOS}
					class:android-modal={isAndroid}
					style="
						background-color: {prevGamePreview.status === 'Completed'
						? 'var(--color-surface-completed)'
						: 'var(--color-surface)'};
						transform: translateX(calc(-{swipe.offsetMagnitude}px + {swipe.swipeOffsetX}px)) translateY({swipe.swipeOffsetY}px);
					"
				>
					<GameDetailCard game={prevGamePreview} />
				</div>
			</div>
		{/if}

		<!-- Next Game Card (Full Preview) -->
		{#if nextGamePreview && swipe.swipeDirection === 'left'}
			<div
				class="pointer-events-none absolute inset-0 z-[59] flex items-center justify-center p-3 md:p-4"
			>
				<div
					class="modal-content flex h-full min-h-0 max-w-full flex-col overflow-hidden bg-neutral-900 shadow-2xl md:h-auto md:max-h-[85vh] md:max-w-[1000px] md:rounded-xl md:shadow-2xl"
					class:ios-modal={isIOS}
					class:android-modal={isAndroid}
					style="
						background-color: {nextGamePreview.status === 'Completed'
						? 'var(--color-surface-completed)'
						: 'var(--color-surface)'};
						transform: translateX(calc({swipe.offsetMagnitude}px + {swipe.swipeOffsetX}px)) translateY({swipe.swipeOffsetY}px);
					"
				>
					<GameDetailCard game={nextGamePreview} />
				</div>
			</div>
		{/if}

		<!-- Desktop Nav Arrows -->
		{#if currentGameIndex > 0}
			<button
				onclick={() => navigateToPrevious()}
				class="nav-arrow-btn absolute top-1/2 left-[calc(50%-600px)] z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 md:flex"
				aria-label="Previous game"
			>
				<ChevronLeft size={28} />
			</button>
		{/if}
		{#if currentGameIndex < displayedGames.length - 1}
			<button
				onclick={() => navigateToNext()}
				class="nav-arrow-btn absolute top-1/2 right-[calc(50%-600px)] z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 md:flex"
				aria-label="Next game"
			>
				<ChevronRight size={28} />
			</button>
		{/if}

		<!-- Main Modal Content -->
		<div
			class="modal-content relative flex h-full min-h-0 max-w-full flex-col overflow-hidden bg-neutral-900 md:h-auto md:max-h-[85vh] md:max-w-[1000px] md:rounded-xl md:shadow-2xl"
			class:ios-modal={isIOS}
			class:android-modal={isAndroid}
			class:swiping-close={swipe.isClosingGesture}
			style="background-color: {$modalStore.activeGame.status === 'Completed'
				? 'var(--color-surface-completed)'
				: 'var(--color-surface)'}; 
				transform: translateX({swipe.swipeOffsetX}px) translateY({swipe.swipeOffsetY}px); 
				opacity: {1 - Math.abs(swipe.swipeOffsetX) * 0.0005 - swipe.swipeOffsetY * 0.0005};
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
			<GameDetailCard
				game={$modalStore.activeGame}
				{onEditGame}
				{onDeleteGame}
				onClose={() => modalStore.closeModal()}
				onImageClick={toggleImageExpansion}
			/>
		</div>

		<!-- Full-screen Image Overlay -->
		{#if isImageExpanded}
			<div
				class="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity"
				transition:fade={{ duration: 250 }}
				onclick={toggleImageExpansion}
				onkeydown={(e: KeyboardEvent) =>
					(e.key === 'Escape' || e.key === 'Enter') && toggleImageExpansion()}
				role="button"
				tabindex="0"
				aria-label="Close full screen view"
			>
				<img
					src={getPreviewImageSrc($modalStore.activeGame.coverImage)}
					alt="{$modalStore.activeGame.title} cover full screen"
					class="max-h-full max-w-full object-contain"
				/>
				<button
					class="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
					onclick={(e) => {
						e.stopPropagation();
						toggleImageExpansion();
					}}
				>
					<X size={24} />
				</button>
			</div>
		{/if}
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
	@media (orientation: landscape) and (max-height: 1000px) {
		:global(.modal-content) {
			height: 100% !important;
			max-height: none !important;
			max-width: none !important;
			width: 100% !important;
			border-radius: 0 !important;
		}
	}
</style>

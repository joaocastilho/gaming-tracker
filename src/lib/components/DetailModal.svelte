<script lang="ts">
import { fade, fly, type FlyParams } from 'svelte/transition';
import { cubicOut, backOut } from 'svelte/easing';
import { browser } from '$app/env';
import { modalStore } from '#lib/stores/modal.svelte.js';
import { gamesStore } from '#lib/stores/games.svelte.js';
import { offlineStore } from '#lib/stores/offline.svelte.js';
import { imageErrorStore } from '#lib/stores/imageErrors.svelte.js';
import { windowSize } from '#lib/stores/window.svelte.js';
import { preloadImage } from '#lib/utils/imagePreload.js';
import { prefersReducedMotion } from '#lib/utils/motion.js';
import type { Game } from '#lib/types/game.js';
import { ChevronLeft, ChevronRight, X } from '@lucide/svelte';

import { SwipeController } from './detail-modal/SwipeController.svelte';
import GameDetailCard from './detail-modal/GameDetailCard.svelte';
import ContinuumPreview from './detail-modal/ContinuumPreview.svelte';
import { getContinuumNeighbors, getContinuumPreviewCount } from './detail-modal/continuumNeighbors';
import {
	ContinuumDragTracker,
	ContinuumWheelNavigator,
	constrainContinuumOffset,
	toContinuumCardOffset,
} from './detail-modal/continuumGestures';

interface Props {
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
}

let { onEditGame, onDeleteGame }: Props = $props();

let modalState = $derived(modalStore.getState());
let isModalOpen = $derived(modalState.isOpen);
let isViewMode = $derived(modalState.mode === 'view');

let isIOS = $state(false);
let isAndroid = $state(false);

$effect(() => {
	if (browser) {
		const ua = navigator.userAgent;
		isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		isAndroid = /Android/.test(ua);
	}
});

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

function getPreviewImageSrc(coverImage: string | undefined): string {
	let isOffline = !offlineStore.isOnline;
	if (isOffline) return OFFLINE_FALLBACK_DATA_URI;
	if (!coverImage || coverImage.includes('placeholder_cover')) return PLACEHOLDER_SRC;

	const absCoverImage = coverImage.startsWith('/') ? coverImage : `/${coverImage}`;
	const detailPath = absCoverImage.replace('.webp', '-detail.webp');
	return imageErrorStore.hasFailed(detailPath) ? PLACEHOLDER_SRC : detailPath;
}

let displayedGames = $derived.by(() => {
	if (modalState.displayedGames.length > 0) return modalState.displayedGames;
	const allGames = gamesStore.games;
	if (allGames.length === 0) return [];
	return modalStore.getReactiveNavigationGames(allGames);
});

let currentGameIndex = $derived.by(() => {
	if (!modalState.activeGame) return -1;
	return displayedGames.findIndex((game) => game.id === modalState.activeGame?.id);
});

let nextGamePreview = $derived(
	currentGameIndex < displayedGames.length - 1 ? displayedGames[currentGameIndex + 1] : null
);
let prevGamePreview = $derived(currentGameIndex > 0 ? displayedGames[currentGameIndex - 1] : null);

type ContinuumPhase = 'idle' | 'settling' | 'exiting';

let continuumTurnDirection = $state<1 | -1>(1);
let continuumPhase = $state<ContinuumPhase>('idle');
let continuumDragOffset = $state(0);
let isContinuumDragging = $state(false);
let turnTargetGame = $state<Game | null>(null);
let overlayElement = $state<HTMLDivElement>();
let suppressClickUntil = 0;
let activePointerId: number | null = null;
let transitionToken = 0;

let prevCardGame = $derived(
	continuumPhase === 'exiting' && continuumTurnDirection === -1 && turnTargetGame ? turnTargetGame : prevGamePreview
);
let nextCardGame = $derived(
	continuumPhase === 'exiting' && continuumTurnDirection === 1 && turnTargetGame ? turnTargetGame : nextGamePreview
);

let visibleGames = $derived.by((): { game: Game; pos: number }[] => {
	const result = [];
	if (prevCardGame) result.push({ game: prevCardGame, pos: -1 });
	if (modalState.activeGame) result.push({ game: modalState.activeGame, pos: 0 });
	if (nextCardGame) result.push({ game: nextCardGame, pos: 1 });
	return result as { game: Game; pos: number }[];
});

let modalHasOpened = $state(false);

$effect(() => {
	if (isModalOpen) {
		const t = setTimeout(() => {
			modalHasOpened = true;
		}, 100);
		return () => {
			clearTimeout(t);
			modalHasOpened = false;
		};
	}
});

const wheelNavigator = new ContinuumWheelNavigator();
const dragTracker = new ContinuumDragTracker();

const CONTINUUM_EXIT_DISTANCE = 420;
const CONTINUUM_ENTER_OFFSET = 260;
const CONTINUUM_MIN_RELEASE_TRAVEL = 160;
const CONTINUUM_TURN_MS = 240;
const CONTINUUM_SETTLE_MS = 260;

const continuumPreviewCount = $derived(isIOS || isAndroid ? 0 : getContinuumPreviewCount(windowSize.width));
const isContinuum = $derived(continuumPreviewCount > 0);
const continuumNeighbors = $derived(getContinuumNeighbors(displayedGames, currentGameIndex, continuumPreviewCount));
const canGoPrevious = $derived(currentGameIndex > 0);
const canGoNext = $derived(currentGameIndex < displayedGames.length - 1);
const continuumDragProgress = $derived(isContinuum ? Math.max(-1, Math.min(1, continuumDragOffset / 260)) : 0);
const previousDragEmphasis = $derived(Math.max(0, continuumDragProgress));
const nextDragEmphasis = $derived(Math.max(0, -continuumDragProgress));
const previewEnterX = $derived(continuumTurnDirection === 1 ? 40 : -40);
const previewEnterDuration = $derived(prefersReducedMotion() || !modalHasOpened ? 0 : 200);

// Preload next/prev cover images to prevent browser rendering flicker during navigation
$effect(() => {
	if (!browser) return;
	for (let step = -2; step <= 2; step++) {
		if (step === 0) continue;
		const candidate = displayedGames[currentGameIndex + step];
		if (candidate?.coverImage) {
			preloadImage(getPreviewImageSrc(candidate.coverImage));
		}
	}
});

function conditionalFly(node: HTMLElement, { condition, ...config }: FlyParams & { condition?: boolean }) {
	if (!condition) return { duration: 0, delay: 0 };

	const bypassTransition = !isIOS && !isAndroid && modalHasOpened;
	if (bypassTransition) return { duration: 0, delay: 0 };
	return fly(node, config);
}

function getIncomingProgress(pos: number): number {
	if (pos === 1 && continuumDragOffset < 0) {
		return Math.min(1, -continuumDragOffset / CONTINUUM_EXIT_DISTANCE);
	}
	if (pos === -1 && continuumDragOffset > 0) {
		return Math.min(1, continuumDragOffset / CONTINUUM_EXIT_DISTANCE);
	}
	return 0;
}

function isTouchSwipeActive(): boolean {
	return swipe.swipeDirection !== null || swipe.swipeOffsetX !== 0 || swipe.swipeOffsetY !== 0;
}

function getCardTransform(pos: number, isCurrent: boolean): string {
	const x = pos * swipe.offsetMagnitude + swipe.swipeOffsetX + (isCurrent ? continuumDragOffset : 0);
	const y = swipe.swipeOffsetY;

	if (!isContinuum || isTouchSwipeActive()) {
		return `translateX(${x}px) translateY(${y}px)`;
	}

	if (!isCurrent) {
		const progress = getIncomingProgress(pos);
		const visualX = pos * CONTINUUM_ENTER_OFFSET * (1 - progress);
		const cardX = Number(toContinuumCardOffset(visualX).toFixed(2));
		return `translate3d(${cardX}px, 0px, 0) scale(1)`;
	}

	// Keep scale constant at 1 so Firefox WebRender and Chromium never
	// re-rasterise the zoomed card's picture cache tiles during a drag or turn.
	const cardX = Number(toContinuumCardOffset(continuumDragOffset).toFixed(2));
	const cardY = Number(toContinuumCardOffset(y).toFixed(2));

	return `translate3d(${cardX}px, ${cardY}px, 0) scale(1)`;
}

function getCardOpacity(pos: number, isCurrent: boolean): number {
	if (isContinuum && !isTouchSwipeActive()) {
		if (!isCurrent) {
			return Number(getIncomingProgress(pos).toFixed(3));
		}
		// Keep opacity at 1 while dragging so Firefox WebRender does not allocate
		// an offscreen group surface for the zoomed card + box-shadow mid-drag.
		return continuumPhase === 'exiting' ? 0 : 1;
	}

	if (!isCurrent) return 1;

	return 1 - (Math.abs(swipe.swipeOffsetX) * 0.0005 + Math.max(0, swipe.swipeOffsetY) * 0.0005);
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function commitNavigation(direction: 1 | -1): void {
	const target = direction === 1 ? nextGamePreview : prevGamePreview;
	if (!target) return;
	modalStore.openViewModal(target, displayedGames, undefined, modalStore.cardRect ?? undefined);
}

/**
 * Springs both the active card and the peeked neighbour back to their resting
 * positions when a drag ends without turning the page.
 */
async function settleContinuumDrag(): Promise<void> {
	if (continuumDragOffset === 0) {
		continuumPhase = 'idle';
		return;
	}

	const token = ++transitionToken;
	continuumTurnDirection = continuumDragOffset < 0 ? 1 : -1;
	continuumPhase = 'settling';
	continuumDragOffset = 0;

	await delay(CONTINUUM_SETTLE_MS);
	if (token !== transitionToken) return;
	continuumPhase = 'idle';
}

/**
 * Slides the current card out while simultaneously gliding the incoming
 * neighbour card into the centre, then commits the active game swap once the
 * incoming card is already resting at translate3d(0px, 0px, 0) scale(1).
 */
async function runContinuumTurn(direction: 1 | -1, commit: () => void, targetGame?: Game): Promise<void> {
	if (continuumPhase === 'exiting') return;

	const token = ++transitionToken;
	if (activePointerId !== null) {
		dragTracker.cancel();
		stopPointerTracking();
	}
	isContinuumDragging = false;

	const adjacentGame = direction === 1 ? nextGamePreview : prevGamePreview;
	turnTargetGame = targetGame && targetGame.id !== adjacentGame?.id ? targetGame : null;

	const draggedInDirection = Math.max(0, -direction * continuumDragOffset);
	const exitDistance = Math.max(CONTINUUM_EXIT_DISTANCE, draggedInDirection + CONTINUUM_MIN_RELEASE_TRAVEL);

	continuumPhase = 'exiting';
	continuumDragOffset = -direction * exitDistance;

	await delay(CONTINUUM_TURN_MS);
	if (token !== transitionToken) return;
	if (!isModalOpen) return;

	continuumDragOffset = 0;
	continuumPhase = 'idle';
	turnTargetGame = null;
	commit();
}

function navigateBy(direction: 1 | -1, skipTransition = false): void {
	const canNavigate = direction === 1 ? canGoNext : canGoPrevious;
	if (!canNavigate) return;
	if (isContinuum && continuumPhase === 'exiting') return;

	continuumTurnDirection = direction;

	if (!isContinuum || prefersReducedMotion() || skipTransition) {
		transitionToken++;
		continuumPhase = 'idle';
		turnTargetGame = null;
		continuumDragOffset = 0;
		commitNavigation(direction);
		return;
	}

	void runContinuumTurn(direction, () => commitNavigation(direction));
}

function focusDialog(): void {
	overlayElement?.focus({ preventScroll: true });
}

function selectContinuumGame(game: Game): void {
	const index = displayedGames.findIndex((candidate) => candidate.id === game.id);
	if (index < 0 || index === currentGameIndex) return;

	const direction = index < currentGameIndex ? -1 : 1;

	if (!isContinuum || prefersReducedMotion()) {
		transitionToken++;
		continuumPhase = 'idle';
		turnTargetGame = null;
		continuumDragOffset = 0;
		continuumTurnDirection = direction;
		modalStore.openViewModal(game, displayedGames, undefined, modalStore.cardRect ?? undefined);
		focusDialog();
		return;
	}

	if (continuumPhase === 'exiting') return;
	continuumTurnDirection = direction;

	void runContinuumTurn(
		direction,
		() => {
			modalStore.openViewModal(game, displayedGames, undefined, modalStore.cardRect ?? undefined);
		},
		game
	);
	focusDialog();
}

function handleOverlayClick(event: MouseEvent): void {
	if (event.target !== event.currentTarget) return;
	if (performance.now() < suppressClickUntil) return;
	modalStore.closeModal();
}

function isDragHandleTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest('[data-continuum-drag-handle]') !== null;
}

function isCardTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest('.modal-content') !== null;
}

const INTERACTIVE_CARD_SELECTOR =
	'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]';

function isInteractiveCardTarget(target: EventTarget | null): boolean {
	return target instanceof Element && target.closest(INTERACTIVE_CARD_SELECTOR) !== null;
}

function handleContinuumPointerDown(event: PointerEvent): void {
	if (!isContinuum || continuumPhase === 'exiting') return;
	if (event.pointerType !== 'mouse' || event.button !== 0) return;
	if (activePointerId !== null) cancelPointerGesture();

	const onBackdrop = event.target === overlayElement;
	if (!onBackdrop) {
		if (!isCardTarget(event.target)) return;
		if (!isDragHandleTarget(event.target) && isInteractiveCardTarget(event.target)) return;
		event.preventDefault();
	}

	if (continuumPhase === 'settling') {
		transitionToken++;
		continuumPhase = 'idle';
	}

	activePointerId = event.pointerId;
	dragTracker.start(event.clientX, event.clientY, performance.now());

	window.addEventListener('pointermove', handleContinuumPointerMove);
	window.addEventListener('pointerup', handleContinuumPointerUp);
	window.addEventListener('pointercancel', handleContinuumPointerCancel);
	window.addEventListener('blur', handleWindowBlur);
}

function handleContinuumPointerMove(event: PointerEvent): void {
	if (event.pointerId !== activePointerId) return;

	// A release outside the window can miss pointerup. The next hover move
	// reports no buttons and is the only signal that the gesture is over.
	if ((event.buttons & 1) === 0) {
		finishPointerGesture(performance.now());
		return;
	}

	const movement = dragTracker.move(event.clientX, event.clientY, performance.now());
	if (!movement.active) return;

	if (!isContinuumDragging) {
		isContinuumDragging = true;
		window.getSelection()?.removeAllRanges();
	}

	const nextOffset = constrainContinuumOffset(movement.offset, {
		canGoPrevious,
		canGoNext,
	});
	if (nextOffset !== continuumDragOffset) {
		continuumDragOffset = nextOffset;
		if (continuumDragOffset !== 0) {
			continuumTurnDirection = continuumDragOffset < 0 ? 1 : -1;
		}
	}
	event.preventDefault();
}

/** Completes a gesture from its last tracked position, even without a pointerup. */
function finishPointerGesture(now: number): void {
	const wasDragging = isContinuumDragging;
	const direction = dragTracker.end(now);
	stopPointerTracking();

	if (wasDragging) suppressClickUntil = now + 350;

	const canNavigate = direction === 1 ? canGoNext : direction === -1 ? canGoPrevious : false;

	if (direction !== 0 && canNavigate) {
		navigateBy(direction);
	} else {
		void settleContinuumDrag();
	}
}

function handleContinuumPointerUp(event: PointerEvent): void {
	if (event.pointerId !== activePointerId) return;
	finishPointerGesture(performance.now());
}

function handleContinuumPointerCancel(event: PointerEvent): void {
	if (event.pointerId !== activePointerId) return;
	cancelPointerGesture();
}

function handleWindowBlur(): void {
	if (activePointerId !== null) cancelPointerGesture();
}

function cancelPointerGesture(): void {
	dragTracker.cancel();
	stopPointerTracking();
	void settleContinuumDrag();
}

function stopPointerTracking(): void {
	activePointerId = null;
	isContinuumDragging = false;

	window.removeEventListener('pointermove', handleContinuumPointerMove);
	window.removeEventListener('pointerup', handleContinuumPointerUp);
	window.removeEventListener('pointercancel', handleContinuumPointerCancel);
	window.removeEventListener('blur', handleWindowBlur);
}

const swipe = new SwipeController(
	(skip) => navigateBy(1, skip),
	(skip) => navigateBy(-1, skip),
	() => nextGamePreview,
	() => prevGamePreview,
	dismissSwipeHint
);

let isImageExpanded = $state(false);

function toggleImageExpansion() {
	if (window.innerWidth < 768) {
		isImageExpanded = !isImageExpanded;
	}
}

function handleKeydown(event: KeyboardEvent) {
	if (!isModalOpen || !isViewMode) return;

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
			navigateBy(-1);
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			navigateBy(1);
		}
	}
}

const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';
let showSwipeIndicator = $state(false);
let swipeIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;
let swipeHideTimeout: ReturnType<typeof setTimeout> | null = null;
let hasTriggeredHint = false;

$effect(() => {
	const games = displayedGames;
	if (!browser || !isModalOpen || !isViewMode) return;

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

$effect(() => {
	if (!browser) return;

	// Only add listener when modal is open in view mode
	if (isModalOpen && isViewMode) {
		document.addEventListener('keydown', handleKeydown, true);

		// Cleanup function removes listener when modal closes or component destroys
		return () => {
			document.removeEventListener('keydown', handleKeydown, true);
		};
	}
});

$effect(() => {
	if (!browser || !overlayElement) return;

	const node = overlayElement;
	wheelNavigator.reset();

	const handleWheel = (event: WheelEvent) => {
		if (!isContinuum || !isModalOpen) return;

		const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
		const direction = wheelNavigator.push(event.deltaX, event.deltaY);
		if (horizontal) event.preventDefault();

		if (direction === 1) navigateBy(1);
		else if (direction === -1) navigateBy(-1);
	};

	node.addEventListener('wheel', handleWheel, { passive: false });
	return () => node.removeEventListener('wheel', handleWheel);
});

$effect(() => {
	if (!browser || !overlayElement) return;

	const node = overlayElement;
	const suppressDragClick = (event: MouseEvent) => {
		if (performance.now() < suppressClickUntil) {
			event.preventDefault();
			event.stopPropagation();
		}
	};

	node.addEventListener('click', suppressDragClick, true);
	return () => node.removeEventListener('click', suppressDragClick, true);
});

$effect(() => {
	if (isModalOpen) return;

	transitionToken++;
	continuumPhase = 'idle';
	turnTargetGame = null;
	isContinuumDragging = false;
	continuumDragOffset = 0;

	if (activePointerId !== null) {
		dragTracker.cancel();
		stopPointerTracking();
	}
});

$effect(() => {
	return () => {
		window.removeEventListener('pointermove', handleContinuumPointerMove);
		window.removeEventListener('pointerup', handleContinuumPointerUp);
		window.removeEventListener('pointercancel', handleContinuumPointerCancel);
		window.removeEventListener('blur', handleWindowBlur);
	};
});

$effect(() => {
	if (!browser) return;

	if (isModalOpen || isImageExpanded) {
		document.body.classList.add('no-scroll');
		document.documentElement.classList.add('no-scroll');
	} else {
		document.body.classList.remove('no-scroll');
		document.documentElement.classList.remove('no-scroll');
	}

	// Cleanup to ensure styles are reset when component destroys
	return () => {
		document.body.classList.remove('no-scroll');
		document.documentElement.classList.remove('no-scroll');
	};
});

$effect(() => {
	return () => {
		if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
		if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
	};
});
</script>

{#if isModalOpen && modalState.activeGame && isViewMode}
	<div
		bind:this={overlayElement}
		class="fixed inset-0 z-[60] flex items-center justify-center bg-black md:bg-black/80 md:p-4 md:backdrop-blur-[4px]"
		class:continuum-overlay={isContinuum}
		class:continuum-dragging={isContinuumDragging}
		style="--continuum-turn-duration: {CONTINUUM_TURN_MS}ms; --continuum-settle-duration: {CONTINUUM_SETTLE_MS}ms;"
		transition:fade={{ duration: isIOS ? 250 : 200 }}
		onclick={handleOverlayClick}
		onpointerdown={handleContinuumPointerDown}
		ondragstart={(e: DragEvent) => {
			if (isContinuum) e.preventDefault();
		}}
		onkeydown={(e: KeyboardEvent) => {
			if (e.key === 'Escape') modalStore.closeModal();
		}}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<p class="sr-only" aria-live="polite" aria-atomic="true">
			Now viewing {modalState.activeGame?.title ?? ''}
		</p>

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
						></path>
						<path
							class="swipe-arrow swipe-arrow-down"
							d="M55 58 L60 63 L65 58 M55 66 L60 71 L65 66"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
						<path
							class="swipe-arrow swipe-arrow-right"
							d="M100 33 L107 40 L100 47 M90 33 L97 40 L90 47"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						></path>
					</svg>
					<span class="swipe-hint-text">Swipe to navigate</span>
				</div>
			</div>
		{/if}

		<!-- Desktop Nav Arrows -->
		{#if !isIOS && !isAndroid && displayedGames.length > 1}
			{#if currentGameIndex > 0}
				<button
					onclick={(e) => {
						e.stopPropagation();
						navigateBy(-1);
					}}
					class="nav-arrow-btn absolute top-1/2 left-[calc(50%-568px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
					aria-label="Previous game"
				>
					<ChevronLeft size={28} />
				</button>
			{/if}
			{#if currentGameIndex < displayedGames.length - 1}
				<button
					onclick={(e) => {
						e.stopPropagation();
						navigateBy(1);
					}}
					class="nav-arrow-btn absolute top-1/2 right-[calc(50%-568px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
					aria-label="Next game"
				>
					<ChevronRight size={28} />
				</button>
			{/if}
		{/if}

		{#if isContinuum}
			<div class="pointer-events-none absolute inset-0 z-[58]">
				{#each continuumNeighbors.previous as game, index (game.id)}
					<ContinuumPreview
						{game}
						direction="previous"
						depth={index === 1 ? 1 : 0}
						emphasis={previousDragEmphasis}
						enterFromX={previewEnterX}
						enterDuration={previewEnterDuration}
						onSelect={selectContinuumGame}
					/>
				{/each}
				{#each continuumNeighbors.next as game, index (game.id)}
					<ContinuumPreview
						{game}
						direction="next"
						depth={index === 1 ? 1 : 0}
						emphasis={nextDragEmphasis}
						enterFromX={previewEnterX}
						enterDuration={previewEnterDuration}
						onSelect={selectContinuumGame}
					/>
				{/each}
			</div>
		{/if}

		{#each visibleGames as { game, pos } (game.id)}
			{@const isCurrent = pos === 0}
			{@const isIncomingNeighbor =
				(pos === 1 && continuumTurnDirection === 1) || (pos === -1 && continuumTurnDirection === -1)}
			{@const isVisible =
				isCurrent ||
				isContinuum ||
				(pos === -1 && swipe.swipeDirection === 'right') ||
				(pos === 1 && swipe.swipeDirection === 'left')}
			<div
				class="absolute inset-0 flex items-center justify-center pointer-events-none md:p-4 {isCurrent
					? 'z-[60]'
					: 'z-[59]'}"
				style="visibility: {isVisible ? 'visible' : 'hidden'};"
				aria-hidden={!isCurrent ? 'true' : undefined}
			>
				<div
					class="modal-content relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-900 md:h-auto md:max-h-[min(600px,calc((100dvh_-_32px)/1.1))] md:w-[960px] md:max-w-[calc(100%/1.1)] md:cursor-grab md:rounded-xl {isCurrent
						? 'pointer-events-auto shadow-2xl md:shadow-2xl'
						: ''} {isIOS
						? 'ios-modal'
						: ''} {isAndroid ? 'android-modal' : ''} {isCurrent && swipe.isClosingGesture
						? 'swiping-close'
						: ''}"
					class:continuum-card={isContinuum}
					class:continuum-settling={isContinuum &&
						!isContinuumDragging &&
						continuumPhase === 'settling' &&
						(isCurrent || isIncomingNeighbor)}
					class:continuum-exiting={isContinuum &&
						continuumPhase === 'exiting' &&
						(isCurrent || isIncomingNeighbor)}
					style:background-color={game.status === 'Completed'
						? 'var(--color-surface-completed)'
						: game.status === 'Playing'
							? 'var(--color-surface-playing, var(--color-surface))'
							: 'var(--color-surface)'}
					style:transform={getCardTransform(pos, isCurrent)}
					style:opacity={getCardOpacity(pos, isCurrent)}
					style:border-radius="{isCurrent ? 12 + Math.max(0, swipe.swipeOffsetY) * 0.1 : 12}px"
					style:will-change={isContinuum ? 'transform, opacity' : isCurrent ? 'transform' : 'auto'}
					role={isCurrent ? 'document' : undefined}
					ontouchstart={isCurrent ? (e) => swipe.handleTouchStart(e) : undefined}
					ontouchmove={isCurrent ? (e) => swipe.handleTouchMove(e) : undefined}
					ontouchend={isCurrent ? () => swipe.handleTouchEnd() : undefined}
					in:conditionalFly={{
						condition: isCurrent,
						y: isIOS ? 60 : 40,
						duration: isIOS ? 400 : 250,
						easing: isIOS ? backOut : cubicOut
					}}
					out:conditionalFly={{
						condition: isCurrent,
						y: isIOS ? 100 : 30,
						duration: isIOS ? 300 : 200,
						easing: cubicOut
					}}
				>
					<GameDetailCard
						game={game}
						onEditGame={isCurrent ? onEditGame : undefined}
						onDeleteGame={isCurrent ? onDeleteGame : undefined}
						onClose={isCurrent ? () => modalStore.closeModal() : undefined}
						onImageClick={isCurrent ? toggleImageExpansion : undefined}
					/>
				</div>
			</div>
		{/each}

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
					src={getPreviewImageSrc(modalState.activeGame?.coverImage || '')}
					alt="{modalState.activeGame?.title || 'Game'} cover full screen"
					class="max-h-full max-w-full object-contain"
					onerror={(e) => {
						const target = e.target as HTMLImageElement;
						const failedSrc = target?.currentSrc || target?.src;
						if (failedSrc && !failedSrc.includes('placeholder_cover')) {
							imageErrorStore.markFailed(failedSrc);
							if (target) target.src = PLACEHOLDER_SRC;
						}
					}}
				/>
				<button
					class="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
					onclick={(e) => {
						e.stopPropagation();
						toggleImageExpansion();
					}}
					aria-label="Close full screen view"
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
	@media (min-width: 768px) {
		:global(.modal-content) {
			zoom: 1.1;
		}
	}

	/* Release physics: both the active card and the peeked neighbour spring back
	   on a cancelled drag, or glide simultaneously to their turn targets. */
	.continuum-settling {
		transition:
			transform var(--continuum-settle-duration, 260ms) cubic-bezier(0.22, 1, 0.36, 1),
			opacity 200ms ease-out;
	}

	.continuum-exiting {
		transition:
			transform var(--continuum-turn-duration, 240ms) cubic-bezier(0.22, 1, 0.36, 1),
			opacity var(--continuum-turn-duration, 240ms) cubic-bezier(0.22, 1, 0.36, 1);
	}

	/* Pressing on the details text would otherwise begin a text selection that
	   fights the drag before it passes its start threshold. */
	.continuum-card {
		user-select: none;
		backface-visibility: hidden;
	}

	.continuum-dragging,
	.continuum-dragging .modal-content,
	.continuum-dragging :global(.modal-cover-image) {
		user-select: none;
		cursor: grabbing;
	}

	/* Firefox/Zen WebRender re-runs backdrop-filter over the viewport whenever
	   a child layer moves, so the near-opaque fallback keeps drags cheap. */
	@supports (-moz-appearance: none) {
		.continuum-overlay {
			backdrop-filter: none !important;
			background-color: rgba(0, 0, 0, 0.85);
		}

		/* Shadowed card layers are re-rasterised on every transform update:
		   WebRender paints the blur against the layer's new subpixel position
		   instead of sliding a cached surface. Against the near-opaque overlay
		   the shadow is almost invisible, so drop it for the whole continuum
		   rather than hitch on drag start, release, and shadow restoration. */
		.continuum-overlay :global(.modal-content) {
			box-shadow: none !important;
		}

		/* WebRender snaps axis-aligned transform translations to whole device
		   pixels, so a slow drag advances the card in visible 1px steps instead
		   of tracking the pointer continuously. A 0.001deg rotation keeps the
		   layer off the snapping path; it moves the card's corners by under a
		   hundredth of a pixel and leaves text rendering unchanged. */
		.continuum-overlay :global(.modal-content) {
			rotate: 0.001deg;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.continuum-settling,
		.continuum-exiting {
			transition: none;
		}
	}

	/* Portrait tablets have a narrow details column, so the enlarged tier and
	   score badges stack instead of sharing a row. Give the shell enough height
	   to show both without hiding the score below a scroll. */
	@media (min-width: 768px) and (max-width: 899px) and (orientation: portrait) {
		:global(.modal-content) {
			max-height: min(660px, calc((100dvh - 32px) / 1.1)) !important;
		}
	}

	@media (orientation: landscape) and (max-height: 1000px) and (max-width: 1200px) {
		:global(.modal-content) {
			height: 100% !important;
			max-height: none !important;
			max-width: none !important;
			width: 100% !important;
			zoom: 1 !important;
			border-radius: 0 !important;
		}
	}
</style>

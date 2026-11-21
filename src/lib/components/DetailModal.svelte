<script lang="ts">
import { tick } from 'svelte';
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
import { focusTrap } from '#lib/utils/focusTrap.js';
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
let hasContinuumDragOffset = $state(false);
let continuumDragOffset = 0;
let isContinuumDragging = $state(false);
let turnTargetGame = $state<Game | null>(null);
let overlayElement = $state<HTMLDivElement>();
let suppressClickUntil = 0;
let activePointerId: number | null = null;
let transitionToken = 0;
let dragOriginOffset = 0;
let runningAnimations: Animation[] = [];
let fallbackAnimatedLayers: HTMLElement[] = [];

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

const CONTINUUM_ENTER_OFFSET = 260;
/**
 * Half the extra scroll-track width (`calc(100% + 1600px)`). Exceeds the 720px
 * drag asymptote on both sides and stays independent of viewport width.
 */
const CONTINUUM_SCROLL_CENTER = 800;
/** The 960px card renders 1056px wide through the 1.1 zoom. */
const CONTINUUM_CARD_WIDTH = 1056;
const CONTINUUM_TURN_MS = 260;
const CONTINUUM_SETTLE_MS = 260;
/** A full-viewport slide needs a balanced curve, not a front-loaded snap. */
const CONTINUUM_TURN_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const CONTINUUM_SETTLE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const continuumPreviewCount = $derived(isIOS || isAndroid ? 0 : getContinuumPreviewCount(windowSize.width));
const isContinuum = $derived(continuumPreviewCount > 0);
const continuumNeighbors = $derived(getContinuumNeighbors(displayedGames, currentGameIndex, continuumPreviewCount));
const canGoPrevious = $derived(currentGameIndex > 0);
const canGoNext = $derived(currentGameIndex < displayedGames.length - 1);
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

/** True while a drag, turn, or snap-back owns the cards. */
function isContinuumCardMotionActive(): boolean {
	return isContinuumDragging || continuumPhase === 'exiting' || continuumPhase === 'settling' || hasContinuumDragOffset;
}

/**
 * The incoming card waits at the centre while a gesture is active, so the drag
 * uncovers it instead of sliding it. At rest it waits offscreen.
 */
function getIncomingVisualOffset(direction: 1 | -1): number {
	return isContinuumCardMotionActive() ? 0 : direction * CONTINUUM_ENTER_OFFSET;
}

/**
 * A turn slides the outgoing card fully past the viewport edge. Fading it
 * instead would let the incoming card show through the overlap as a ghost.
 */
function getTurnExitDistance(): number {
	return windowSize.width / 2 + CONTINUUM_CARD_WIDTH / 2 + 16;
}

function isTouchSwipeActive(): boolean {
	return swipe.swipeDirection !== null || swipe.swipeOffsetX !== 0 || swipe.swipeOffsetY !== 0;
}

/** Solid surfaces keep the neighbour card from showing through while cards move. */
function getModalSurface(game: Game): string {
	const solid = isContinuum || isTouchSwipeActive();
	if (game.status === 'Completed') {
		return solid ? 'var(--color-surface-completed-solid)' : 'var(--color-surface-completed)';
	}
	if (game.status === 'Playing') {
		return solid
			? 'var(--color-surface-playing-solid, var(--color-surface-solid))'
			: 'var(--color-surface-playing, var(--color-surface))';
	}
	return solid ? 'var(--color-surface-solid)' : 'var(--color-surface)';
}

function isPreviewSuppressed(direction: 'previous' | 'next'): boolean {
	if (isContinuumDragging || continuumPhase === 'exiting' || continuumPhase === 'settling') {
		return (continuumTurnDirection === 1 ? 'next' : 'previous') === direction;
	}
	if (swipe.swipeDirection !== null) {
		return (swipe.swipeDirection === 'left' ? 'next' : 'previous') === direction;
	}
	return false;
}

function getCardTransform(pos: number, isCurrent: boolean): string {
	const x = pos * swipe.offsetMagnitude + swipe.swipeOffsetX + (isCurrent ? continuumDragOffset : 0);
	const y = swipe.swipeOffsetY;

	if (!isContinuum || isTouchSwipeActive()) {
		return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
	}

	if (!isCurrent) {
		const incoming = pos === continuumTurnDirection;
		const offset = incoming ? getIncomingVisualOffset(pos === 1 ? 1 : -1) : pos * CONTINUUM_ENTER_OFFSET;
		return `translate3d(${offset.toFixed(2)}px, 0px, 0)`;
	}

	return `translate3d(0px, ${y.toFixed(2)}px, 0)`;
}

function getCardOpacity(isCurrent: boolean, pos: number): number {
	if (isContinuum && !isTouchSwipeActive()) {
		if (!isCurrent) {
			// Only the card being turned to is revealed; the opposite neighbour
			// stays hidden so it cannot peek past the focused card's edge.
			return pos === continuumTurnDirection && isContinuumCardMotionActive() ? 1 : 0;
		}
		// The turn animation owns the active card's opacity; keeping it at 1
		// here stops Svelte from fighting the WAAPI animation.
		return 1;
	}

	if (!isCurrent) return 1;

	return 1 - (Math.abs(swipe.swipeOffsetX) * 0.0005 + Math.max(0, swipe.swipeOffsetY) * 0.0005);
}

/**
 * Activates the wide APZ scroll track on the active layer just before a
 * pointer drag begins. Keeping the track at 100% width at rest ensures the
 * card can never land shifted off-centre if a browser clamps scrollLeft during
 * a navigation swap.
 */
function enableContinuumScrollTrack(layer: HTMLElement | null): void {
	if (!layer || !isContinuum) return;
	if (!layer.classList.contains('continuum-scroll-ready')) {
		layer.classList.add('continuum-scroll-ready');
		const track = layer.firstElementChild;
		if (track instanceof HTMLElement) void track.offsetWidth;
		void layer.scrollWidth;
	}
	layer.scrollLeft = CONTINUUM_SCROLL_CENTER - continuumDragOffset;
}

function resetAllContinuumScrolls(): void {
	if (!overlayElement) return;
	for (const layer of overlayElement.querySelectorAll<HTMLElement>('[data-continuum-layer]')) {
		layer.classList.remove('continuum-scroll-ready');
		if (layer.scrollLeft !== 0) {
			layer.scrollLeft = 0;
		}
	}
}

/**
 * Updates horizontal drag position via APZ `scrollLeft` rather than mutating
 * `style.transform` per frame. In Gecko/WebRender, main-thread transform
 * updates on a large card trigger ~50-75ms scene rebuilds, whereas `scrollLeft`
 * on an `overflow-x: auto` container stays on the GPU APZ path at full refresh.
 */
function setContinuumDragOffset(offset: number): void {
	continuumDragOffset = offset;
	const active = offset !== 0;
	if (hasContinuumDragOffset !== active) hasContinuumDragOffset = active;

	const activeLayer = getContinuumLayer(modalState.activeGame?.id ?? '');
	if (activeLayer && isContinuum) {
		if (offset === 0 && !isContinuumDragging && continuumPhase === 'idle') {
			activeLayer.classList.remove('continuum-scroll-ready');
			activeLayer.scrollLeft = 0;
		} else {
			enableContinuumScrollTrack(activeLayer);
		}
	}
}

function getContinuumLayer(gameId: string): HTMLElement | null {
	if (!overlayElement) return null;
	for (const layer of overlayElement.querySelectorAll<HTMLElement>('[data-continuum-layer]')) {
		if (layer.dataset.continuumLayer === gameId) return layer;
	}
	return null;
}

function readLayerTranslateX(layer: HTMLElement): number {
	const transform = getComputedStyle(layer).transform;
	if (!transform || transform === 'none') return 0;
	try {
		return new DOMMatrixReadOnly(transform).m41;
	} catch {
		return 0;
	}
}

interface LayerAnimation {
	layer: HTMLElement;
	keyframes: Keyframe[];
}

function cancelRunningAnimations(): void {
	for (const animation of runningAnimations) animation.cancel();
	runningAnimations = [];
	for (const layer of fallbackAnimatedLayers) {
		const pos = Number(layer.dataset.continuumPos ?? '0');
		layer.style.transform = getCardTransform(pos, pos === 0);
	}
	fallbackAnimatedLayers = [];
}

function applyFinalKeyframes(animations: LayerAnimation[]): void {
	for (const { layer, keyframes } of animations) {
		const last = keyframes[keyframes.length - 1];
		if (!last) continue;
		if (typeof last.transform === 'string') layer.style.transform = last.transform;
		if (last.opacity !== undefined) layer.style.opacity = String(last.opacity);
		fallbackAnimatedLayers.push(layer);
	}
}

/**
 * Animates compositor-owned wrapper layers. The zoomed card inside never
 * changes transform, so neither Chromium nor Gecko re-rasterises it mid-gesture.
 */
function animateLayers(animations: LayerAnimation[], duration: number, easing: string): Promise<void> {
	if (animations.length === 0) return Promise.resolve();

	const running: Animation[] = [];
	const canAnimate = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';

	if (canAnimate) {
		try {
			for (const { layer, keyframes } of animations) {
				const animation = layer.animate(keyframes, {
					duration,
					easing,
					fill: 'forwards',
				});
				// jsdom exposes animate() but returns a stub without finished.
				if (!animation?.finished) throw new Error('WAAPI unsupported');
				running.push(animation);
			}
		} catch {
			for (const animation of running) animation.cancel();
			running.length = 0;
		}
	}

	if (running.length !== animations.length) {
		// Test/unsupported fallback: land on the final keyframe, then let the
		// caller commit after the same duration it would take in a browser.
		applyFinalKeyframes(animations);
		return delay(duration);
	}

	runningAnimations.push(...running);
	return Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(() => undefined);
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
 * Springs the active card back over the centred incoming card when a drag ends
 * without turning the page.
 */
async function settleContinuumDrag(): Promise<void> {
	if (continuumDragOffset === 0) {
		continuumPhase = 'idle';
		resetAllContinuumScrolls();
		return;
	}

	if (prefersReducedMotion()) {
		transitionToken++;
		continuumDragOffset = 0;
		hasContinuumDragOffset = false;
		continuumPhase = 'idle';
		resetAllContinuumScrolls();
		return;
	}

	const token = ++transitionToken;
	const direction = continuumDragOffset < 0 ? 1 : -1;
	const activeLayer = getContinuumLayer(modalState.activeGame?.id ?? '');
	const activeStartX = continuumDragOffset;

	continuumTurnDirection = direction;
	continuumPhase = 'settling';

	const animations: LayerAnimation[] = [];
	if (activeLayer) {
		// Animate relative to the current scrollLeft so we never jump on handoff.
		animations.push({
			layer: activeLayer,
			keyframes: [
				{ transform: 'translate3d(0px, 0px, 0)', opacity: 1 },
				{ transform: `translate3d(${(-activeStartX).toFixed(2)}px, 0px, 0)`, opacity: 1 },
			],
		});
	}

	await animateLayers(animations, CONTINUUM_SETTLE_MS, CONTINUUM_SETTLE_EASING);
	if (token !== transitionToken) return;

	continuumDragOffset = 0;
	hasContinuumDragOffset = false;
	continuumPhase = 'idle';
	resetAllContinuumScrolls();
	cancelRunningAnimations();
}

/**
 * Slides the focused card clear of the centred incoming card, then commits the
 * active game swap once the incoming card is the only one left on screen.
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

	const exitDistance = getTurnExitDistance();
	const activeStartX = continuumDragOffset;

	continuumTurnDirection = direction;
	continuumPhase = 'exiting';

	// A preview click can introduce a new target card, so let the each block
	// render it before capturing the active layer.
	await tick();
	if (token !== transitionToken) return;

	const activeLayer = getContinuumLayer(modalState.activeGame?.id ?? '');
	const animations: LayerAnimation[] = [];

	if (activeLayer) {
		// Scroll offset already places the card at activeStartX, so animate only
		// the remaining delta to -direction * exitDistance.
		const deltaX = -direction * exitDistance - activeStartX;
		animations.push({
			layer: activeLayer,
			keyframes: [
				{ transform: 'translate3d(0px, 0px, 0)', opacity: 1 },
				{ transform: `translate3d(${deltaX.toFixed(2)}px, 0px, 0)`, opacity: 1 },
			],
		});
	}

	await animateLayers(animations, CONTINUUM_TURN_MS, CONTINUUM_TURN_EASING);
	if (token !== transitionToken) return;
	if (!isModalOpen) return;

	commit();
	await tick();

	// Reset scroll positions and state before dropping the fill-forwards
	// animations, so cancelling them cannot flash the old offset.
	continuumDragOffset = 0;
	hasContinuumDragOffset = false;
	continuumPhase = 'idle';
	turnTargetGame = null;
	resetAllContinuumScrolls();
	await tick();
	cancelRunningAnimations();
}

function navigateBy(direction: 1 | -1, skipTransition = false): void {
	const canNavigate = direction === 1 ? canGoNext : canGoPrevious;
	if (!canNavigate) return;
	if (isContinuum && continuumPhase === 'exiting') return;

	continuumTurnDirection = direction;

	if (!isContinuum || prefersReducedMotion() || skipTransition) {
		transitionToken++;
		cancelRunningAnimations();
		continuumPhase = 'idle';
		turnTargetGame = null;
		setContinuumDragOffset(0);
		resetAllContinuumScrolls();
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
		cancelRunningAnimations();
		continuumPhase = 'idle';
		turnTargetGame = null;
		setContinuumDragOffset(0);
		resetAllContinuumScrolls();
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
	// Touch is owned by SwipeController, which also handles the close gesture.
	if (event.pointerType === 'touch' || event.button !== 0) return;
	if (activePointerId !== null) cancelPointerGesture();

	const onBackdrop = event.target === overlayElement;
	if (!onBackdrop) {
		if (!isCardTarget(event.target)) return;
		if (!isDragHandleTarget(event.target) && isInteractiveCardTarget(event.target)) return;
		event.preventDefault();
	}

	if (continuumPhase === 'settling') {
		// Combine the scroll offset with the in-flight WAAPI transform before
		// cancelling, so grabbing mid-settle resumes from the exact visual x.
		const activeLayer = getContinuumLayer(modalState.activeGame?.id ?? '');
		const currentOffset = activeLayer ? continuumDragOffset + readLayerTranslateX(activeLayer) : continuumDragOffset;
		transitionToken++;
		cancelRunningAnimations();
		continuumPhase = 'idle';
		setContinuumDragOffset(currentOffset);
	}

	dragOriginOffset = continuumDragOffset;
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

	const nextOffset = constrainContinuumOffset(dragOriginOffset + movement.offset, {
		canGoPrevious,
		canGoNext,
	});
	if (nextOffset !== continuumDragOffset) {
		setContinuumDragOffset(nextOffset);
		if (nextOffset !== 0) {
			const nextDirection: 1 | -1 = nextOffset < 0 ? 1 : -1;
			if (continuumTurnDirection !== nextDirection) continuumTurnDirection = nextDirection;
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
	dragOriginOffset = 0;

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
	hasContinuumDragOffset = false;

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
		class:continuum-turning={isContinuum && (continuumPhase === 'exiting' || continuumPhase === 'settling')}
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
		aria-label="Game details: {modalState.activeGame.title}"
		tabindex="-1"
		use:focusTrap={{ initialFocus: 'container' }}
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
					class="nav-arrow-btn absolute top-1/2 left-[calc(50%-600px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
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
					class="nav-arrow-btn absolute top-1/2 right-[calc(50%-600px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
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
						suppressed={isPreviewSuppressed('previous')}
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
						suppressed={isPreviewSuppressed('next')}
						enterFromX={previewEnterX}
						enterDuration={previewEnterDuration}
						onSelect={selectContinuumGame}
					/>
				{/each}
			</div>
		{/if}

		{#each visibleGames as { game, pos } (game.id)}
			{@const isCurrent = pos === 0}
			{@const isVisible =
				isCurrent ||
				isContinuum ||
				(pos === -1 && swipe.swipeDirection === 'right') ||
				(pos === 1 && swipe.swipeDirection === 'left')}
			<div
				class="modal-card-layer absolute inset-0 pointer-events-none"
				class:z-[60]={isCurrent}
				class:z-[59]={!isCurrent}
				class:continuum-scroll-layer={isContinuum && isCurrent}
				class:continuum-neighbor={isContinuum && !isCurrent}
				style="visibility: {isVisible ? 'visible' : 'hidden'};"
				style:transform={getCardTransform(pos, isCurrent)}
				style:opacity={getCardOpacity(isCurrent, pos)}
				data-continuum-layer={game.id}
				data-continuum-pos={pos}
				aria-hidden={!isCurrent ? 'true' : undefined}
			>
				<div class="modal-card-track pointer-events-none flex h-full w-full items-center justify-center md:p-4">
					<div
						class="modal-content relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-900 md:h-auto md:max-h-[min(600px,calc((100dvh_-_32px)/1.1))] md:w-[960px] md:max-w-[calc(100%/1.1)] md:cursor-grab md:rounded-xl {isCurrent
							? 'pointer-events-auto shadow-2xl md:shadow-2xl'
							: ''} {isIOS
							? 'ios-modal'
							: ''} {isAndroid ? 'android-modal' : ''} {isCurrent && swipe.isClosingGesture
							? 'swiping-close'
							: ''}"
						class:continuum-card={isContinuum}
						style:background-color={getModalSurface(game)}
						style:border-radius="{isCurrent ? 12 + Math.max(0, swipe.swipeOffsetY) * 0.1 : 12}px"
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

	/* The gesture scrolls this layer via APZ during drags and animates it via
	   WAAPI on release/turns. The zoomed card inside never changes transform,
	   keeping both Chromium and Gecko off the per-frame layout/paint path. */
	.modal-card-layer {
		backface-visibility: hidden;
	}

	/* overflow-x: auto creates a Gecko APZ scroll frame so horizontal drag
	   updates via scrollLeft composite on the GPU without rebuilding the
	   WebRender display list every frame. */
	.continuum-scroll-layer {
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		overscroll-behavior-x: none;
	}

	.continuum-scroll-layer::-webkit-scrollbar {
		display: none;
	}

	/* Prevent the global prefers-reduced-motion `transition-duration: 0.01ms`
	   rule from turning width changes into a 1-frame transition that clamps
	   scrollLeft to 0 before the track finishes widening. */
	.modal-card-track {
		/* biome-ignore lint/complexity/noImportantStyles: Overrides global reduced-motion * transition-duration */
		transition: none !important;
	}

	.continuum-scroll-layer:global(.continuum-scroll-ready) .modal-card-track {
		width: calc(100% + 1600px);
	}

	/* Promote the active layer everywhere and all three in the continuum,
	   where the offscreen neighbours must already be rasterised on drag start.
	   Keep will-change on transform only for the scroll layer so Gecko keeps it
	   on the APZ scroll path without allocating an extra opacity surface. */
	.modal-card-layer[data-continuum-pos='0'] {
		will-change: transform;
	}

	.continuum-overlay .continuum-neighbor {
		will-change: transform, opacity;
	}

	/* Neighbour opacity must snap: the incoming card has to be solid before the
	   focused card uncovers it, and it must vanish before jumping back offscreen
	   when a snap-back finishes. */
	.continuum-neighbor {
		transition: none;
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

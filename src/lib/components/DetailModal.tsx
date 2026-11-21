import { ChevronLeft, ChevronRight, X } from '@lucide/solid';
import type { JSX } from '@solidjs/web';
import { createEffect, createMemo, createSignal, For, flush, onSettled, Show } from 'solid-js';
import { gamesStore } from '#lib/stores/games.js';
import { imageErrorStore } from '#lib/stores/imageErrors.js';
import { modalStore } from '#lib/stores/modal.js';
import { offlineStore } from '#lib/stores/offline.js';
import { windowSize } from '#lib/stores/window.js';
import type { Game } from '#lib/types/game.js';
import { browser } from '#lib/utils/env.js';
import { focusTrap } from '#lib/utils/focusTrap.js';
import { preloadImage } from '#lib/utils/imagePreload.js';
import { prefersReducedMotion } from '#lib/utils/motion.js';
import ContinuumPreview from './detail-modal/ContinuumPreview.js';
import {
	ContinuumDragTracker,
	ContinuumWheelNavigator,
	constrainContinuumOffset,
} from './detail-modal/continuumGestures.js';
import { getContinuumNeighbors, getContinuumPreviewCount } from './detail-modal/continuumNeighbors.js';
import GameDetailCard from './detail-modal/GameDetailCard.js';
import { SwipeController } from './detail-modal/SwipeController.js';
import './DetailModal.css';

export interface DetailModalProps {
	onEditGame?: (game: Game) => void;
	onDeleteGame?: (game: Game) => void;
}

const PLACEHOLDER_SRC = '/covers/placeholder_cover.webp';
const OFFLINE_FALLBACK_DATA_URI =
	'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"%3E%3Crect fill="%231a1a2e" width="300" height="450"/%3E%3Ctext x="150" y="225" text-anchor="middle" fill="%23666" font-family="sans-serif" font-size="14"%3EOffline%3C/text%3E%3C/svg%3E';

type ContinuumPhase = 'idle' | 'settling' | 'exiting';

const CONTINUUM_ENTER_OFFSET = 260;
const CONTINUUM_SCROLL_CENTER = 800;
const CONTINUUM_CARD_WIDTH = 1056;
const CONTINUUM_TURN_MS = 260;
const CONTINUUM_SETTLE_MS = 260;
const CONTINUUM_TURN_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const CONTINUUM_SETTLE_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';
const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';
const INTERACTIVE_CARD_SELECTOR =
	'button, a, input, select, textarea, label, [role="button"], [contenteditable="true"]';

interface LayerAnimation {
	layer: HTMLElement;
	keyframes: Keyframe[];
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function nextTick(): Promise<void> {
	flush();
	await Promise.resolve();
}

export default function DetailModal(props: DetailModalProps): JSX.Element {
	const modalState = createMemo(() => modalStore.getState());
	const isModalOpen = createMemo(() => modalState().isOpen);
	const isViewMode = createMemo(() => modalState().mode === 'view');

	const [isIOS, setIsIOS] = createSignal(false);
	const [isAndroid, setIsAndroid] = createSignal(false);

	onSettled(() => {
		if (browser) {
			const ua = navigator.userAgent;
			setIsIOS(/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
			setIsAndroid(/Android/.test(ua));
		}
	});

	function getPreviewImageSrc(coverImage: string | undefined): string {
		if (!offlineStore.isOnline) return OFFLINE_FALLBACK_DATA_URI;
		if (!coverImage || coverImage.includes('placeholder_cover')) return PLACEHOLDER_SRC;
		const absCoverImage = coverImage.startsWith('/') ? coverImage : `/${coverImage}`;
		const detailPath = absCoverImage.replace('.webp', '-detail.webp');
		return imageErrorStore.hasFailed(detailPath) ? PLACEHOLDER_SRC : detailPath;
	}

	const displayedGames = createMemo(() => {
		const state = modalState();
		if (state.displayedGames.length > 0) return state.displayedGames;
		const allGames = gamesStore.games;
		if (allGames.length === 0) return [];
		return modalStore.getReactiveNavigationGames(allGames);
	});

	const currentGameIndex = createMemo(() => {
		const active = modalState().activeGame;
		if (!active) return -1;
		return displayedGames().findIndex((game) => game.id === active.id);
	});

	const nextGamePreview = createMemo(() => {
		const idx = currentGameIndex();
		const list = displayedGames();
		return idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null;
	});

	const prevGamePreview = createMemo(() => {
		const idx = currentGameIndex();
		const list = displayedGames();
		return idx > 0 ? list[idx - 1] : null;
	});

	const [continuumTurnDirection, setContinuumTurnDirection] = createSignal<1 | -1>(1);
	const [continuumPhase, setContinuumPhase] = createSignal<ContinuumPhase>('idle');
	const [hasContinuumDragOffset, setHasContinuumDragOffset] = createSignal(false);
	const [isContinuumDragging, setIsContinuumDragging] = createSignal(false);
	const [turnTargetGame, setTurnTargetGame] = createSignal<Game | null>(null);
	const [overlayElement, setOverlayElement] = createSignal<HTMLDivElement | null>(null);
	const [modalHasOpened, setModalHasOpened] = createSignal(false);
	const [isImageExpanded, setIsImageExpanded] = createSignal(false);
	const [showSwipeIndicator, setShowSwipeIndicator] = createSignal(false);

	let continuumDragOffset = 0;
	let suppressClickUntil = 0;
	let activePointerId: number | null = null;
	let transitionToken = 0;
	let dragOriginOffset = 0;
	let runningAnimations: Animation[] = [];
	let fallbackAnimatedLayers: HTMLElement[] = [];
	let swipeIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;
	let swipeHideTimeout: ReturnType<typeof setTimeout> | null = null;
	let hasTriggeredHint = false;

	const wheelNavigator = new ContinuumWheelNavigator();
	const dragTracker = new ContinuumDragTracker();

	const prevCardGame = createMemo(() =>
		continuumPhase() === 'exiting' && continuumTurnDirection() === -1 && turnTargetGame()
			? turnTargetGame()
			: prevGamePreview()
	);
	const nextCardGame = createMemo(() =>
		continuumPhase() === 'exiting' && continuumTurnDirection() === 1 && turnTargetGame()
			? turnTargetGame()
			: nextGamePreview()
	);

	const visibleGames = createMemo((): { game: Game; pos: number }[] => {
		const result: { game: Game; pos: number }[] = [];
		const prev = prevCardGame();
		const active = modalState().activeGame;
		const next = nextCardGame();
		if (prev) result.push({ game: prev, pos: -1 });
		if (active) result.push({ game: active, pos: 0 });
		if (next) result.push({ game: next, pos: 1 });
		return result;
	});

	const visibleGameList = createMemo(() => visibleGames().map((entry) => entry.game));

	function getVisiblePos(gameId: string): number {
		return visibleGames().find((entry) => entry.game.id === gameId)?.pos ?? 0;
	}

	const continuumPreviewCount = createMemo(() =>
		isIOS() || isAndroid() ? 0 : getContinuumPreviewCount(windowSize.width)
	);
	const isContinuum = createMemo(() => continuumPreviewCount() > 0);
	const continuumNeighbors = createMemo(() =>
		getContinuumNeighbors(displayedGames(), currentGameIndex(), continuumPreviewCount())
	);
	const canGoPrevious = createMemo(() => currentGameIndex() > 0);
	const canGoNext = createMemo(() => currentGameIndex() < displayedGames().length - 1);
	const previewEnterX = createMemo(() => (continuumTurnDirection() === 1 ? 40 : -40));
	const previewEnterDuration = createMemo(() => (prefersReducedMotion() || !modalHasOpened() ? 0 : 200));

	createEffect(
		() => isModalOpen(),
		(open) => {
			if (!open) {
				setModalHasOpened(false);
				return;
			}
			const t = setTimeout(() => setModalHasOpened(true), 100);
			return () => {
				clearTimeout(t);
				setModalHasOpened(false);
			};
		}
	);

	createEffect(
		() => ({ list: displayedGames(), idx: currentGameIndex() }),
		({ list, idx }) => {
			if (!browser) return;
			for (let step = -2; step <= 2; step++) {
				if (step === 0) continue;
				const candidate = list[idx + step];
				if (candidate?.coverImage) {
					preloadImage(getPreviewImageSrc(candidate.coverImage));
				}
			}
		}
	);

	function isContinuumCardMotionActive(): boolean {
		return (
			isContinuumDragging() ||
			continuumPhase() === 'exiting' ||
			continuumPhase() === 'settling' ||
			hasContinuumDragOffset()
		);
	}

	function getIncomingVisualOffset(direction: 1 | -1): number {
		return isContinuumCardMotionActive() ? 0 : direction * CONTINUUM_ENTER_OFFSET;
	}

	function getTurnExitDistance(): number {
		return windowSize.width / 2 + CONTINUUM_CARD_WIDTH / 2 + 16;
	}

	function isTouchSwipeActive(): boolean {
		return swipe.swipeDirection !== null || swipe.swipeOffsetX !== 0 || swipe.swipeOffsetY !== 0;
	}

	function getModalSurface(game: Game): string {
		const solid = isContinuum() || isTouchSwipeActive();
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
		if (isContinuumDragging() || continuumPhase() === 'exiting' || continuumPhase() === 'settling') {
			return (continuumTurnDirection() === 1 ? 'next' : 'previous') === direction;
		}
		if (swipe.swipeDirection !== null) {
			return (swipe.swipeDirection === 'left' ? 'next' : 'previous') === direction;
		}
		return false;
	}

	function getCardTransform(pos: number, isCurrent: boolean): string {
		const x = pos * swipe.offsetMagnitude + swipe.swipeOffsetX + (isCurrent ? continuumDragOffset : 0);
		const y = swipe.swipeOffsetY;

		if (!isContinuum() || isTouchSwipeActive()) {
			return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
		}

		if (!isCurrent) {
			const incoming = pos === continuumTurnDirection();
			const offset = incoming ? getIncomingVisualOffset(pos === 1 ? 1 : -1) : pos * CONTINUUM_ENTER_OFFSET;
			return `translate3d(${offset.toFixed(2)}px, 0px, 0)`;
		}

		return `translate3d(0px, ${y.toFixed(2)}px, 0)`;
	}

	function getCardOpacity(isCurrent: boolean, pos: number): number {
		if (isContinuum() && !isTouchSwipeActive()) {
			if (!isCurrent) {
				return pos === continuumTurnDirection() && isContinuumCardMotionActive() ? 1 : 0;
			}
			return 1;
		}

		if (!isCurrent) return 1;
		return 1 - (Math.abs(swipe.swipeOffsetX) * 0.0005 + Math.max(0, swipe.swipeOffsetY) * 0.0005);
	}

	function enableContinuumScrollTrack(layer: HTMLElement | null): void {
		if (!layer || !isContinuum()) return;
		if (!layer.classList.contains('continuum-scroll-ready')) {
			layer.classList.add('continuum-scroll-ready');
			const track = layer.firstElementChild;
			if (track instanceof HTMLElement) void track.offsetWidth;
			void layer.scrollWidth;
		}
		layer.scrollLeft = CONTINUUM_SCROLL_CENTER - continuumDragOffset;
	}

	function resetAllContinuumScrolls(): void {
		const el = overlayElement();
		if (!el) return;
		for (const layer of el.querySelectorAll<HTMLElement>('[data-continuum-layer]')) {
			layer.classList.remove('continuum-scroll-ready');
			if (layer.scrollLeft !== 0) {
				layer.scrollLeft = 0;
			}
		}
	}

	function getContinuumLayer(gameId: string): HTMLElement | null {
		const el = overlayElement();
		if (!el) return null;
		for (const layer of el.querySelectorAll<HTMLElement>('[data-continuum-layer]')) {
			if (layer.dataset.continuumLayer === gameId) return layer;
		}
		return null;
	}

	function setContinuumDragOffset(offset: number): void {
		continuumDragOffset = offset;
		const active = offset !== 0;
		if (hasContinuumDragOffset() !== active) setHasContinuumDragOffset(active);

		const activeLayer = getContinuumLayer(modalState().activeGame?.id ?? '');
		if (activeLayer && isContinuum()) {
			if (offset === 0 && !isContinuumDragging() && continuumPhase() === 'idle') {
				activeLayer.classList.remove('continuum-scroll-ready');
				activeLayer.scrollLeft = 0;
			} else {
				enableContinuumScrollTrack(activeLayer);
			}
		}
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
					if (!animation?.finished) throw new Error('WAAPI unsupported');
					running.push(animation);
				}
			} catch {
				for (const animation of running) animation.cancel();
				running.length = 0;
			}
		}

		if (running.length !== animations.length) {
			applyFinalKeyframes(animations);
			return delay(duration);
		}

		runningAnimations.push(...running);
		return Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(() => undefined);
	}

	function commitNavigation(direction: 1 | -1): void {
		const target = direction === 1 ? nextGamePreview() : prevGamePreview();
		if (!target) return;
		modalStore.openViewModal(target, displayedGames(), undefined, modalStore.cardRect ?? undefined);
	}

	async function settleContinuumDrag(): Promise<void> {
		if (continuumDragOffset === 0) {
			setContinuumPhase('idle');
			resetAllContinuumScrolls();
			return;
		}

		if (prefersReducedMotion()) {
			transitionToken++;
			continuumDragOffset = 0;
			setHasContinuumDragOffset(false);
			setContinuumPhase('idle');
			resetAllContinuumScrolls();
			return;
		}

		const token = ++transitionToken;
		const direction: 1 | -1 = continuumDragOffset < 0 ? 1 : -1;
		const activeLayer = getContinuumLayer(modalState().activeGame?.id ?? '');
		const activeStartX = continuumDragOffset;

		setContinuumTurnDirection(direction);
		setContinuumPhase('settling');

		const animations: LayerAnimation[] = [];
		if (activeLayer) {
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
		setHasContinuumDragOffset(false);
		setContinuumPhase('idle');
		resetAllContinuumScrolls();
		cancelRunningAnimations();
	}

	async function runContinuumTurn(direction: 1 | -1, commit: () => void, targetGame?: Game): Promise<void> {
		if (continuumPhase() === 'exiting') return;

		const token = ++transitionToken;
		if (activePointerId !== null) {
			dragTracker.cancel();
			stopPointerTracking();
		}
		setIsContinuumDragging(false);

		const adjacentGame = direction === 1 ? nextGamePreview() : prevGamePreview();
		setTurnTargetGame(targetGame && targetGame.id !== adjacentGame?.id ? targetGame : null);

		const exitDistance = getTurnExitDistance();
		const activeStartX = continuumDragOffset;

		setContinuumTurnDirection(direction);
		setContinuumPhase('exiting');

		await nextTick();
		if (token !== transitionToken) return;

		const activeLayer = getContinuumLayer(modalState().activeGame?.id ?? '');
		const animations: LayerAnimation[] = [];

		if (activeLayer) {
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
		if (!isModalOpen()) return;

		commit();
		await nextTick();

		continuumDragOffset = 0;
		setHasContinuumDragOffset(false);
		setContinuumPhase('idle');
		setTurnTargetGame(null);
		resetAllContinuumScrolls();
		await nextTick();
		cancelRunningAnimations();
	}

	function navigateBy(direction: 1 | -1, skipTransition = false): void {
		const canNavigate = direction === 1 ? canGoNext() : canGoPrevious();
		if (!canNavigate) return;
		if (isContinuum() && continuumPhase() === 'exiting') return;

		setContinuumTurnDirection(direction);

		if (!isContinuum() || prefersReducedMotion() || skipTransition) {
			transitionToken++;
			cancelRunningAnimations();
			setContinuumPhase('idle');
			setTurnTargetGame(null);
			setContinuumDragOffset(0);
			resetAllContinuumScrolls();
			commitNavigation(direction);
			return;
		}

		void runContinuumTurn(direction, () => commitNavigation(direction));
	}

	function focusDialog(): void {
		overlayElement()?.focus({ preventScroll: true });
	}

	function selectContinuumGame(game: Game): void {
		const index = displayedGames().findIndex((candidate) => candidate.id === game.id);
		if (index < 0 || index === currentGameIndex()) return;

		const direction: 1 | -1 = index < currentGameIndex() ? -1 : 1;

		if (!isContinuum() || prefersReducedMotion()) {
			transitionToken++;
			cancelRunningAnimations();
			setContinuumPhase('idle');
			setTurnTargetGame(null);
			setContinuumDragOffset(0);
			resetAllContinuumScrolls();
			setContinuumTurnDirection(direction);
			modalStore.openViewModal(game, displayedGames(), undefined, modalStore.cardRect ?? undefined);
			focusDialog();
			return;
		}

		if (continuumPhase() === 'exiting') return;
		setContinuumTurnDirection(direction);

		void runContinuumTurn(
			direction,
			() => {
				modalStore.openViewModal(game, displayedGames(), undefined, modalStore.cardRect ?? undefined);
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

	function isInteractiveCardTarget(target: EventTarget | null): boolean {
		return target instanceof Element && target.closest(INTERACTIVE_CARD_SELECTOR) !== null;
	}

	function handleContinuumPointerDown(event: PointerEvent): void {
		if (!isContinuum() || continuumPhase() === 'exiting') return;
		if (event.pointerType === 'touch' || event.button !== 0) return;
		if (activePointerId !== null) cancelPointerGesture();

		const onBackdrop = event.target === overlayElement();
		if (!onBackdrop) {
			if (!isCardTarget(event.target)) return;
			if (!isDragHandleTarget(event.target) && isInteractiveCardTarget(event.target)) return;
			event.preventDefault();
		}

		if (continuumPhase() === 'settling') {
			const activeLayer = getContinuumLayer(modalState().activeGame?.id ?? '');
			const currentOffset = activeLayer ? continuumDragOffset + readLayerTranslateX(activeLayer) : continuumDragOffset;
			transitionToken++;
			cancelRunningAnimations();
			setContinuumPhase('idle');
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

		if ((event.buttons & 1) === 0) {
			finishPointerGesture(performance.now());
			return;
		}

		const movement = dragTracker.move(event.clientX, event.clientY, performance.now());
		if (!movement.active) return;

		if (!isContinuumDragging()) {
			setIsContinuumDragging(true);
			window.getSelection()?.removeAllRanges();
		}

		const nextOffset = constrainContinuumOffset(dragOriginOffset + movement.offset, {
			canGoPrevious: canGoPrevious(),
			canGoNext: canGoNext(),
		});
		if (nextOffset !== continuumDragOffset) {
			setContinuumDragOffset(nextOffset);
			if (nextOffset !== 0) {
				const nextDirection: 1 | -1 = nextOffset < 0 ? 1 : -1;
				if (continuumTurnDirection() !== nextDirection) setContinuumTurnDirection(nextDirection);
			}
		}
		event.preventDefault();
	}

	function finishPointerGesture(now: number): void {
		const wasDragging = isContinuumDragging();
		const direction = dragTracker.end(now);
		stopPointerTracking();

		if (wasDragging) suppressClickUntil = now + 350;

		const canNavigate = direction === 1 ? canGoNext() : direction === -1 ? canGoPrevious() : false;
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
		setIsContinuumDragging(false);
		dragOriginOffset = 0;

		window.removeEventListener('pointermove', handleContinuumPointerMove);
		window.removeEventListener('pointerup', handleContinuumPointerUp);
		window.removeEventListener('pointercancel', handleContinuumPointerCancel);
		window.removeEventListener('blur', handleWindowBlur);
	}

	function dismissSwipeHint(): void {
		if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
		if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
		setShowSwipeIndicator(false);
		sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
	}

	const swipe = new SwipeController(
		(skip) => navigateBy(1, skip),
		(skip) => navigateBy(-1, skip),
		() => nextGamePreview(),
		() => prevGamePreview(),
		dismissSwipeHint
	);

	function toggleImageExpansion(): void {
		if (window.innerWidth < 768) {
			setIsImageExpanded((v) => !v);
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (!isModalOpen() || !isViewMode()) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			if (isImageExpanded()) {
				setIsImageExpanded(false);
			} else {
				modalStore.closeModal();
			}
		} else if (!isImageExpanded()) {
			if (event.key === 'ArrowLeft') {
				event.preventDefault();
				navigateBy(-1);
			} else if (event.key === 'ArrowRight') {
				event.preventDefault();
				navigateBy(1);
			}
		}
	}

	createEffect(
		() => ({ games: displayedGames(), open: isModalOpen(), viewMode: isViewMode() }),
		({ games, open, viewMode }) => {
			if (!browser || !open || !viewMode) return;
			if (sessionStorage.getItem(SWIPE_HINT_KEY)) return;
			if (window.innerWidth >= 768 || games.length <= 1) return;
			if (hasTriggeredHint || showSwipeIndicator()) return;

			hasTriggeredHint = true;
			swipeIndicatorTimeout = setTimeout(() => {
				setShowSwipeIndicator(true);
				swipeHideTimeout = setTimeout(() => {
					setShowSwipeIndicator(false);
					sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
				}, 5000);
			}, 300);
		}
	);

	createEffect(
		() => isModalOpen() && isViewMode(),
		(active) => {
			if (!browser || !active) return;
			document.addEventListener('keydown', handleKeydown, true);
			return () => document.removeEventListener('keydown', handleKeydown, true);
		}
	);

	createEffect(
		() => overlayElement(),
		(node) => {
			if (!browser || !node) return;
			const trap = focusTrap(node, { initialFocus: 'container' });
			wheelNavigator.reset();

			const handleWheel = (event: WheelEvent) => {
				if (!isContinuum() || !isModalOpen()) return;
				const horizontal = Math.abs(event.deltaX) > Math.abs(event.deltaY);
				const direction = wheelNavigator.push(event.deltaX, event.deltaY);
				if (horizontal) event.preventDefault();
				if (direction === 1) navigateBy(1);
				else if (direction === -1) navigateBy(-1);
			};

			const suppressDragClick = (event: MouseEvent) => {
				if (performance.now() < suppressClickUntil) {
					event.preventDefault();
					event.stopPropagation();
				}
			};

			node.addEventListener('wheel', handleWheel, { passive: false });
			node.addEventListener('click', suppressDragClick, true);

			return () => {
				trap.destroy();
				node.removeEventListener('wheel', handleWheel);
				node.removeEventListener('click', suppressDragClick, true);
			};
		}
	);

	createEffect(
		() => isModalOpen(),
		(open) => {
			if (open) return;
			transitionToken++;
			setContinuumPhase('idle');
			setTurnTargetGame(null);
			setIsContinuumDragging(false);
			continuumDragOffset = 0;
			setHasContinuumDragOffset(false);

			if (activePointerId !== null) {
				dragTracker.cancel();
				stopPointerTracking();
			}
		}
	);

	createEffect(
		() => isModalOpen() || isImageExpanded(),
		(locked) => {
			if (!browser) return;
			if (locked) {
				document.body.classList.add('no-scroll');
				document.documentElement.classList.add('no-scroll');
			} else {
				document.body.classList.remove('no-scroll');
				document.documentElement.classList.remove('no-scroll');
			}
			return () => {
				document.body.classList.remove('no-scroll');
				document.documentElement.classList.remove('no-scroll');
			};
		}
	);

	onSettled(() => {
		return () => {
			window.removeEventListener('pointermove', handleContinuumPointerMove);
			window.removeEventListener('pointerup', handleContinuumPointerUp);
			window.removeEventListener('pointercancel', handleContinuumPointerCancel);
			window.removeEventListener('blur', handleWindowBlur);
			if (swipeIndicatorTimeout) clearTimeout(swipeIndicatorTimeout);
			if (swipeHideTimeout) clearTimeout(swipeHideTimeout);
		};
	});

	return (
		<Show when={isModalOpen() && modalState().activeGame && isViewMode()}>
			<div
				ref={setOverlayElement}
				class={[
					'fixed inset-0 z-[60] flex items-center justify-center bg-black md:bg-black/80 md:p-4 md:backdrop-blur-[4px]',
					{
						'continuum-overlay': isContinuum(),
						'continuum-dragging': isContinuumDragging(),
						'continuum-turning': isContinuum() && (continuumPhase() === 'exiting' || continuumPhase() === 'settling'),
					},
				]}
				onClick={handleOverlayClick}
				onPointerDown={handleContinuumPointerDown}
				onDragStart={(e) => {
					if (isContinuum()) e.preventDefault();
				}}
				onKeyDown={(e) => {
					if (e.key === 'Escape') modalStore.closeModal();
				}}
				role="dialog"
				aria-modal="true"
				aria-label={`Game details: ${modalState().activeGame?.title ?? ''}`}
				tabindex="-1"
			>
				<p class="sr-only" aria-live="polite" aria-atomic="true">
					Now viewing {modalState().activeGame?.title ?? ''}
				</p>

				<Show when={showSwipeIndicator()}>
					<div class="swipe-hint-overlay pointer-events-none md:hidden" aria-hidden="true">
						<div class="swipe-hint-content">
							<svg
								class="swipe-hint-svg"
								viewBox="0 0 120 80"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
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
				</Show>

				<Show when={!isIOS() && !isAndroid() && displayedGames().length > 1}>
					<Show when={currentGameIndex() > 0}>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								navigateBy(-1);
							}}
							class="nav-arrow-btn absolute top-1/2 left-[calc(50%-600px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
							aria-label="Previous game"
						>
							<ChevronLeft size={28} />
						</button>
					</Show>
					<Show when={currentGameIndex() < displayedGames().length - 1}>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								navigateBy(1);
							}}
							class="nav-arrow-btn absolute top-1/2 right-[calc(50%-600px)] z-[70] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 text-white/90 transition-all hover:scale-110 hover:bg-black/40 xl:flex"
							aria-label="Next game"
						>
							<ChevronRight size={28} />
						</button>
					</Show>
				</Show>

				<Show when={isContinuum()}>
					<div class="pointer-events-none absolute inset-0 z-[58]">
						<For each={continuumNeighbors().previous}>
							{(game, index) => (
								<ContinuumPreview
									game={game}
									direction="previous"
									depth={index() === 1 ? 1 : 0}
									suppressed={isPreviewSuppressed('previous')}
									enterFromX={previewEnterX()}
									enterDuration={previewEnterDuration()}
									onSelect={selectContinuumGame}
								/>
							)}
						</For>
						<For each={continuumNeighbors().next}>
							{(game, index) => (
								<ContinuumPreview
									game={game}
									direction="next"
									depth={index() === 1 ? 1 : 0}
									suppressed={isPreviewSuppressed('next')}
									enterFromX={previewEnterX()}
									enterDuration={previewEnterDuration()}
									onSelect={selectContinuumGame}
								/>
							)}
						</For>
					</div>
				</Show>

				<For each={visibleGameList()}>
					{(game) => {
						const pos = createMemo(() => getVisiblePos(game.id));
						const isCurrent = () => pos() === 0;
						const isVisible = () =>
							isCurrent() ||
							isContinuum() ||
							(pos() === -1 && swipe.swipeDirection === 'right') ||
							(pos() === 1 && swipe.swipeDirection === 'left');

						return (
							<div
								class={[
									'modal-card-layer absolute inset-0 pointer-events-none',
									{
										'z-[60]': isCurrent(),
										'z-[59]': !isCurrent(),
										'continuum-scroll-layer': isContinuum() && isCurrent(),
										'continuum-neighbor': isContinuum() && !isCurrent(),
									},
								]}
								style={{
									visibility: isVisible() ? 'visible' : 'hidden',
									transform: getCardTransform(pos(), isCurrent()),
									opacity: String(getCardOpacity(isCurrent(), pos())),
								}}
								data-continuum-layer={game.id}
								data-continuum-pos={pos()}
								aria-hidden={!isCurrent() ? 'true' : undefined}
							>
								<div class="modal-card-track pointer-events-none flex h-full w-full items-center justify-center md:p-4">
									<div
										class={[
											'modal-content relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-neutral-900 md:h-auto md:max-h-[min(600px,calc((100dvh_-_32px)/1.1))] md:w-[960px] md:max-w-[calc(100%/1.1)] md:cursor-grab md:rounded-xl',
											{
												'pointer-events-auto shadow-2xl md:shadow-2xl': isCurrent(),
												'ios-modal': isIOS(),
												'android-modal': isAndroid(),
												'swiping-close': isCurrent() && swipe.isClosingGesture,
												'continuum-card': isContinuum(),
											},
										]}
										style={{
											'background-color': getModalSurface(game),
											'border-radius': `${isCurrent() ? 12 + Math.max(0, swipe.swipeOffsetY) * 0.1 : 12}px`,
										}}
										role={isCurrent() ? 'document' : undefined}
										onTouchStart={(e) => {
											if (isCurrent()) swipe.handleTouchStart(e);
										}}
										onTouchMove={(e) => {
											if (isCurrent()) swipe.handleTouchMove(e);
										}}
										onTouchEnd={() => {
											if (isCurrent()) swipe.handleTouchEnd();
										}}
									>
										<GameDetailCard
											game={game}
											onEditGame={isCurrent() ? props.onEditGame : undefined}
											onDeleteGame={isCurrent() ? props.onDeleteGame : undefined}
											onClose={isCurrent() ? () => modalStore.closeModal() : undefined}
											onImageClick={isCurrent() ? toggleImageExpansion : undefined}
										/>
									</div>
								</div>
							</div>
						);
					}}
				</For>

				<Show when={isImageExpanded()}>
					<div
						class="fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity"
						onClick={toggleImageExpansion}
						onKeyDown={(e) => (e.key === 'Escape' || e.key === 'Enter') && toggleImageExpansion()}
						role="dialog"
						aria-modal="true"
						tabindex="-1"
						aria-label="Full screen cover view"
					>
						<img
							src={getPreviewImageSrc(modalState().activeGame?.coverImage || '')}
							alt={`${modalState().activeGame?.title || 'Game'} cover full screen`}
							class="max-h-full max-w-full object-contain"
							onError={(e) => {
								const target = e.currentTarget;
								const failedSrc = target.currentSrc || target.src;
								if (failedSrc && !failedSrc.includes('placeholder_cover')) {
									imageErrorStore.markFailed(failedSrc);
									target.src = PLACEHOLDER_SRC;
								}
							}}
						/>
						<button
							type="button"
							class="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md"
							onClick={(e) => {
								e.stopPropagation();
								toggleImageExpansion();
							}}
							aria-label="Close full screen view"
						>
							<X size={24} />
						</button>
					</div>
				</Show>
			</div>
		</Show>
	);
}

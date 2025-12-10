<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade, fly, scale } from 'svelte/transition';
	import { cubicOut, backOut, quintOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { modalStore } from '$lib/stores/modal.svelte';
	import { createGameSlug } from '../utils/slugUtils.js';
	import { appStore } from '$lib/stores/app.svelte';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS } from '../utils/colorConstants';
	import { getTierClass, getTierDisplayName } from '$lib/utils/tierUtils';
	import { generateSrcset, generateSizes } from '../utils/imageSrcset.js';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Award,
		X,
		ChevronLeft,
		ChevronRight,
		Link,
		Users
	} from 'lucide-svelte';

	// Platform detection for iOS/Android-specific animations
	let isIOS = $state(false);
	let isAndroid = $state(false);

	// Horizontal swipe animation state (navigation)
	let swipeOffsetX = $state(0);
	let isSwipeTransitioning = $state(false);
	let swipeDirection = $state<'left' | 'right' | null>(null);

	// Vertical swipe state (swipe-to-close)
	let swipeOffsetY = $state(0);
	let isClosingGesture = $state(false);

	// Parallax preview state
	let nextGamePreview = $state<Game | null>(null);
	let prevGamePreview = $state<Game | null>(null);
	let parallaxOffset = $state(0);

	// Mobile swipe indicator state
	let showSwipeIndicator = $state(false);
	let swipeIndicatorTimeout: ReturnType<typeof setTimeout> | null = null;
	let swipeHideTimeout: ReturnType<typeof setTimeout> | null = null;

	// Zoom/Shrink animation state
	let isZoomAnimating = $state(false);
	let zoomProgress = $state(0);
	let animationPhase = $state<'opening' | 'open' | 'closing' | 'closed'>('closed');

	// Touch tracking
	let touchStartX = 0;
	let touchStartY = 0;
	let touchCurrentX = 0;
	let touchCurrentY = 0;
	let isVerticalSwipe = false;
	let isHorizontalSwipe = false;
	let touchStartTime = 0;

	$effect(() => {
		if (browser) {
			const ua = navigator.userAgent;
			isIOS =
				/iPad|iPhone|iPod/.test(ua) ||
				(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
			isAndroid = /Android/.test(ua);
		}
	});

	let currentActiveTab = $derived(appStore.activeTab);

	import { gamesStore } from '$lib/stores/games.svelte';
	let allGames = $derived($gamesStore);

	let displayedGames = $derived.by(() => {
		if ($modalStore.displayedGames.length > 0) {
			return $modalStore.displayedGames;
		}
		const allGames = $gamesStore;
		if (allGames.length === 0) return [];
		return modalStore.getReactiveNavigationGames(allGames);
	});

	// Effect removed: writeToURL is now called immediately in store methods to prevent race conditions

	$effect(() => {
		if ($modalStore.isOpen && modalElement && browser) {
			setTimeout(() => {
				const focusableElements = getFocusableElements();
				if (focusableElements.length > 0) {
					focusableElements[0].focus();
				}
			}, 100);
		}
	});

	let modalElement = $state<HTMLDivElement>();
	let modalImageElement = $state<HTMLImageElement>();
	let isImageFullScreen = $state(false);

	const detailImageSrc = $derived(
		$modalStore.activeGame?.coverImage.replace('.webp', '-detail.webp') ?? ''
	);

	const detailImageSrcset = $derived(
		detailImageSrc ? generateSrcset(detailImageSrc.replace('-detail.webp', '')) : ''
	);
	const detailImageSizes = $derived(generateSizes('modal'));

	let titleSizeClass = $derived.by(() => {
		const len = $modalStore.activeGame?.mainTitle?.length ?? 0;
		if (len <= 20) return 'text-lg md:text-3xl';
		if (len <= 30) return 'text-base md:text-2xl';
		if (len <= 38) return 'text-sm md:text-xl';
		return 'text-xs md:text-lg';
	});

	let linkToGame = $state('');
	let focusableElements = $state<HTMLElement[]>([]);
	let firstFocusableElement = $state<HTMLElement>();
	let lastFocusableElement = $state<HTMLElement>();

	// Swipe thresholds
	const SWIPE_THRESHOLD = 60;
	const SWIPE_CLOSE_THRESHOLD = 150;
	const VELOCITY_THRESHOLD = 0.8;

	// Update parallax previews based on current game index
	$effect(() => {
		if ($modalStore.isOpen && displayedGames.length > 0) {
			const index = currentGameIndex;
			nextGamePreview = index < displayedGames.length - 1 ? displayedGames[index + 1] : null;
			prevGamePreview = index > 0 ? displayedGames[index - 1] : null;
		}
	});

	function handleTouchStart(e: TouchEvent) {
		if (isSwipeTransitioning || isZoomAnimating) return;

		const touch = e.touches[0];
		touchStartX = touch.screenX;
		touchStartY = touch.screenY;
		touchCurrentX = touchStartX;
		touchCurrentY = touchStartY;
		touchStartTime = Date.now();
		isVerticalSwipe = false;
		isHorizontalSwipe = false;
		swipeOffsetX = 0;
		swipeOffsetY = 0;
		parallaxOffset = 0;
	}

	function handleTouchMove(e: TouchEvent) {
		if (isSwipeTransitioning || isZoomAnimating) return;

		const touch = e.touches[0];
		touchCurrentX = touch.screenX;
		touchCurrentY = touch.screenY;

		const diffX = touchCurrentX - touchStartX;
		const diffY = touchCurrentY - touchStartY;

		if (!isVerticalSwipe && !isHorizontalSwipe && (Math.abs(diffX) > 10 || Math.abs(diffY) > 10)) {
			if (Math.abs(diffY) > Math.abs(diffX) * 1.5) {
				isVerticalSwipe = true;
			} else if (Math.abs(diffX) > Math.abs(diffY)) {
				isHorizontalSwipe = true;
			}
		}

		if (isVerticalSwipe && diffY > 0) {
			const resistance = 0.6;
			swipeOffsetY = diffY * resistance;
			isClosingGesture = true;
		} else if (isHorizontalSwipe) {
			const maxOffset = 150;
			const resistance = 0.5;

			if (diffX > 0 && prevGamePreview) {
				swipeDirection = 'right';
				swipeOffsetX = Math.min(diffX * resistance, maxOffset);
				// Parallax travels from -100 (off-screen) to -20 (80% visible) during drag
				parallaxOffset = -100 + (swipeOffsetX / maxOffset) * 80;
			} else if (diffX < 0 && nextGamePreview) {
				swipeDirection = 'left';
				swipeOffsetX = Math.max(diffX * resistance, -maxOffset);
				// Parallax travels from 100 (off-screen) to 20 (80% visible) during drag
				parallaxOffset = 100 + (swipeOffsetX / maxOffset) * 80;
			} else {
				swipeOffsetX = diffX * 0.2;
			}
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		const touchEndTime = Date.now();
		const duration = touchEndTime - touchStartTime;
		const velocity = Math.abs(touchCurrentX - touchStartX) / duration;
		const velocityY = (touchCurrentY - touchStartY) / duration;

		if (isClosingGesture) {
			if (swipeOffsetY > SWIPE_CLOSE_THRESHOLD || velocityY > VELOCITY_THRESHOLD) {
				animateClose();
			} else {
				resetVerticalPosition();
			}
		} else if (isHorizontalSwipe) {
			const diffX = touchStartX - touchCurrentX;

			if (Math.abs(diffX) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
				if (diffX > 0 && nextGamePreview) {
					animateSwipeTransition('left');
				} else if (diffX < 0 && prevGamePreview) {
					animateSwipeTransition('right');
				} else {
					resetSwipePosition();
				}
			} else {
				resetSwipePosition();
			}
		}

		isVerticalSwipe = false;
		isHorizontalSwipe = false;
		isClosingGesture = false;
	}

	function animateClose() {
		isSwipeTransitioning = true;
		animationPhase = 'closing';

		const startOffset = swipeOffsetY;
		const targetOffset = window.innerHeight;
		const startTime = performance.now();
		const duration = 300;

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			swipeOffsetY = startOffset + (targetOffset - startOffset) * eased;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				modalStore.closeModal();
				swipeOffsetY = 0;
				isSwipeTransitioning = false;
				animationPhase = 'closed';
			}
		}

		requestAnimationFrame(animate);
	}

	function resetVerticalPosition() {
		const startOffset = swipeOffsetY;
		const startTime = performance.now();
		const duration = 300;

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 4) * Math.cos(progress * Math.PI * 0.5);

			swipeOffsetY = startOffset * (1 - eased);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				swipeOffsetY = 0;
			}
		}

		requestAnimationFrame(animate);
	}

	function animateSwipeTransition(direction: 'left' | 'right') {
		isSwipeTransitioning = true;
		const targetOffset = direction === 'left' ? -300 : 300;
		const startOffset = swipeOffsetX;
		const startParallax = parallaxOffset;
		// Parallax animates from current position (~50%) to 0 (centered/final position)
		const targetParallax = 0;
		const startTime = performance.now();
		const duration = 280; // Slightly longer for smoother feel

		// Smooth easing: starts fast, decelerates naturally (ease-out cubic)
		function easeOutCubic(t: number): number {
			return 1 - Math.pow(1 - t, 3);
		}

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutCubic(progress);

			swipeOffsetX = startOffset + (targetOffset - startOffset) * eased;
			parallaxOffset = startParallax + (targetParallax - startParallax) * eased;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				// Navigate first, then immediately reset offsets
				if (direction === 'left') {
					navigateToNext();
				} else {
					navigateToPrevious();
				}
				// Reset immediately - no delay for smoother transition
				swipeOffsetX = 0;
				parallaxOffset = 0;
				isSwipeTransitioning = false;
				swipeDirection = null;
			}
		}

		requestAnimationFrame(animate);
	}

	function resetSwipePosition() {
		isSwipeTransitioning = true;
		const startOffset = swipeOffsetX;
		const startParallax = parallaxOffset;
		const startTime = performance.now();
		const duration = 250; // Quick snap-back

		// Smooth spring-like easing for reset (ease-out expo)
		function easeOutExpo(t: number): number {
			return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
		}

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = easeOutExpo(progress);

			swipeOffsetX = startOffset * (1 - eased);
			parallaxOffset = startParallax * (1 - eased);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				swipeOffsetX = 0;
				parallaxOffset = 0;
				isSwipeTransitioning = false;
				swipeDirection = null;
			}
		}

		requestAnimationFrame(animate);
	}

	function getFocusableElements(): HTMLElement[] {
		if (!modalElement) return [];
		const focusableSelectors = [
			'button',
			'[href]',
			'input',
			'select',
			'textarea',
			'[tabindex]:not([tabindex="-1"])'
		];
		return Array.from(
			modalElement.querySelectorAll(focusableSelectors.join(', '))
		) as HTMLElement[];
	}

	function handleFocusTrap(event: KeyboardEvent) {
		if (event.key !== 'Tab') return;

		focusableElements = getFocusableElements();
		if (focusableElements.length === 0) return;

		firstFocusableElement = focusableElements[0];
		lastFocusableElement = focusableElements[focusableElements.length - 1];

		if (event.shiftKey) {
			if (document.activeElement === firstFocusableElement) {
				event.preventDefault();
				lastFocusableElement.focus();
			}
		} else {
			if (document.activeElement === lastFocusableElement) {
				event.preventDefault();
				firstFocusableElement.focus();
			}
		}
	}

	let currentTabGames = $derived.by(() => {
		const games = displayedGames;

		switch (currentActiveTab) {
			case 'all': {
				return games.toSorted((a, b) => a.title.localeCompare(b.title));
			}

			case 'completed': {
				return games
					.filter((game) => game.status === 'Completed')
					.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
			}

			case 'planned': {
				return games
					.filter((game) => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
			}

			case 'tierlist': {
				const tierMapping: Record<string, string> = {
					S: 'S - Masterpiece',
					A: 'A - Amazing',
					B: 'B - Great',
					C: 'C - Good',
					D: 'D - Decent',
					E: 'E - Bad'
				};

				const tierOrder = [
					'S - Masterpiece',
					'A - Amazing',
					'B - Great',
					'C - Good',
					'D - Decent',
					'E - Bad'
				];

				const gamesByTier: Record<string, Game[]> = {};
				games
					.filter((game) => game.status === 'Completed' && game.tier)
					.forEach((game) => {
						const tierKey = tierMapping[game.tier!] || game.tier!;
						if (!gamesByTier[tierKey]) {
							gamesByTier[tierKey] = [];
						}
						gamesByTier[tierKey].push(game);
					});

				const result: Game[] = [];
				tierOrder.forEach((tierKey) => {
					if (gamesByTier[tierKey]) {
						result.push(...gamesByTier[tierKey]);
					}
				});

				return result;
			}

			default: {
				return games.toSorted((a, b) => a.title.localeCompare(b.title));
			}
		}
	});

	let allTieredGames = $derived.by(() => {
		const sourceGames = currentActiveTab === 'tierlist' ? allGames : displayedGames;

		const tierOrder = [
			'S - Masterpiece',
			'A - Amazing',
			'B - Great',
			'C - Good',
			'D - Decent',
			'E - Bad'
		];

		const gamesByTier: Record<string, Game[]> = {
			'S - Masterpiece': [],
			'A - Amazing': [],
			'B - Great': [],
			'C - Good': [],
			'D - Decent': [],
			'E - Bad': []
		};

		sourceGames
			.filter((game) => game.tier)
			.forEach((game) => {
				const tier = game.tier!;
				if (gamesByTier[tier]) {
					gamesByTier[tier].push(game);
				}
			});

		const result: Game[] = [];
		for (const tierName of tierOrder) {
			const bucket = gamesByTier[tierName] || [];
			if (bucket.length) {
				result.push(...bucket);
			}
		}

		return result;
	});

	let currentGameIndex = $derived.by(() => {
		if (!$modalStore.activeGame) return -1;

		if ($modalStore.displayedGames.length > 0) {
			return $modalStore.displayedGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
		}
		if (currentActiveTab === 'tierlist') {
			const tierGames = allTieredGames;
			return tierGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
		}
		const tabGames = currentTabGames;
		return tabGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
	});

	function navigateToPrevious() {
		const index = currentGameIndex;
		const games = displayedGames;

		if (index > 0) {
			const prevGame = games[index - 1];
			modalStore.openViewModal(prevGame, games);
		}
	}

	function navigateToNext() {
		const index = currentGameIndex;
		const games = displayedGames;

		if (index < games.length - 1) {
			const nextGame = games[index + 1];
			modalStore.openViewModal(nextGame, games);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		handleFocusTrap(event);

		if (!$modalStore.isOpen || $modalStore.mode !== 'view') {
			return;
		}

		if (event.key === 'Escape') {
			event.preventDefault();
			event.stopPropagation();
			modalStore.closeModal();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			event.stopPropagation();
			navigateToPrevious();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
			event.stopPropagation();
			navigateToNext();
		}
	}

	function handleOverlayClick(event: MouseEvent) {
		if (event.target === modalElement) {
			modalStore.closeModal();
		}
	}

	function handleImageLoad() {
		if (modalImageElement) {
			modalImageElement.classList.add('loaded');
		}
	}

	function handleImageError() {
		if (modalImageElement) {
			modalImageElement.classList.add('loaded');
		}
	}

	function formatDate(dateString: string | null): string {
		if (!dateString) return 'Not completed';
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return 'Invalid date';
		}
	}

	function getPlatformColor(platform: string): string {
		return PLATFORM_COLORS[platform] || 'bg-gray-600 text-white';
	}

	function getGenreColor(genre: string): string {
		return GENRE_COLORS[genre] || 'bg-gray-600 text-white';
	}

	function getRatingBarColor(rating: number): string {
		if (rating >= 8) return 'bg-gradient-to-r from-[#388E3C] to-[#4CAF50]';
		if (rating >= 6) return 'bg-gradient-to-r from-[#A4D454] to-[#8BC34A]';
		if (rating >= 5) return 'bg-gradient-to-r from-[#FFC107] to-[#FFEB3B]';
		if (rating >= 3) return 'bg-gradient-to-r from-[#FF832B] to-[#FF9800]';
		return 'bg-gradient-to-r from-[#D32F2F] to-[#F44336]';
	}

	async function shareGame() {
		if (!browser || !$modalStore.activeGame) return;

		try {
			const url = new URL(window.location.href);
			const slug = createGameSlug($modalStore.activeGame.title);
			url.searchParams.set('game', slug);

			await navigator.clipboard.writeText(url.toString());
			linkToGame = 'Copied';
			setTimeout(() => {
				linkToGame = '';
			}, 2000);
		} catch (error) {
			console.warn('Failed to copy to clipboard:', error);
			linkToGame = 'Failed';
			setTimeout(() => {
				linkToGame = '';
			}, 2000);
		}
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

	// Show swipe indicator only on first-ever modal open (using sessionStorage)
	const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';

	// Track displayedGames.length explicitly to ensure effect re-runs when games load
	const gamesCount = $derived(displayedGames.length);

	// Track if we've already triggered the hint in this session (prevents re-triggering)
	let hasTriggeredHint = false;

	$effect(() => {
		// Explicitly track these values to ensure effect re-runs appropriately
		const currentGamesCount = gamesCount;
		const isModalOpen = $modalStore.isOpen;
		const isViewMode = $modalStore.mode === 'view';

		if (!browser || !isModalOpen || !isViewMode) {
			return;
		}

		// Check if user has already seen the swipe hint THIS SESSION (using sessionStorage)
		// sessionStorage clears when the tab/PWA closes, so hint shows again on next visit
		const hasSeenHint = sessionStorage.getItem(SWIPE_HINT_KEY);
		if (hasSeenHint) {
			return;
		}

		// Check if on mobile (screen width < 768px)
		const isMobile = window.innerWidth < 768;
		const canNavigate = currentGamesCount > 1;

		// Only show if on mobile and can navigate between games
		if (!isMobile || !canNavigate) {
			return;
		}

		// Prevent re-triggering in this session
		if (hasTriggeredHint || showSwipeIndicator) {
			return;
		}

		// Mark as triggered immediately (before any async operations)
		hasTriggeredHint = true;

		// Use a small delay to ensure the modal is fully rendered
		swipeIndicatorTimeout = setTimeout(() => {
			// Show the indicator
			showSwipeIndicator = true;

			// Hide indicator after 5 seconds and mark as seen in sessionStorage
			swipeHideTimeout = setTimeout(() => {
				showSwipeIndicator = false;
				sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
				swipeIndicatorTimeout = null;
				swipeHideTimeout = null;
			}, 5000);
		}, 300);
	});

	// Dismiss swipe hint early when user clicks/taps
	function dismissSwipeHint() {
		if (swipeIndicatorTimeout) {
			clearTimeout(swipeIndicatorTimeout);
			swipeIndicatorTimeout = null;
		}
		if (swipeHideTimeout) {
			clearTimeout(swipeHideTimeout);
			swipeHideTimeout = null;
		}
		showSwipeIndicator = false;
		sessionStorage.setItem(SWIPE_HINT_KEY, 'true');
	}

	// Cleanup timeout on destroy
	onDestroy(() => {
		if (swipeIndicatorTimeout) {
			clearTimeout(swipeIndicatorTimeout);
		}
		if (swipeHideTimeout) {
			clearTimeout(swipeHideTimeout);
		}
	});
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4"
		style="background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);"
		transition:fade={{ duration: isIOS ? 250 : 200 }}
		onclick={handleOverlayClick}
		onkeydown={(e) => e.key === 'Escape' && modalStore.closeModal()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		<!-- Mobile swipe indicator (first time only) -->
		{#if showSwipeIndicator && displayedGames.length > 1}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="swipe-hint-overlay md:hidden"
				transition:fade={{ duration: 400 }}
				onclick={dismissSwipeHint}
			>
				<div class="swipe-hint-content">
					<!-- SVG-based Simple Double Chevron Hint -->
					<svg
						class="swipe-hint-svg"
						viewBox="0 0 120 80"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<!-- Left double chevron << -->
						<path
							class="swipe-arrow swipe-arrow-left"
							d="M20 33 L13 40 L20 47 M30 33 L23 40 L30 47"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<!-- Down double chevron vv -->
						<path
							class="swipe-arrow swipe-arrow-down"
							d="M55 58 L60 63 L65 58 M55 66 L60 71 L65 66"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<!-- Right double chevron >> -->
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

		<!-- Parallax Preview: Previous Game -->
		{#if prevGamePreview && swipeDirection === 'right' && Math.abs(swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-left"
				style="transform: translateX({100 + parallaxOffset}%); opacity: {Math.min(
					Math.abs(swipeOffsetX) / 50,
					1
				)}; background-color: {prevGamePreview.status === 'Completed'
					? 'var(--color-surface-completed)'
					: 'var(--color-surface)'};"
			>
				<div class="parallax-modal-content">
					<div class="parallax-image-section">
						<img
							src={prevGamePreview.coverImage.replace('.webp', '-detail.webp')}
							alt={prevGamePreview.title}
							class="parallax-preview-image"
						/>
					</div>
					<div class="parallax-details-section">
						<div class="parallax-title-container">
							<h3 class="parallax-title">{prevGamePreview.mainTitle || prevGamePreview.title}</h3>
							{#if prevGamePreview.subtitle}
								<p class="parallax-subtitle">{prevGamePreview.subtitle}</p>
							{/if}
						</div>
						<div class="parallax-badges-row">
							<div class="parallax-badges">
								<span class="parallax-badge {getPlatformColor(prevGamePreview.platform)}"
									>{prevGamePreview.platform}</span
								>
								<span class="parallax-badge {getGenreColor(prevGamePreview.genre)}"
									>{prevGamePreview.genre}</span
								>
								{#if prevGamePreview.coOp === 'Yes'}
									<div class="parallax-coop-badge" title="Co-op Available">
										<Users size={18} />
									</div>
								{/if}
							</div>
							{#if prevGamePreview.tier}
								<span class="parallax-tier-badge {getTierClass(prevGamePreview.tier)}"
									>{getTierDisplayName(prevGamePreview.tier)}</span
								>
							{/if}
						</div>
						<div class="parallax-info-grid">
							<div class="parallax-info-item">
								<span class="parallax-label">Year Released</span>
								<span class="parallax-value">{prevGamePreview.year}</span>
							</div>
							<div class="parallax-info-item"></div>
							<div class="parallax-info-item">
								<span class="parallax-label">Finished Date</span>
								<span class="parallax-value">{formatDate(prevGamePreview.finishedDate)}</span>
							</div>
							{#if prevGamePreview.status === 'Completed'}
								<div class="parallax-info-item">
									<span class="parallax-label">Hours Played</span>
									<span class="parallax-value">{prevGamePreview.hoursPlayed || 'N/A'}</span>
								</div>
							{:else}
								<div class="parallax-info-item">
									<span class="parallax-label">Time to Beat</span>
									<span class="parallax-value">{prevGamePreview.timeToBeat || 'N/A'}</span>
								</div>
							{/if}
						</div>
						<!-- Ratings Section -->
						{#if prevGamePreview.status === 'Completed' && prevGamePreview.ratingPresentation !== null && prevGamePreview.ratingStory !== null && prevGamePreview.ratingGameplay !== null}
							<div class="parallax-ratings">
								<h4 class="parallax-ratings-title">Ratings</h4>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Presentation size={20} class="parallax-rating-icon text-rose-500" />
										<span class="parallax-rating-label">Presentation</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(
												prevGamePreview.ratingPresentation
											)}"
											style="width: {prevGamePreview.ratingPresentation * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{prevGamePreview.ratingPresentation}/10</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<NotebookPen size={20} class="parallax-rating-icon text-sky-500" />
										<span class="parallax-rating-label">Story</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(prevGamePreview.ratingStory)}"
											style="width: {prevGamePreview.ratingStory * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{prevGamePreview.ratingStory}/10</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Gamepad2 size={20} class="parallax-rating-icon text-emerald-500" />
										<span class="parallax-rating-label">Gameplay</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(
												prevGamePreview.ratingGameplay
											)}"
											style="width: {prevGamePreview.ratingGameplay * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{prevGamePreview.ratingGameplay}/10</span>
								</div>
							</div>
							<!-- Score Section -->
							{#if prevGamePreview.score !== null}
								<div class="parallax-score-card">
									<Award size={24} class="text-yellow-500" />
									<span class="parallax-score">Total Score: {prevGamePreview.score}/20</span>
								</div>
							{/if}
						{:else}
							<div class="parallax-ratings">
								<h4 class="parallax-ratings-title">Ratings</h4>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Presentation size={20} class="parallax-rating-icon text-rose-500" />
										<span class="parallax-rating-label">Presentation</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<NotebookPen size={20} class="parallax-rating-icon text-sky-500" />
										<span class="parallax-rating-label">Story</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Gamepad2 size={20} class="parallax-rating-icon text-emerald-500" />
										<span class="parallax-rating-label">Gameplay</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
							</div>
							<div class="parallax-score-card parallax-pending-card">
								<Award size={24} class="text-gray-400" />
								<span class="parallax-pending">Game to be completed</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Parallax Preview: Next Game -->
		{#if nextGamePreview && swipeDirection === 'left' && Math.abs(swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-right"
				style="transform: translateX({-100 + parallaxOffset}%); opacity: {Math.min(
					Math.abs(swipeOffsetX) / 50,
					1
				)}; background-color: {nextGamePreview.status === 'Completed'
					? 'var(--color-surface-completed)'
					: 'var(--color-surface)'};"
			>
				<div class="parallax-modal-content">
					<div class="parallax-image-section">
						<img
							src={nextGamePreview.coverImage.replace('.webp', '-detail.webp')}
							alt={nextGamePreview.title}
							class="parallax-preview-image"
						/>
					</div>
					<div class="parallax-details-section">
						<div class="parallax-title-container">
							<h3 class="parallax-title">{nextGamePreview.mainTitle || nextGamePreview.title}</h3>
							{#if nextGamePreview.subtitle}
								<p class="parallax-subtitle">{nextGamePreview.subtitle}</p>
							{/if}
						</div>
						<div class="parallax-badges-row">
							<div class="parallax-badges">
								<span class="parallax-badge {getPlatformColor(nextGamePreview.platform)}"
									>{nextGamePreview.platform}</span
								>
								<span class="parallax-badge {getGenreColor(nextGamePreview.genre)}"
									>{nextGamePreview.genre}</span
								>
								{#if nextGamePreview.coOp === 'Yes'}
									<div class="parallax-coop-badge" title="Co-op Available">
										<Users size={18} />
									</div>
								{/if}
							</div>
							{#if nextGamePreview.tier}
								<span class="parallax-tier-badge {getTierClass(nextGamePreview.tier)}"
									>{getTierDisplayName(nextGamePreview.tier)}</span
								>
							{/if}
						</div>
						<div class="parallax-info-grid">
							<div class="parallax-info-item">
								<span class="parallax-label">Year Released</span>
								<span class="parallax-value">{nextGamePreview.year}</span>
							</div>
							<div class="parallax-info-item"></div>
							<div class="parallax-info-item">
								<span class="parallax-label">Finished Date</span>
								<span class="parallax-value">{formatDate(nextGamePreview.finishedDate)}</span>
							</div>
							{#if nextGamePreview.status === 'Completed'}
								<div class="parallax-info-item">
									<span class="parallax-label">Hours Played</span>
									<span class="parallax-value">{nextGamePreview.hoursPlayed || 'N/A'}</span>
								</div>
							{:else}
								<div class="parallax-info-item">
									<span class="parallax-label">Time to Beat</span>
									<span class="parallax-value">{nextGamePreview.timeToBeat || 'N/A'}</span>
								</div>
							{/if}
						</div>
						<!-- Ratings Section -->
						{#if nextGamePreview.status === 'Completed' && nextGamePreview.ratingPresentation !== null && nextGamePreview.ratingStory !== null && nextGamePreview.ratingGameplay !== null}
							<div class="parallax-ratings">
								<h4 class="parallax-ratings-title">Ratings</h4>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Presentation size={20} class="parallax-rating-icon text-rose-500" />
										<span class="parallax-rating-label">Presentation</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(
												nextGamePreview.ratingPresentation
											)}"
											style="width: {nextGamePreview.ratingPresentation * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{nextGamePreview.ratingPresentation}/10</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<NotebookPen size={20} class="parallax-rating-icon text-sky-500" />
										<span class="parallax-rating-label">Story</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(nextGamePreview.ratingStory)}"
											style="width: {nextGamePreview.ratingStory * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{nextGamePreview.ratingStory}/10</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Gamepad2 size={20} class="parallax-rating-icon text-emerald-500" />
										<span class="parallax-rating-label">Gameplay</span>
									</div>
									<div class="parallax-rating-bar">
										<div
											class="parallax-rating-fill {getRatingBarColor(
												nextGamePreview.ratingGameplay
											)}"
											style="width: {nextGamePreview.ratingGameplay * 10}%"
										></div>
									</div>
									<span class="parallax-rating-value">{nextGamePreview.ratingGameplay}/10</span>
								</div>
							</div>
							<!-- Score Section -->
							{#if nextGamePreview.score !== null}
								<div class="parallax-score-card">
									<Award size={24} class="text-yellow-500" />
									<span class="parallax-score">Total Score: {nextGamePreview.score}/20</span>
								</div>
							{/if}
						{:else}
							<div class="parallax-ratings">
								<h4 class="parallax-ratings-title">Ratings</h4>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Presentation size={20} class="parallax-rating-icon text-rose-500" />
										<span class="parallax-rating-label">Presentation</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<NotebookPen size={20} class="parallax-rating-icon text-sky-500" />
										<span class="parallax-rating-label">Story</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
								<div class="parallax-rating-row">
									<div class="parallax-rating-label-group">
										<Gamepad2 size={20} class="parallax-rating-icon text-emerald-500" />
										<span class="parallax-rating-label">Gameplay</span>
									</div>
									<div class="parallax-rating-bar">
										<div class="parallax-rating-fill-empty"></div>
									</div>
									<span class="parallax-rating-value">N/A</span>
								</div>
							</div>
							<div class="parallax-score-card parallax-pending-card">
								<Award size={24} class="text-gray-400" />
								<span class="parallax-pending">Game to be completed</span>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		<!-- Desktop navigation arrows - on backdrop, outside modal -->
		{#if currentGameIndex > 0}
			<button
				onclick={navigateToPrevious}
				class="absolute top-1/2 z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-black/20 text-white/90 backdrop-blur-sm transition-all outline-none hover:scale-110 hover:bg-black/40 focus:outline-none md:flex"
				style="left: calc(50% - 500px - 120px);"
				aria-label="Previous game"
			>
				<ChevronLeft size={28} />
			</button>
		{/if}
		{#if (() => {
			const games = displayedGames;
			return currentGameIndex > -1 && currentGameIndex < games.length - 1;
		})()}
			<button
				onclick={navigateToNext}
				class="absolute top-1/2 z-[61] hidden h-14 w-14 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-none bg-black/20 text-white/90 backdrop-blur-sm transition-all outline-none hover:scale-110 hover:bg-black/40 focus:outline-none md:flex"
				style="right: calc(50% - 500px - 120px);"
				aria-label="Next game"
			>
				<ChevronRight size={28} />
			</button>
		{/if}

		<div
			class="modal-content relative flex h-auto w-full max-w-[500px] flex-col overflow-hidden rounded-xl shadow-2xl md:max-h-[85vh] md:w-[95%] md:max-w-[1000px]"
			class:ios-modal={isIOS}
			class:android-modal={isAndroid}
			class:swiping-close={isClosingGesture}
			style="background-color: var(--color-surface); 
				transform: translateX({swipeOffsetX}px) translateY({swipeOffsetY}px) 
					scale({1 - Math.abs(swipeOffsetX) * 0.0003 - swipeOffsetY * 0.0008}); 
				opacity: {1 - Math.abs(swipeOffsetX) * 0.002 - swipeOffsetY * 0.002};
				border-radius: {12 + swipeOffsetY * 0.1}px;"
			role="document"
			ontouchstart={handleTouchStart}
			ontouchmove={handleTouchMove}
			ontouchend={handleTouchEnd}
			in:fly={{
				y: isIOS ? 60 : 40,
				duration: isIOS ? 400 : 250,
				easing: isIOS ? backOut : cubicOut
			}}
			out:fly={{
				y: isIOS ? 100 : 30,
				duration: isIOS ? 300 : 200,
				easing: cubicOut
			}}
		>
			<button
				onclick={() => modalStore.closeModal()}
				class="absolute top-3 right-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-black/10 text-white backdrop-blur-sm transition-colors outline-none hover:bg-black/30 focus:outline-none md:top-4 md:right-4 md:bg-black/10 md:text-white md:hover:bg-black/30"
				aria-label="Close modal"
			>
				<X size={20} />
			</button>
			<div
				class="modal-layout flex h-full flex-col md:grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr]"
			>
				<div
					class="modal-image-container relative flex-1 overflow-hidden rounded-t-xl md:shrink-0 md:flex-none md:rounded-l-xl md:rounded-tr-none"
				>
					<div class="modal-image-wrapper">
						<div class="modal-skeleton-loader"></div>
						<button
							class="contents"
							onclick={() => (isImageFullScreen = true)}
							aria-label="View full screen cover"
						>
							<img
								bind:this={modalImageElement}
								src={detailImageSrc}
								srcset={detailImageSrcset}
								sizes={detailImageSizes}
								alt="{$modalStore.activeGame.title} cover"
								class="modal-cover-image h-full w-full cursor-pointer object-cover transition-transform"
								loading="eager"
								fetchpriority="high"
								decoding="async"
								onload={handleImageLoad}
								onerror={handleImageError}
							/>
						</button>
						<button
							onclick={shareGame}
							class="absolute bottom-3 left-3 z-20 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:hidden {linkToGame
								? 'px-3 py-3'
								: 'h-8 w-8'}"
							aria-label="Share game"
						>
							{#if linkToGame}
								<span class="text-xs font-medium">{linkToGame}</span>
							{:else}
								<Link size={18} />
							{/if}
						</button>
					</div>
				</div>

				<div
					class="modal-details-section shrink-0 overflow-hidden px-5 pt-4 pb-4 md:flex-1 md:overflow-y-auto md:pb-6 lg:pr-8 lg:pb-5 lg:pl-8"
				>
					<div class="mb-2 flex items-start justify-between gap-4 md:mb-4">
						<h1
							id="modal-title"
							class="flex min-w-0 flex-1 flex-col justify-start md:h-auto"
							style="color: var(--color-text-primary);"
						>
							<span
								class="modal-title-text w-full font-bold"
								style="font-size: clamp(1rem, 5vw, 1.65rem);"
							>
								{$modalStore.activeGame.mainTitle}
							</span>
							{#if $modalStore.activeGame.subtitle}
								<span
									class="w-full truncate text-sm font-semibold md:text-lg"
									style="line-height: 1.2; color: var(--color-text-secondary);"
									>{$modalStore.activeGame.subtitle}</span
								>
							{/if}
						</h1>

						<button
							onclick={shareGame}
							class="mr-10 hidden h-8 cursor-pointer items-center justify-center rounded-full bg-transparent transition-colors hover:bg-black/10 md:flex dark:bg-transparent dark:hover:bg-white/10 {linkToGame
								? 'w-auto px-3'
								: 'w-8'}"
							aria-label="Share game"
						>
							{#if linkToGame}
								<span
									style="color: var(--color-text-primary)"
									class="text-sm font-medium text-gray-700 dark:text-gray-200"
								>
									{linkToGame}
								</span>
							{:else}
								<Link
									size={18}
									style="color: var(--color-text-primary)"
									class="text-gray-700 dark:text-gray-200"
								/>
							{/if}
						</button>
					</div>

					<div class="mb-3 flex items-center justify-between md:mb-4">
						<div class="flex flex-wrap gap-2">
							<span
								class="rounded-md px-3 py-1.5 text-sm font-medium text-white md:text-sm {getPlatformColor(
									$modalStore.activeGame.platform
								)}"
							>
								{$modalStore.activeGame.platform}
							</span>
							<span
								class="rounded-md px-3 py-1.5 text-sm font-medium text-white md:text-sm {getGenreColor(
									$modalStore.activeGame.genre
								)}"
							>
								{$modalStore.activeGame.genre}
							</span>
							{#if $modalStore.activeGame.coOp === 'Yes'}
								<div
									class="flex items-center justify-center rounded-md bg-blue-500/10 px-2 text-blue-500 dark:text-blue-400"
									title="Co-op Available"
								>
									<Users size={18} />
								</div>
							{/if}
						</div>

						{#if $modalStore.activeGame.tier}
							<span
								class="tier-badge rounded-md px-3 py-1.5 text-sm font-semibold md:text-sm {getTierClass(
									$modalStore.activeGame.tier
								)}"
							>
								{getTierDisplayName($modalStore.activeGame.tier)}
							</span>
						{/if}
					</div>

					<div class="mb-3 grid grid-cols-2 gap-3 md:mb-8">
						<div>
							<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
								Year Released
							</div>
							<div
								class="text-base font-semibold md:text-base"
								style="color: var(--color-text-primary);"
							>
								{$modalStore.activeGame.year}
							</div>
						</div>

						<div></div>

						<div>
							<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
								Finished Date
							</div>
							<div
								class="text-base font-semibold md:text-base"
								style="color: var(--color-text-primary);"
							>
								{formatDate($modalStore.activeGame.finishedDate)}
							</div>
						</div>

						{#if $modalStore.activeGame.status === 'Completed'}
							<div>
								<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
									Hours Played
								</div>
								<div
									class="text-base font-semibold md:text-base"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.hoursPlayed || 'Not completed'}
								</div>
							</div>
						{:else}
							<div>
								<div class="mb-1 text-sm md:text-sm" style="color: var(--color-text-tertiary);">
									Time to Beat
								</div>
								<div
									class="text-base font-semibold md:text-base"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.timeToBeat}
								</div>
							</div>
						{/if}
					</div>

					{#if $modalStore.activeGame.status === 'Completed' && $modalStore.activeGame.ratingPresentation !== null && $modalStore.activeGame.ratingStory !== null && $modalStore.activeGame.ratingGameplay !== null}
						<div class="mt-3 space-y-3 md:space-y-4">
							<h3
								class="mb-3 text-base font-semibold md:mb-4 md:text-xl"
								style="color: var(--color-text-primary);"
							>
								Ratings
							</h3>
							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-rose-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Presentation</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingPresentation
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingPresentation * 10}%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingPresentation}/10
								</span>
							</div>

							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-sky-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Story</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingStory
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingStory * 10}%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingStory}/10
								</span>
							</div>

							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-emerald-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Gameplay</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingGameplay
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingGameplay * 10}%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingGameplay}/10
								</span>
							</div>

							{#if $modalStore.activeGame.score !== null}
								<div
									class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 md:mt-6 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"
								>
									<div class="flex items-center justify-center gap-2">
										<Award size={24} class="text-yellow-500" />
										<span
											class="text-sm font-bold md:text-lg"
											style="color: var(--color-text-primary);"
										>
											Total Score: {$modalStore.activeGame.score}/20
										</span>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="mt-3 space-y-3 md:space-y-4">
							<h3
								class="mb-3 text-base font-semibold md:mb-4 md:text-xl"
								style="color: var(--color-text-primary);"
							>
								Ratings
							</h3>

							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-rose-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Presentation</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									N/A
								</span>
							</div>

							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-sky-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Story</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									N/A
								</span>
							</div>

							<div class="flex items-center gap-2">
								<div class="flex min-w-0 w-24 md:w-32 shrink-0 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-emerald-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Gameplay</span
									>
								</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
								<span
									class="w-8 shrink-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									N/A
								</span>
							</div>

							<div
								class="mt-6 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 md:mt-6 dark:border-gray-700"
							>
								<div class="flex items-center justify-center gap-2">
									<Award size={24} class="text-gray-400" />
									<span
										class="text-sm font-bold md:text-lg"
										style="color: var(--color-text-primary);"
									>
										Game to be completed
									</span>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>

	{#if isImageFullScreen}
		<div
			class="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
			transition:fade={{ duration: 200 }}
			onclick={() => (isImageFullScreen = false)}
			onkeydown={(e) => e.key === 'Escape' && (isImageFullScreen = false)}
			role="button"
			tabindex="0"
			aria-label="Close full screen view"
		>
			<button
				class="absolute top-4 right-4 z-[70] rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
				onclick={(e) => {
					e.stopPropagation();
					isImageFullScreen = false;
				}}
				aria-label="Close full screen"
			>
				<X size={32} />
			</button>
			<button
				class="contents"
				onclick={() => (isImageFullScreen = false)}
				aria-label="Close full screen view"
			>
				<img
					src={detailImageSrc}
					srcset={detailImageSrcset}
					alt="{$modalStore.activeGame.title} full cover"
					class="max-h-full max-w-full cursor-zoom-out object-contain shadow-2xl"
				/>
			</button>
		</div>
	{/if}
{/if}

<style>
	.modal-image-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 120px;
		overflow: hidden;
	}

	/* Mobile: image container grows to fill available space */
	.modal-image-container {
		min-height: 120px;
	}

	/* Mobile: details section should not scroll, stays compact */
	@media (max-width: 767px) {
		.modal-details-section {
			max-height: none;
			overflow: visible;
		}
	}

	#modal-title {
		min-height: 65px;
	}

	@media (min-width: 768px) {
		.modal-image-wrapper {
			width: 400px;
			height: auto;
			aspect-ratio: 2/3;
			max-height: 80vh;
		}
	}

	@media (min-width: 1024px) {
		.modal-image-wrapper {
			width: 100%;
			aspect-ratio: 2/3;
		}

		#modal-title {
			min-height: 90px;
		}
	}

	.modal-skeleton-loader {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--color-surface) 0%,
			var(--color-surface) 25%,
			#2a2a2a 50%,
			var(--color-surface) 75%,
			var(--color-surface) 100%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 3s ease-in-out infinite;
		z-index: 1;
		opacity: 0.8;
	}

	:global(.light) .modal-skeleton-loader {
		background: linear-gradient(
			90deg,
			#f8f9fa 0%,
			#f8f9fa 25%,
			#e9ecef 50%,
			#f8f9fa 75%,
			#f8f9fa 100%
		);
	}

	.modal-cover-image {
		position: relative;
		z-index: 2;
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
		filter: blur(2px);
	}

	.modal-cover-image.loaded {
		opacity: 1;
		filter: blur(0px);
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	.modal-content {
		will-change: transform, opacity;
		transition: box-shadow 0.2s ease;
	}

	/* Mobile: fill viewport height minus padding, use flex layout */
	@media (max-width: 767px) {
		.modal-content {
			height: calc(100dvh - 24px);
			max-height: calc(100dvh - 24px);
			overflow: hidden;
		}

		.modal-layout {
			height: 100%;
		}

		.modal-image-container {
			flex: 1 1 auto;
			min-height: 0;
		}

		.modal-details-section {
			flex: 0 0 auto;
		}
	}

	/* Desktop: reset to auto height */
	@media (min-width: 768px) {
		.modal-content {
			height: auto;
			max-height: 85vh;
			min-height: unset;
			overflow: visible;
		}
	}

	.ios-modal {
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.android-modal {
		box-shadow:
			0 24px 38px 3px rgba(0, 0, 0, 0.14),
			0 9px 46px 8px rgba(0, 0, 0, 0.12),
			0 11px 15px -7px rgba(0, 0, 0, 0.2);
	}

	.modal-content::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 100;
		opacity: 0;
		transition: opacity 0.2s ease;
		border-radius: inherit;
	}

	@media (pointer: coarse) {
		.modal-content {
			touch-action: pan-y pinch-zoom;
		}
	}

	/* Parallax preview - match main modal sizing exactly */
	.parallax-preview {
		position: fixed;
		top: 12px;
		width: calc(100% - 24px);
		max-width: 500px;
		height: calc(100dvh - 24px);
		border-radius: 12px;
		overflow: hidden;
		z-index: 59;
		pointer-events: none;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
		background: var(--color-surface);
		/* GPU acceleration for smooth animations */
		will-change: transform, opacity;
		transform: translate3d(0, 0, 0);
		backface-visibility: hidden;
	}

	.parallax-left {
		right: 100%;
		margin-right: -20px;
	}

	.parallax-right {
		left: 100%;
		margin-left: -20px;
	}

	.parallax-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.parallax-cover {
		width: 100%;
		aspect-ratio: 2/3;
		max-height: 50vh;
		overflow: hidden;
	}

	.parallax-modal-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	/* Image section - matches .modal-image-container behavior on mobile */
	.parallax-image-section {
		position: relative;
		width: 100%;
		flex: 1 1 auto;
		min-height: 0;
		overflow: hidden;
	}

	.parallax-preview-image {
		position: relative;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Details section - matches .modal-details-section on mobile exactly */
	.parallax-details-section {
		/* Match modal: px-5 pt-4 pb-4 = padding: 16px 20px */
		padding: 16px 20px;
		background: transparent;
		flex: 0 0 auto;
		overflow: hidden;
	}

	.parallax-info {
		padding: 16px;
		background: transparent;
	}

	.parallax-title-container {
		/* Match modal #modal-title: min-height: 65px */
		min-height: 65px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		margin-bottom: 8px; /* mb-2 */
	}

	.parallax-title {
		/* Match modal: font-size: clamp(1rem, 5vw, 1.65rem) */
		font-size: clamp(1rem, 5vw, 1.65rem);
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.parallax-subtitle {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.2;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Badge row with tier badge on right - match modal: mb-3 */
	.parallax-badges-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 12px;
	}

	.parallax-badges {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
	}

	.parallax-badge {
		/* Match modal: px-3 py-1.5 rounded-md */
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 0.875rem;
		font-weight: 500;
		color: white;
	}

	.parallax-tier-badge {
		padding: 6px 12px;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
	}

	.parallax-coop-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 6px;
		border-radius: 6px;
		background: rgba(59, 130, 246, 0.1);
		color: rgb(59, 130, 246);
	}

	:global(.dark) .parallax-coop-badge {
		color: rgb(96, 165, 250);
	}

	.parallax-info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		/* Match modal: gap-3 mb-3 */
		gap: 12px;
		margin-bottom: 12px;
	}

	.parallax-info-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.parallax-label {
		/* Match modal: text-sm */
		font-size: 0.875rem;
		color: var(--color-text-tertiary);
		margin-bottom: 4px;
	}

	.parallax-value {
		/* Match modal: text-base font-semibold */
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.parallax-ratings {
		/* Match modal: mt-3 space-y-3 */
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-top: 12px;
	}

	.parallax-ratings-title {
		/* Match modal: text-base font-semibold mb-3 */
		font-size: 1rem;
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0 0 12px 0;
	}

	.parallax-rating-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.parallax-rating-label-group {
		/* Match modal: w-24 = 96px, but use 110px to ensure value fits */
		display: flex;
		align-items: center;
		gap: 8px;
		flex-shrink: 0;
		/* Match modal: w-24 = 96px */
		width: 96px;
	}

	.parallax-rating-icon {
		flex-shrink: 0;
	}

	.parallax-rating-label {
		/* Match modal: text-xs */
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--color-text-secondary);
	}

	.parallax-rating-bar {
		/* Match modal: h-2 flex-1 rounded-full */
		height: 0.5rem;
		flex: 1;
		border-radius: 9999px;
		overflow: hidden;
		/* Track color matches main modal's dark appearance */
		background: #4b5563;
	}

	:global(.dark) .parallax-rating-bar {
		background: #374151;
	}

	.parallax-rating-fill {
		height: 100%;
		border-radius: 9999px;
		transition: width 0.3s ease;
	}

	.parallax-rating-fill-empty {
		height: 100%;
		/* Show full width dark fill for N/A state to match main modal */
		width: 100%;
		border-radius: 9999px;
		/* Match modal N/A dark appearance: solid dark gray/blue */
		background: #374151;
	}

	.parallax-rating-value {
		/* Match modal: text-xs font-semibold */
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--color-text-primary);
		text-align: right;
		/* Match modal: w-8 = 32px */
		width: 32px;
		flex-shrink: 0;
	}

	/* Score card section - matches main modal styling */
	.parallax-score-card {
		/* Match modal: mt-6 p-4 rounded-lg border border-blue-200 */
		margin-top: 24px;
		padding: 16px;
		/* Match modal: border (1px) */
		border: 1px solid #93c5fd;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}

	:global(.dark) .parallax-score-card {
		border-color: #3b82f6;
	}

	.parallax-score-card.parallax-pending-card {
		/* Match modal pending state: gray border and light gray background */
		border-color: #e5e7eb;
		background: #f9fafb;
	}

	:global(.dark) .parallax-score-card.parallax-pending-card {
		border-color: #374151;
		background: transparent;
	}

	.parallax-score {
		/* Match modal: text-sm font-bold */
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.parallax-pending {
		/* Match modal: text-sm font-bold */
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	/* Swipe-to-close visual feedback */
	.swiping-close {
		transition: none !important;
	}

	/* Pull-down handle indicator */
	.modal-content::after {
		content: '';
		position: absolute;
		top: 8px;
		left: 50%;
		transform: translateX(-50%);
		width: 36px;
		height: 4px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		opacity: 0;
		transition: opacity 0.2s ease;
		z-index: 110;
	}

	@media (pointer: coarse) {
		.modal-content::after {
			opacity: 1;
		}
	}

	:global(.light) .modal-content::after {
		background: rgba(0, 0, 0, 0.2);
	}

	/* Hide parallax on desktop */
	@media (pointer: fine) {
		.parallax-preview {
			display: none;
		}
	}

	/* Mobile swipe hint styles */
	.swipe-hint-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		z-index: 61;
		pointer-events: auto;
		cursor: pointer;
	}

	.swipe-hint-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: rgba(255, 255, 255, 0.9);
		background: rgba(0, 0, 0, 0.25);
		padding: 16px 24px;
		border-radius: 12px;
		backdrop-filter: blur(12px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	/* SVG Layout styles */
	.swipe-hint-svg {
		width: 140px;
		height: 110px;
		margin-bottom: 16px;
		overflow: visible;
	}

	.swipe-arrow {
		opacity: 0.3;
		transition: opacity 0.3s ease;
	}

	.swipe-arrow-left {
		animation: arrow-fade-left 2.5s ease-in-out infinite;
	}

	.swipe-arrow-right {
		animation: arrow-fade-right 2.5s ease-in-out infinite;
	}

	.swipe-arrow-down {
		animation: arrow-fade-down 2.5s ease-in-out infinite;
	}

	.swipe-hint-text {
		font-size: 1rem;
		font-weight: 500;
		opacity: 0.95;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
	}

	.swipe-hint-dismiss {
		font-size: 0.75rem;
		font-weight: 400;
		opacity: 0.6;
		margin-top: 8px;
	}

	@keyframes arrow-fade-left {
		0%,
		15% {
			opacity: 0.3;
		}
		40% {
			opacity: 1;
			transform: translateX(-4px);
		}
		65% {
			opacity: 0.3;
			transform: translateX(0);
		}
		100% {
			opacity: 0.3;
		}
	}

	@keyframes arrow-fade-right {
		0%,
		15% {
			opacity: 0.3;
		}
		40% {
			opacity: 0.3;
			transform: translateX(0);
		}
		65% {
			opacity: 1;
			transform: translateX(4px);
		}
		100% {
			opacity: 0.3;
		}
	}

	@keyframes arrow-fade-down {
		0%,
		15%,
		65% {
			opacity: 0.3;
			transform: translateY(0);
		}
		85% {
			opacity: 1;
			transform: translateY(4px);
		}
		100% {
			opacity: 0.3;
		}
	}
</style>

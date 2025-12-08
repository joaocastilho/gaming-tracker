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
	const SWIPE_THRESHOLD = 50;
	const SWIPE_CLOSE_THRESHOLD = 150;
	const VELOCITY_THRESHOLD = 0.5;

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
				parallaxOffset = -100 + (swipeOffsetX / maxOffset) * 100;
			} else if (diffX < 0 && nextGamePreview) {
				swipeDirection = 'left';
				swipeOffsetX = Math.max(diffX * resistance, -maxOffset);
				parallaxOffset = 100 + (swipeOffsetX / maxOffset) * 100;
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
		const startTime = performance.now();
		const duration = 200;

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);

			swipeOffsetX = startOffset + (targetOffset - startOffset) * eased;
			parallaxOffset = direction === 'left' ? 100 * (1 - progress) : -100 * (1 - progress);

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				if (direction === 'left') {
					navigateToNext();
				} else {
					navigateToPrevious();
				}
				setTimeout(() => {
					swipeOffsetX = 0;
					parallaxOffset = 0;
					isSwipeTransitioning = false;
					swipeDirection = null;
				}, 50);
			}
		}

		requestAnimationFrame(animate);
	}

	function resetSwipePosition() {
		const startOffset = swipeOffsetX;
		const startParallax = parallaxOffset;
		const startTime = performance.now();
		const duration = 300;

		function animate(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 4) * Math.cos(progress * Math.PI * 0.5);

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

	// Show swipe indicator only on first-ever modal open (using localStorage)
	const SWIPE_HINT_KEY = 'gaming-tracker-swipe-hint-seen';

	$effect(() => {
		if (browser && $modalStore.isOpen && $modalStore.mode === 'view') {
			// Check if user has already seen the swipe hint
			const hasSeenHint = localStorage.getItem(SWIPE_HINT_KEY);
			if (hasSeenHint) return;

			// Check if on mobile (screen width < 768px)
			const isMobile = window.innerWidth < 768;
			const canNavigate = displayedGames.length > 1;

			if (isMobile && canNavigate) {
				showSwipeIndicator = true;

				// Clear any existing timeout
				if (swipeIndicatorTimeout) {
					clearTimeout(swipeIndicatorTimeout);
				}

				// Hide indicator after 3 seconds and mark as seen
				swipeIndicatorTimeout = setTimeout(() => {
					showSwipeIndicator = false;
					localStorage.setItem(SWIPE_HINT_KEY, 'true');
				}, 3000);
			}
		} else {
			showSwipeIndicator = false;
		}
	});

	// Cleanup timeout on destroy
	onDestroy(() => {
		if (swipeIndicatorTimeout) {
			clearTimeout(swipeIndicatorTimeout);
		}
	});
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-5 md:items-center md:pt-4"
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
			<div class="swipe-hint-overlay md:hidden" transition:fade={{ duration: 400 }}>
				<div class="swipe-hint-content">
					<!-- SVG-based Arrow-only Swipe Hint -->
					<svg
						class="swipe-hint-svg"
						viewBox="0 0 100 80"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<!-- Left arrow -->
						<path
							class="swipe-arrow swipe-arrow-left"
							d="M15 40 L5 40 M5 40 L12 33 M5 40 L12 47"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<!-- Down arrow (Swipe to close) - Centered -->
						<path
							class="swipe-arrow swipe-arrow-down"
							d="M50 55 L50 65 M50 65 L43 58 M50 65 L57 58"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<!-- Right arrow -->
						<path
							class="swipe-arrow swipe-arrow-right"
							d="M85 40 L95 40 M95 40 L88 33 M95 40 L88 47"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<span class="swipe-hint-text">Swipe to navigate</span>
				</div>
			</div>
		{/if}

		<!-- Parallax Preview: Previous Game -->
		{#if prevGamePreview && swipeDirection === 'right' && Math.abs(swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-left"
				style="transform: translateX({(swipeOffsetX / 150) * 100}%); opacity: {Math.min(
					Math.abs(swipeOffsetX) / 50,
					1
				)};"
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
						<h3 class="parallax-title">{prevGamePreview.mainTitle || prevGamePreview.title}</h3>
						{#if prevGamePreview.subtitle}
							<p class="parallax-subtitle">{prevGamePreview.subtitle}</p>
						{/if}
						<div class="parallax-badges">
							<span class="parallax-badge {getPlatformColor(prevGamePreview.platform)}"
								>{prevGamePreview.platform}</span
							>
							<span class="parallax-badge {getGenreColor(prevGamePreview.genre)}"
								>{prevGamePreview.genre}</span
							>
							{#if prevGamePreview.tier}
								<span class="parallax-badge {getTierClass(prevGamePreview.tier)}"
									>{getTierDisplayName(prevGamePreview.tier)}</span
								>
							{/if}
						</div>
						<div class="parallax-info-grid">
							<div class="parallax-info-item">
								<span class="parallax-label">Year Released</span>
								<span class="parallax-value">{prevGamePreview.year}</span>
							</div>
							<div class="parallax-info-item">
								<span class="parallax-label"
									>{prevGamePreview.status === 'Completed' ? 'Finished Date' : 'Time to Beat'}</span
								>
								<span class="parallax-value"
									>{prevGamePreview.status === 'Completed'
										? prevGamePreview.finishedDate
											? formatDate(prevGamePreview.finishedDate)
											: 'N/A'
										: prevGamePreview.timeToBeat || 'N/A'}</span
								>
							</div>
						</div>
						<!-- Ratings Section -->
						<div class="parallax-ratings">
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Presentation</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(prevGamePreview.ratingPresentation ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value"
									>{prevGamePreview.ratingPresentation ?? 'N/A'}</span
								>
							</div>
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Story</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(prevGamePreview.ratingStory ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value">{prevGamePreview.ratingStory ?? 'N/A'}</span>
							</div>
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Gameplay</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(prevGamePreview.ratingGameplay ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value">{prevGamePreview.ratingGameplay ?? 'N/A'}</span>
							</div>
						</div>
						<!-- Status Section -->
						<div class="parallax-status">
							{#if prevGamePreview.status === 'Completed' && prevGamePreview.score !== null}
								<span class="parallax-score">Total Score: {prevGamePreview.score}/20</span>
							{:else}
								<span class="parallax-pending">Game to be completed</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Parallax Preview: Next Game -->
		{#if nextGamePreview && swipeDirection === 'left' && Math.abs(swipeOffsetX) > 0}
			<div
				class="parallax-preview parallax-right"
				style="transform: translateX({(swipeOffsetX / 150) * 100}%); opacity: {Math.min(
					Math.abs(swipeOffsetX) / 50,
					1
				)};"
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
						<h3 class="parallax-title">{nextGamePreview.mainTitle || nextGamePreview.title}</h3>
						{#if nextGamePreview.subtitle}
							<p class="parallax-subtitle">{nextGamePreview.subtitle}</p>
						{/if}
						<div class="parallax-badges">
							<span class="parallax-badge {getPlatformColor(nextGamePreview.platform)}"
								>{nextGamePreview.platform}</span
							>
							<span class="parallax-badge {getGenreColor(nextGamePreview.genre)}"
								>{nextGamePreview.genre}</span
							>
							{#if nextGamePreview.tier}
								<span class="parallax-badge {getTierClass(nextGamePreview.tier)}"
									>{getTierDisplayName(nextGamePreview.tier)}</span
								>
							{/if}
						</div>
						<div class="parallax-info-grid">
							<div class="parallax-info-item">
								<span class="parallax-label">Year Released</span>
								<span class="parallax-value">{nextGamePreview.year}</span>
							</div>
							<div class="parallax-info-item">
								<span class="parallax-label"
									>{nextGamePreview.status === 'Completed' ? 'Finished Date' : 'Time to Beat'}</span
								>
								<span class="parallax-value"
									>{nextGamePreview.status === 'Completed'
										? nextGamePreview.finishedDate
											? formatDate(nextGamePreview.finishedDate)
											: 'N/A'
										: nextGamePreview.timeToBeat || 'N/A'}</span
								>
							</div>
						</div>
						<!-- Ratings Section -->
						<div class="parallax-ratings">
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Presentation</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(nextGamePreview.ratingPresentation ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value"
									>{nextGamePreview.ratingPresentation ?? 'N/A'}</span
								>
							</div>
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Story</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(nextGamePreview.ratingStory ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value">{nextGamePreview.ratingStory ?? 'N/A'}</span>
							</div>
							<div class="parallax-rating-row">
								<span class="parallax-rating-label">Gameplay</span>
								<div class="parallax-rating-bar">
									<div
										class="parallax-rating-fill"
										style="width: {(nextGamePreview.ratingGameplay ?? 0) * 10}%"
									></div>
								</div>
								<span class="parallax-rating-value">{nextGamePreview.ratingGameplay ?? 'N/A'}</span>
							</div>
						</div>
						<!-- Status Section -->
						<div class="parallax-status">
							{#if nextGamePreview.status === 'Completed' && nextGamePreview.score !== null}
								<span class="parallax-score">Total Score: {nextGamePreview.score}/20</span>
							{:else}
								<span class="parallax-pending">Game to be completed</span>
							{/if}
						</div>
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
			class="modal-content relative flex h-auto max-h-[95dvh] w-[95vw] max-w-[500px] flex-col overflow-hidden rounded-xl shadow-2xl md:max-h-[85vh] md:w-[95%] md:max-w-[1000px]"
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
			<div class="flex h-full flex-col md:grid md:grid-cols-[350px_1fr] lg:grid-cols-[400px_1fr]">
				<div
					class="relative shrink-0 overflow-hidden rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
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

				<div class="flex-1 overflow-y-auto px-5 pt-4 pb-6 md:pt-4 md:pb-6 lg:pr-8 lg:pb-5 lg:pl-8">
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
		height: 28vh;
		min-height: 140px;
		max-height: 30vh;
		overflow: hidden;
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

	.parallax-preview {
		position: fixed;
		top: 10%;
		transform: translateY(-10%);
		width: 90vw;
		max-width: 480px;
		height: auto;
		max-height: 90dvh;
		border-radius: 16px;
		overflow: hidden;
		z-index: 59;
		pointer-events: none;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7);
		background: var(--color-surface);
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

	.parallax-image-section {
		width: 100%;
		aspect-ratio: 2/3;
		max-height: 45vh;
		overflow: hidden;
	}

	.parallax-preview-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.parallax-details-section {
		padding: 14px 16px;
		background: var(--color-surface);
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.parallax-info {
		padding: 16px;
		background: var(--color-surface);
	}

	.parallax-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0;
		line-height: 1.2;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.parallax-subtitle {
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.2;
	}

	.parallax-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 4px;
	}

	.parallax-badge {
		padding: 4px 8px;
		border-radius: 4px;
		font-size: 0.7rem;
		font-weight: 600;
		color: white;
	}

	.parallax-info-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-top: 8px;
	}

	.parallax-info-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.parallax-label {
		font-size: 0.65rem;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.parallax-value {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.parallax-ratings {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-top: 8px;
	}

	.parallax-rating-row {
		display: grid;
		grid-template-columns: 70px 1fr 30px;
		align-items: center;
		gap: 8px;
	}

	.parallax-rating-label {
		font-size: 0.65rem;
		color: var(--color-text-tertiary);
	}

	.parallax-rating-bar {
		height: 8px;
		background: rgba(100, 100, 100, 0.3);
		border-radius: 4px;
		overflow: hidden;
	}

	.parallax-rating-fill {
		height: 100%;
		background: linear-gradient(90deg, #4f46e5, #7c3aed);
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.parallax-rating-value {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-align: right;
	}

	/* Status section */
	.parallax-status {
		margin-top: 10px;
		padding: 10px 12px;
		background: rgba(100, 100, 100, 0.15);
		border-radius: 8px;
		text-align: center;
	}

	.parallax-score {
		font-size: 0.85rem;
		font-weight: 700;
		color: var(--color-text-primary);
	}

	.parallax-pending {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--color-text-secondary);
		font-style: italic;
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
		background: rgba(0, 0, 0, 0.4);
		z-index: 61;
		pointer-events: none;
	}

	.swipe-hint-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: white;
		background: rgba(0, 0, 0, 0.6);
		padding: 24px 32px;
		border-radius: 20px;
		backdrop-filter: blur(4px);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	}

	/* SVG Layout styles */
	.swipe-hint-svg {
		width: 100px;
		height: 80px;
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

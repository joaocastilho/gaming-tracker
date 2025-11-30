<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { modalStore, createGameSlug } from '../stores/modal.js';
	import { appStore } from '../stores/app.js';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS, getTierDisplayName } from '../utils/colorConstants';
	import { getTierClass } from '../utils/tierUtils.js';
	import { generateSrcset, generateSizes } from '../utils/imageSrcset.js';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Award,
		X,
		ChevronLeft,
		ChevronRight,
		Share2,
		Users
	} from 'lucide-svelte';

	let currentActiveTab = $derived(appStore.activeTab);

	import { gamesStore } from '../stores/games.js';
	let allGames = $derived($gamesStore);

	// Use reactive navigation data from the modal store
	let displayedGames = $derived(() => {
		// If modal has displayed games, use them (for proper navigation context)
		if ($modalStore.displayedGames.length > 0) {
			return $modalStore.displayedGames;
		}

		// Otherwise, use the reactive navigation method from modal store
		const allGames = $gamesStore;
		if (allGames.length === 0) return [];

		// Use the modal store's reactive navigation method
		return modalStore.getReactiveNavigationGames(allGames);
	});

	$effect(() => {
		if ($modalStore.isOpen) {
			modalStore.writeToURL();
		}
	});

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

	let titleSizeClass = $derived(() => {
		const len = $modalStore.activeGame?.mainTitle?.length ?? 0;
		if (len <= 20) return 'text-lg md:text-3xl';
		if (len <= 30) return 'text-base md:text-2xl';
		if (len <= 38) return 'text-sm md:text-xl';
		return 'text-xs md:text-lg';
	});

	let shareFeedback = $state('');
	let focusableElements = $state<HTMLElement[]>([]);
	let firstFocusableElement = $state<HTMLElement>();
	let lastFocusableElement = $state<HTMLElement>();

	// Swipe gesture state
	let touchStartX = 0;
	let touchEndX = 0;
	const SWIPE_THRESHOLD = 50;

	function handleTouchStart(e: TouchEvent) {
		touchStartX = e.changedTouches[0].screenX;
	}

	function handleTouchEnd(e: TouchEvent) {
		touchEndX = e.changedTouches[0].screenX;
		handleSwipe();
	}

	function handleSwipe() {
		const diff = touchStartX - touchEndX;
		if (Math.abs(diff) > SWIPE_THRESHOLD) {
			if (diff > 0) {
				// Swiped left -> Next
				navigateToNext();
			} else {
				// Swiped right -> Previous
				navigateToPrevious();
			}
		}
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

	let currentTabGames = $derived(() => {
		const games = displayedGames();

		switch ($currentActiveTab) {
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

	let allTieredGames = $derived(() => {
		const sourceGames = $currentActiveTab === 'tierlist' ? allGames : displayedGames();

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

	let currentGameIndex = $derived(() => {
		if (!$modalStore.activeGame) return -1;

		// Use displayedGames from modal store if available (for proper navigation context)
		if ($modalStore.displayedGames.length > 0) {
			return $modalStore.displayedGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
		}

		// For tier list tab, use the tier-specific navigation
		if ($currentActiveTab === 'tierlist') {
			const tierGames = allTieredGames();
			return tierGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
		}

		// For other tabs, use the current tab games
		const tabGames = currentTabGames();
		return tabGames.findIndex((game) => game.id === $modalStore.activeGame?.id);
	});

	function navigateToPrevious() {
		const index = currentGameIndex();
		const games = displayedGames();

		if (index > 0) {
			const prevGame = games[index - 1];
			modalStore.openViewModal(prevGame, games);
		}
	}

	function navigateToNext() {
		const index = currentGameIndex();
		const games = displayedGames();

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
			shareFeedback = 'Copied!';
			setTimeout(() => {
				shareFeedback = '';
			}, 2000);
		} catch (error) {
			console.warn('Failed to copy to clipboard:', error);
			shareFeedback = 'Failed';
			setTimeout(() => {
				shareFeedback = '';
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
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-5 md:items-center md:pt-4"
		style="background-color: rgba(0, 0, 0, 0.8); backdrop-filter: blur(4px);"
		transition:fade={{ duration: 200 }}
		onclick={handleOverlayClick}
		onkeydown={(e) => e.key === 'Escape' && modalStore.closeModal()}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
	>
		{#if currentGameIndex() > 0}
			<button
				onclick={navigateToPrevious}
				class="absolute top-1/2 left-2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/40 md:h-16 md:w-16"
				aria-label="Previous game"
			>
				<ChevronLeft size={32} class="h-4 w-4 md:h-8 md:w-8" />
			</button>
		{/if}

		{#if (() => {
			const games = displayedGames();
			return currentGameIndex() > -1 && currentGameIndex() < games.length - 1;
		})()}
			<button
				onclick={navigateToNext}
				class="absolute top-1/2 right-2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/40 md:h-16 md:w-16"
				aria-label="Next game"
			>
				<ChevronRight size={32} class="h-4 w-4 md:h-8 md:w-8" />
			</button>
		{/if}

		<div
			class="relative flex h-auto max-h-[95dvh] w-[95vw] max-w-[500px] flex-col overflow-hidden rounded-xl shadow-2xl md:max-h-[85vh] md:w-[95%] md:max-w-[1000px]"
			style="background-color: var(--color-surface);"
			role="document"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
		>
			<button
				onclick={() => modalStore.closeModal()}
				class="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 md:top-4 md:right-4 md:bg-gray-200 md:text-gray-600 md:hover:bg-gray-300 md:dark:bg-gray-700 md:dark:text-gray-300 md:dark:hover:bg-gray-600"
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
							class="absolute bottom-3 left-3 z-20 flex items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:bg-black/70 md:hidden {shareFeedback
								? 'px-3 py-1'
								: 'h-8 w-8'}"
							aria-label="Share game"
						>
							{#if shareFeedback}
								<span class="text-xs font-medium">{shareFeedback}</span>
							{:else}
								<Share2 size={18} />
							{/if}
						</button>
					</div>
				</div>

				<div
					class="flex-1 overflow-y-auto pt-2 pr-6 pb-6 pl-6 md:pt-4 lg:pt-6 lg:pr-8 lg:pb-5 lg:pl-8"
				>
					<div class="mb-2 flex items-start justify-between gap-4 md:mb-4">
						<h1
							id="modal-title"
							class="flex min-w-0 flex-1 flex-col justify-start"
							style="color: var(--color-text-primary);"
						>
							<span class="w-full truncate font-bold {titleSizeClass()}">
								{$modalStore.activeGame.mainTitle}
							</span>
							{#if $modalStore.activeGame.subtitle}
								<span
									class="w-full truncate text-xs font-semibold md:text-lg"
									style="line-height: 1.2; color: var(--color-text-secondary);"
									>{$modalStore.activeGame.subtitle}</span
								>
							{/if}
						</h1>

						<button
							onclick={shareGame}
							class="mr-10 hidden h-5 cursor-pointer items-center justify-center rounded-full bg-transparent px-2 transition-colors hover:bg-black/5 md:flex dark:bg-transparent dark:hover:bg-black/20"
							aria-label="Share game"
							style="min-width: 40px;"
						>
							{#if shareFeedback}
								<span
									style="color: var(--color-text-primary)"
									class="text-sm font-medium text-gray-700 dark:text-gray-200"
								>
									{shareFeedback}
								</span>
							{:else}
								<Share2
									size={18}
									style="color: var(--color-text-primary)"
									class="text-gray-700 dark:text-gray-200"
								/>
							{/if}
						</button>
					</div>

					<div class="mb-4 flex items-center justify-between md:mb-6">
						<div class="flex flex-wrap gap-2">
							<span
								class="rounded-md px-3 py-1 text-xs font-medium text-white md:text-sm {getPlatformColor(
									$modalStore.activeGame.platform
								)}"
							>
								{$modalStore.activeGame.platform}
							</span>
							<span
								class="rounded-md px-3 py-1 text-xs font-medium text-white md:text-sm {getGenreColor(
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
								class="tier-badge rounded-md px-3 py-1 text-xs font-semibold md:text-sm {getTierClass(
									$modalStore.activeGame.tier
								)}"
							>
								{getTierDisplayName($modalStore.activeGame.tier)}
							</span>
						{/if}
					</div>

					<div class="mb-2 grid grid-cols-2 gap-2 md:mb-8">
						<div>
							<div class="mb-1 text-xs md:text-sm" style="color: var(--color-text-tertiary);">
								Year Released
							</div>
							<div
								class="text-sm font-semibold md:text-base"
								style="color: var(--color-text-primary);"
							>
								{$modalStore.activeGame.year}
							</div>
						</div>
						{#if $modalStore.activeGame.status === 'Completed'}
							<div>
								<div class="mb-1 text-xs md:text-sm" style="color: var(--color-text-tertiary);">
									Hours Played
								</div>
								<div
									class="text-sm font-semibold md:text-base"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.hoursPlayed || 'Not completed'}
								</div>
							</div>
						{:else}
							<div>
								<div class="mb-1 text-xs md:text-sm" style="color: var(--color-text-tertiary);">
									Time to Beat
								</div>
								<div
									class="text-sm font-semibold md:text-base"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.timeToBeat}
								</div>
							</div>
						{/if}
						<div>
							<div class="mb-1 text-xs md:text-sm" style="color: var(--color-text-tertiary);">
								Finished Date
							</div>
							<div
								class="text-sm font-semibold md:text-base"
								style="color: var(--color-text-primary);"
							>
								{formatDate($modalStore.activeGame.finishedDate)}
							</div>
						</div>
					</div>

					{#if $modalStore.activeGame.status === 'Completed' && $modalStore.activeGame.ratingPresentation !== null && $modalStore.activeGame.ratingStory !== null && $modalStore.activeGame.ratingGameplay !== null}
						<div class="space-y-1 md:space-y-4">
							<h3
								class="mb-1 text-sm font-semibold md:mb-4 md:text-xl"
								style="color: var(--color-text-primary);"
							>
								Ratings
							</h3>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Presentation</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingPresentation}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingPresentation
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingPresentation * 10}%"
									></div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-amber-600" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Story</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingStory}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingStory
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingStory * 10}%"
									></div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-pink-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Gameplay</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									{$modalStore.activeGame.ratingGameplay}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											$modalStore.activeGame.ratingGameplay
										)} transition-all duration-300"
										style="width: {$modalStore.activeGame.ratingGameplay * 10}%"
									></div>
								</div>
							</div>

							{#if $modalStore.activeGame.score !== null}
								<div
									class="mt-4 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 md:mt-10 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"
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
						<div class="space-y-1 md:space-y-4">
							<h3
								class="mb-1 text-sm font-semibold md:mb-4 md:text-xl"
								style="color: var(--color-text-primary);"
							>
								Ratings
							</h3>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Presentation</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									Not rated
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-amber-600" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Story</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									Not rated
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
							</div>

							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-pink-500" />
									<span
										class="text-xs font-medium md:text-sm"
										style="color: var(--color-text-secondary);">Gameplay</span
									>
								</div>
								<span
									class="w-20 min-w-0 text-right text-xs font-semibold md:text-sm"
									style="color: var(--color-text-primary);"
								>
									Not rated
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-300"
										style="width: 0%"
									></div>
								</div>
							</div>

							<div
								class="mt-4 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 md:mt-10 dark:border-gray-700"
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
		height: 40vh;
		min-height: 150px;
		max-height: 50vh;
		overflow: hidden;
	}

	#modal-title {
		min-height: 50px;
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
			min-height: 65px;
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
</style>

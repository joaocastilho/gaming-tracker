<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { modalStore } from '../stores/modal.js';
	import { filtersStore } from '../stores/filters.js';
	import { appStore } from '../stores/app.js';
	import type { Game } from '../types/game.js';
	import { PLATFORM_COLORS, GENRE_COLORS, getTierDisplayName } from '../utils/colorConstants';
	import { getTierClass } from '../utils/tierUtils.js';
	import { imageCache } from '../utils/imageCache.js';
	import { generateSrcset, generateSizes } from '../utils/imageSrcset.js';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Award,
		X,
		ChevronLeft,
		ChevronRight,
		Share2
	} from 'lucide-svelte';

	let currentActiveTab = $derived(appStore.activeTab);

	// Create filtered games store
	const filteredGamesStore = filtersStore.createFilteredGamesStore();

	let filteredGamesData = $derived($filteredGamesStore);

	// Handle modal state changes
	$effect(() => {
		if ($modalStore.isOpen) {
			modalStore.writeToURL();
		}
	});

	// Focus management when modal opens
	$effect(() => {
		if ($modalStore.isOpen && modalElement && browser) {
			// Small delay to ensure DOM is ready
			setTimeout(() => {
				const focusableElements = getFocusableElements();
				if (focusableElements.length > 0) {
					focusableElements[0].focus();
				}
			}, 100);
		}
	});

	let modalElement = $state<HTMLDivElement>();

	// Track loading state - initialize from cache entry, then sync via effect
	let isImageLoaded = $state(false);
	let hasImageError = $state(false);

	// Image loading state - use cache
	const detailImageSrc = $derived(
		$modalStore.activeGame?.coverImage.replace('.webp', '-detail.webp') ?? ''
	);

	// Generate srcset for detail modal (after detailImageSrc is declared)
	const detailImageSrcset = $derived(
		detailImageSrc ? generateSrcset(detailImageSrc.replace('-detail.webp', '')) : ''
	);
	const detailImageSizes = $derived(generateSizes('modal'));
	const detailImageEntry = $derived(detailImageSrc ? imageCache.getImage(detailImageSrc) : null);

	// Sync with cache entry - this effect runs when detailImageEntry changes
	$effect(() => {
		const entry = detailImageEntry;

		if (!entry) {
			isImageLoaded = false;
			hasImageError = false;
			return;
		}

		// If already loaded, set immediately
		if (entry.isLoaded) {
			isImageLoaded = true;
			hasImageError = false;
			return;
		}

		// Reset state for new image
		isImageLoaded = false;
		hasImageError = false;

		// If there's a load promise, wait for it
		if (entry.loadPromise) {
			entry.loadPromise
				.then(() => {
					isImageLoaded = true;
					hasImageError = false;
				})
				.catch(() => {
					isImageLoaded = false;
					hasImageError = true;
				});
		}
	});

	// Share feedback state
	let shareFeedback = $state('');

	// Focus trap state
	let focusableElements = $state<HTMLElement[]>([]);
	let firstFocusableElement = $state<HTMLElement>();
	let lastFocusableElement = $state<HTMLElement>();

	// Focus trap functions
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
			// Shift + Tab
			if (document.activeElement === firstFocusableElement) {
				event.preventDefault();
				lastFocusableElement.focus();
			}
		} else {
			// Tab
			if (document.activeElement === lastFocusableElement) {
				event.preventDefault();
				firstFocusableElement.focus();
			}
		}
	}

	// Get filtered and sorted games for current tab navigation
	let currentTabGames = $derived(() => {
		const filteredGames = filteredGamesData.filteredGames;

		switch ($currentActiveTab) {
			case 'all': {
				// All games sorted alphabetically
				return filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
			}

			case 'completed': {
				// Completed games sorted by finished date (most recent first)
				return filteredGames
					.filter((game) => game.status === 'Completed')
					.toSorted((a, b) => {
						if (!a.finishedDate && !b.finishedDate) return 0;
						if (!a.finishedDate) return 1;
						if (!b.finishedDate) return -1;
						return new Date(b.finishedDate).getTime() - new Date(a.finishedDate).getTime();
					});
			}

			case 'planned': {
				// Planned games sorted alphabetically
				return filteredGames
					.filter((game) => game.status === 'Planned')
					.toSorted((a, b) => a.title.localeCompare(b.title));
			}

			case 'tierlist': {
				// All completed games with tiers, sorted by tier order (preserving original order within each tier)
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

				// First, create a map of tier to games in their original filtered order
				const gamesByTier: Record<string, Game[]> = {};
				filteredGames
					.filter((game) => game.status === 'Completed' && game.tier)
					.forEach((game) => {
						const tierKey = tierMapping[game.tier!] || game.tier!;
						if (!gamesByTier[tierKey]) {
							gamesByTier[tierKey] = [];
						}
						gamesByTier[tierKey].push(game);
					});

				// Then build the final array by tier order, preserving original order within each tier
				const result: Game[] = [];
				tierOrder.forEach((tierKey) => {
					if (gamesByTier[tierKey]) {
						result.push(...gamesByTier[tierKey]);
					}
				});

				return result;
			}

			default: {
				return filteredGames.toSorted((a, b) => a.title.localeCompare(b.title));
			}
		}
	});

	// Get all tiered games for tier list navigation
	let allTieredGames = $derived(() => {
		// Get all games that have tiers assigned
		const tieredGames = filteredGamesData.filteredGames.filter(
			(game) => game.status === 'Completed' && game.tier
		);

		// Sort by tier order (S, A, B, C, D, E) and then by title within each tier
		const tierOrder = ['S', 'A', 'B', 'C', 'D', 'E'];
		return tieredGames.toSorted((a, b) => {
			const aTierIndex = tierOrder.indexOf(a.tier!);
			const bTierIndex = tierOrder.indexOf(b.tier!);
			if (aTierIndex !== bTierIndex) {
				return aTierIndex - bTierIndex;
			}
			return a.title.localeCompare(b.title);
		});
	});

	// Get current game index for navigation within the current tab's games
	let currentGameIndex = $derived(() => {
		if (!$modalStore.activeGame) return -1;

		// If we're in tier list mode, navigate through all tiered games
		if ($currentActiveTab === 'tierlist') {
			return allTieredGames().findIndex((game) => game.id === $modalStore.activeGame?.id);
		}

		// Otherwise, navigate through the current tab's games
		return currentTabGames().findIndex((game) => game.id === $modalStore.activeGame?.id);
	});

	// Navigation functions
	function navigateToPrevious() {
		const index = currentGameIndex();
		const games = $currentActiveTab === 'tierlist' ? allTieredGames() : currentTabGames();
		if (index > 0) {
			const prevGame = games[index - 1];
			modalStore.openViewModal(prevGame);
		}
	}

	function navigateToNext() {
		const index = currentGameIndex();
		const games = $currentActiveTab === 'tierlist' ? allTieredGames() : currentTabGames();
		if (index < games.length - 1) {
			const nextGame = games[index + 1];
			modalStore.openViewModal(nextGame);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		// Handle focus trap first
		handleFocusTrap(event);

		// Only handle keys when the detail modal is open and in view mode
		if (!$modalStore.isOpen || $modalStore.mode !== 'view') {
			return;
		}

		if (event.key === 'Escape') {
			// Close the detail modal on Escape
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

	// Handle overlay keyboard interaction for accessibility
	function handleOverlayKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			modalStore.closeModal();
		}
	}

	// Handle image load success
	function handleImageLoad() {
		isImageLoaded = true;
		hasImageError = false;
	}

	// Handle image load error
	function handleImageError() {
		isImageLoaded = false;
		hasImageError = true;
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
		if (rating >= 8) return 'bg-gradient-to-r from-[#388E3C] to-[#4CAF50]'; // Deep Green
		if (rating >= 6) return 'bg-gradient-to-r from-[#A4D454] to-[#8BC34A]'; // Yellow-Green
		if (rating >= 5) return 'bg-gradient-to-r from-[#FFC107] to-[#FFEB3B]'; // Yellow/Amber
		if (rating >= 3) return 'bg-gradient-to-r from-[#FF832B] to-[#FF9800]'; // Orange-Red
		return 'bg-gradient-to-r from-[#D32F2F] to-[#F44336]'; // Deep Red
	}

	async function shareGame() {
		if (!browser || !$modalStore.activeGame) return;

		try {
			const url = new URL(window.location.href);
			// Create a slug from the game title for the URL
			const slug = $modalStore.activeGame.title
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
				.replace(/\s+/g, '-') // Replace spaces with hyphens
				.replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
				.trim()
				.replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
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
		}
	});
</script>

{#if $modalStore.isOpen && $modalStore.activeGame && $modalStore.mode === 'view'}
	<!-- Modal Overlay -->
	<div
		bind:this={modalElement}
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-1 backdrop-blur-[8px]"
		onclick={handleOverlayClick}
		onkeydown={handleOverlayKeydown}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Previous Button -->
		{#if currentGameIndex() > 0}
			<button
				onclick={navigateToPrevious}
				class="absolute top-1/2 left-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
				aria-label="Previous game"
			>
				<ChevronLeft size={32} />
			</button>
		{/if}

		<!-- Next Button -->
		{#if (() => {
			const games = $currentActiveTab === 'tierlist' ? allTieredGames() : currentTabGames();
			return currentGameIndex() > -1 && currentGameIndex() < games.length - 1;
		})()}
			<button
				onclick={navigateToNext}
				class="absolute top-1/2 right-2 z-10 flex h-16 w-16 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/70"
				aria-label="Next game"
			>
				<ChevronRight size={32} />
			</button>
		{/if}

		<!-- Close Button -->
		<button
			onclick={() => modalStore.closeModal()}
			class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
			aria-label="Close modal"
		>
			<X size={20} class="text-gray-600 dark:text-gray-300" />
		</button>

		<!-- Modal Content -->
		<div
			class="relative h-[600px] w-full max-w-4xl rounded-xl shadow-2xl"
			style="background-color: var(--color-surface);"
		>
			<div class="grid grid-cols-1 gap-0 lg:grid-cols-[400px_1fr]">
				<!-- Cover Section -->
				<div class="relative overflow-hidden rounded-l-lg">
					{#if !isImageLoaded && !hasImageError}
						<div class="image-placeholder"></div>
					{/if}
					<img
						src={detailImageSrc}
						srcset={detailImageSrcset}
						sizes={detailImageSizes}
						alt="{$modalStore.activeGame.title} cover"
						class="cover-image h-full w-full object-cover"
						class:loaded={isImageLoaded}
						class:error={hasImageError}
						style="width: 400px; height: 600px;"
						loading="eager"
						fetchpriority="high"
						decoding="async"
						onload={handleImageLoad}
						onerror={handleImageError}
					/>

					<!-- Co-op Badge -->
					{#if $modalStore.activeGame.coOp === 'Yes'}
						<div
							class="absolute top-4 right-4 rounded-md bg-blue-600 px-3 py-1 text-sm font-semibold text-white"
						>
							👥 Co-op
						</div>
					{/if}
				</div>

				<!-- Info Section -->
				<div
					class="max-h-[60vh] overflow-y-auto pt-4 pr-6 pb-6 pl-6 lg:pt-6 lg:pr-8 lg:pb-8 lg:pl-8"
				>
					<!-- Title and Share Button -->
					<div class="mb-4 flex items-start justify-between gap-4">
						<h1
							id="modal-title"
							class="flex flex-1 flex-col justify-start overflow-visible text-3xl font-bold"
							style="color: var(--color-text-primary); min-height: 80px; white-space: normal;"
						>
							{$modalStore.activeGame.mainTitle}
							{#if $modalStore.activeGame.subtitle}
								<br />
								<span
									class="font-semibold"
									style="font-size: 1.2rem; line-height: 1.2; color: var(--color-text-secondary);"
									>{$modalStore.activeGame.subtitle}</span
								>
							{/if}
						</h1>

						<!-- Share Button -->
						<button
							onclick={shareGame}
							class="flex h-10 cursor-pointer items-center justify-center rounded-full bg-transparent px-3 transition-colors hover:bg-black/5 dark:bg-transparent dark:hover:bg-black/20"
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

					<!-- Meta Badges -->
					<div class="mb-6 flex items-center justify-between">
						<div class="flex flex-wrap gap-2">
							<span
								class="rounded-md px-3 py-1 text-sm font-medium text-white {getPlatformColor(
									$modalStore.activeGame.platform
								)}"
							>
								{$modalStore.activeGame.platform}
							</span>
							<span
								class="rounded-md px-3 py-1 text-sm font-medium text-white {getGenreColor(
									$modalStore.activeGame.genre
								)}"
							>
								{$modalStore.activeGame.genre}
							</span>
							{#if $modalStore.activeGame.coOp === 'Yes'}
								<span class="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white">
									Co-op
								</span>
							{/if}
						</div>

						<!-- Tier Level -->
						{#if $modalStore.activeGame.tier}
							<span
								class="tier-badge rounded-md px-3 py-1 text-sm font-semibold {getTierClass(
									$modalStore.activeGame.tier
								)}"
							>
								{getTierDisplayName($modalStore.activeGame.tier)}
							</span>
						{/if}
					</div>

					<!-- Detail Grid -->
					<div class="mb-8 grid grid-cols-2 gap-4">
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">
								Year Released
							</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{$modalStore.activeGame.year}
							</div>
						</div>
						{#if $modalStore.activeGame.status === 'Completed'}
							<div>
								<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">
									Hours Played
								</div>
								<div class="font-semibold" style="color: var(--color-text-primary);">
									{$modalStore.activeGame.hoursPlayed || 'Not completed'}
								</div>
							</div>
						{:else}
							<div>
								<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">
									Time to Beat
								</div>
								<div class="font-semibold" style="color: var(--color-text-primary);">
									{$modalStore.activeGame.timeToBeat}
								</div>
							</div>
						{/if}
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">
								Finished Date
							</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{formatDate($modalStore.activeGame.finishedDate)}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Co-op</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{$modalStore.activeGame.coOp === 'Yes' ? 'Yes' : 'No'}
							</div>
						</div>
					</div>

					<!-- Ratings Section -->
					{#if $modalStore.activeGame.status === 'Completed' && $modalStore.activeGame.ratingPresentation !== null && $modalStore.activeGame.ratingStory !== null && $modalStore.activeGame.ratingGameplay !== null}
						<div class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">
								Ratings
							</h3>

							<!-- Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Presentation</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Story Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-amber-600" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Story</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Gameplay Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-pink-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Gameplay</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Total Score -->
							{#if $modalStore.activeGame.score !== null}
								<div
									class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"
								>
									<div class="flex items-center justify-center gap-2">
										<Award size={24} class="text-yellow-500" />
										<span class="text-lg font-bold" style="color: var(--color-text-primary);">
											Total Score: {$modalStore.activeGame.score}/20
										</span>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">
								Ratings
							</h3>

							<!-- Placeholder Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Presentation</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Placeholder Story Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-amber-600" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Story</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Placeholder Gameplay Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-pink-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Gameplay</span
									>
								</div>
								<span
									class="min-w-0 text-sm font-semibold"
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

							<!-- Placeholder Total Score -->
							<div
								class="mt-6 rounded-lg border border-gray-200 from-gray-50 to-gray-50 p-4 dark:border-gray-700"
							>
								<div class="flex items-center justify-center gap-2">
									<Award size={24} class="text-gray-400" />
									<span class="text-lg font-bold" style="color: var(--color-text-primary);">
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
{/if}

<style>
	/* Image Placeholder */
	.image-placeholder {
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #2a2d3a 0%, #1a1f27 100%);
		animation-name: strongPulse;
		animation-duration: 1.5s;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		animation-fill-mode: forwards;
		overflow: hidden;
	}

	.image-placeholder::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		animation: shimmer 2s ease-in-out infinite;
	}

	:global(.light) .image-placeholder {
		background: linear-gradient(135deg, #ede3d3 0%, #f7f2eb 100%);
	}

	:global(.light) .image-placeholder::before {
		background: linear-gradient(90deg, transparent 0%, rgba(0, 0, 0, 0.08) 50%, transparent 100%);
	}

	/* Image loading states */
	.cover-image {
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.cover-image.loaded {
		opacity: 1;
	}

	.cover-image.error {
		display: none;
	}
</style>

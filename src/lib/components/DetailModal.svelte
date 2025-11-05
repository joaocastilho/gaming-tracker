<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { modalStore } from '../stores/modal.js';
	import { gamesStore } from '../stores/games.js';
	import type { Game } from '../types/game.js';
	import {
		TIER_COLORS,
		PLATFORM_COLORS,
		GENRE_COLORS,
		getTierDisplayName
	} from '../utils/colorConstants.js';
	import {
		Presentation,
		NotebookPen,
		Gamepad2,
		Trophy,
		X,
		ChevronLeft,
		ChevronRight,
		Share2
	} from 'lucide-svelte';

	let modalState = $state(modalStore.getState());
	let allGames = $state<Game[]>([]);

	// Subscribe to modal store changes
	$effect(() => {
		const unsubscribe = modalStore.subscribe((state) => {
			modalState = state;
			// Update URL when modal state changes
			modalStore.writeToURL();
		});
		return unsubscribe;
	});

	// Subscribe to games store for navigation
	$effect(() => {
		const unsubscribe = gamesStore.subscribe((games) => {
			allGames = games;
		});
		return unsubscribe;
	});

	let modalElement = $state<HTMLDivElement>();

	// Image loading state
	let isImageLoaded = $state(false);
	let hasImageError = $state(false);

	// Share feedback state
	let shareFeedback = $state('');

	// Extract parenthetical content from title for subtitle display
	let titleParts = $derived(() => {
		if (!modalState.activeGame?.title) return { mainTitle: '', subtitle: null };
		const match = modalState.activeGame.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
		if (match) {
			return {
				mainTitle: match[1].trim(),
				subtitle: `(${match[2]})`
			};
		}
		return {
			mainTitle: modalState.activeGame.title,
			subtitle: null
		};
	});

	// Get current game index for navigation
	let currentGameIndex = $derived(() => {
		if (!modalState.activeGame) return -1;
		return allGames.findIndex((game) => game.id === modalState.activeGame?.id);
	});

	// Navigation functions
	function navigateToPrevious() {
		const index = currentGameIndex();
		if (index > 0) {
			const prevGame = allGames[index - 1];
			modalStore.openViewModal(prevGame);
		}
	}

	function navigateToNext() {
		const index = currentGameIndex();
		if (index < allGames.length - 1) {
			const nextGame = allGames[index + 1];
			modalStore.openViewModal(nextGame);
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			modalStore.closeModal();
		} else if (event.key === 'ArrowLeft') {
			event.preventDefault();
			navigateToPrevious();
		} else if (event.key === 'ArrowRight') {
			event.preventDefault();
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

	function getTierColor(tier: string | null): string {
		if (!tier) return 'bg-gray-400';
		const fullName = getTierDisplayName(tier);
		return TIER_COLORS[fullName] || 'bg-gray-400';
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
		if (!browser || !modalState.activeGame) return;

		try {
			const url = new URL(window.location.href);
			// Create a slug from the game title for the URL
			const slug = modalState.activeGame.title
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
			document.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleKeydown);
		}
	});
</script>

{#if modalState.isOpen && modalState.activeGame && modalState.mode === 'view'}
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
		{#if currentGameIndex() < allGames.length - 1}
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
						src={modalState.activeGame.coverImage.replace('.webp', '-detail.webp')}
						alt="{modalState.activeGame.title} cover"
						class="h-full w-full object-cover"
						class:loaded={isImageLoaded}
						class:error={hasImageError}
						style="width: 400px; height: 600px;"
						loading="lazy"
						onload={handleImageLoad}
						onerror={handleImageError}
					/>

					<!-- Co-op Badge -->
					{#if modalState.activeGame.coOp === 'Yes'}
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
					<div class="flex items-start justify-between gap-4 mb-4">
						<h1
							id="modal-title"
							class="flex flex-col justify-center text-3xl font-bold flex-1"
							style="height: 65px; color: var(--color-text-primary);"
						>
							{titleParts().mainTitle}
							{#if titleParts().subtitle}
								<br />
								<span
									class="font-semibold"
									style="font-size: 1.2rem; line-height: 1.2; color: var(--color-text-secondary);">{titleParts().subtitle}</span
								>
							{/if}
						</h1>

						<!-- Share Button -->
						<button
							onclick={shareGame}
							class="flex h-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-600 px-3 cursor-pointer"
							aria-label="Share game"
							style="min-width: 40px;"
						>
							{#if shareFeedback}
								<span class="text-sm font-medium text-gray-700 dark:text-gray-200">
									{shareFeedback}
								</span>
							{:else}
								<Share2 size={18} class="text-gray-700 dark:text-gray-200" />
							{/if}
						</button>
					</div>

					<!-- Meta Badges -->
					<div class="mb-6 flex items-center justify-between">
						<div class="flex flex-wrap gap-2">
							<span
								class="rounded-md px-3 py-1 text-sm font-medium text-white {getPlatformColor(
									modalState.activeGame.platform
								)}"
							>
								{modalState.activeGame.platform}
							</span>
							<span
								class="rounded-md px-3 py-1 text-sm font-medium text-white {getGenreColor(
									modalState.activeGame.genre
								)}"
							>
								{modalState.activeGame.genre}
							</span>
							{#if modalState.activeGame.coOp === 'Yes'}
								<span class="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white">
									Co-op
								</span>
							{/if}
						</div>

						<!-- Tier Level -->
						{#if modalState.activeGame.tier}
							<span
								class="rounded-md px-3 py-1 text-sm font-semibold text-white {getTierColor(
									modalState.activeGame.tier
								)}"
							>
								{getTierDisplayName(modalState.activeGame.tier)}
							</span>
						{/if}
					</div>

					<!-- Detail Grid -->
					<div class="mb-8 grid grid-cols-2 gap-4">
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Year Released</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{modalState.activeGame.year}
							</div>
						</div>
						{#if modalState.activeGame.status === 'Completed'}
							<div>
								<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Hours Played</div>
								<div class="font-semibold" style="color: var(--color-text-primary);">
									{modalState.activeGame.hoursPlayed || 'Not completed'}
								</div>
							</div>
						{:else}
							<div>
								<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Time to Beat</div>
								<div class="font-semibold" style="color: var(--color-text-primary);">
									{modalState.activeGame.timeToBeat}
								</div>
							</div>
						{/if}
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Finished Date</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{formatDate(modalState.activeGame.finishedDate)}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm" style="color: var(--color-text-tertiary);">Co-op</div>
							<div class="font-semibold" style="color: var(--color-text-primary);">
								{modalState.activeGame.coOp === 'Yes' ? 'Yes' : 'No'}
							</div>
						</div>
					</div>

					<!-- Ratings Section -->
					{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.ratingPresentation !== null && modalState.activeGame.ratingStory !== null && modalState.activeGame.ratingGameplay !== null}
						<div class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3>

							<!-- Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Presentation</span
									>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
									{modalState.activeGame.ratingPresentation}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											modalState.activeGame.ratingPresentation
										)} transition-all duration-300"
										style="width: {modalState.activeGame.ratingPresentation * 10}%"
									></div>
								</div>
							</div>

							<!-- Story Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<NotebookPen size={20} class="flex-shrink-0 text-amber-600" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
									{modalState.activeGame.ratingStory}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											modalState.activeGame.ratingStory
										)} transition-all duration-300"
										style="width: {modalState.activeGame.ratingStory * 10}%"
									></div>
								</div>
							</div>

							<!-- Gameplay Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-pink-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
									{modalState.activeGame.ratingGameplay}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full {getRatingBarColor(
											modalState.activeGame.ratingGameplay
										)} transition-all duration-300"
										style="width: {modalState.activeGame.ratingGameplay * 10}%"
									></div>
								</div>
							</div>

							<!-- Total Score -->
							{#if modalState.activeGame.score !== null}
								<div
									class="mt-6 rounded-lg border border-blue-200 from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/80 dark:to-purple-900/80"
								>
									<div class="flex items-center justify-center gap-2">
										<Trophy size={24} class="text-yellow-500" />
										<span class="text-lg font-bold" style="color: var(--color-text-primary);">
											Total Score: {modalState.activeGame.score}/20
										</span>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold" style="color: var(--color-text-primary);">Ratings</h3>

							<!-- Placeholder Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Presentation size={20} class="flex-shrink-0 text-cyan-500" />
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);"
										>Presentation</span
									>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
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
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);">Story</span>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
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
									<span class="text-sm font-medium" style="color: var(--color-text-secondary);">Gameplay</span>
								</div>
								<span class="min-w-0 text-sm font-semibold" style="color: var(--color-text-primary);">
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
									<Trophy size={24} class="text-gray-400" />
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
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 0, 0, 0.08) 50%,
			transparent 100%
		);
	}

	@keyframes strongPulse {
		0% {
			opacity: 1;
			transform: scale(1);
		}
		25% {
			opacity: 0.7;
			transform: scale(1.01);
		}
		50% {
			opacity: 0.4;
			transform: scale(1.02);
		}
		75% {
			opacity: 0.7;
			transform: scale(1.01);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
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

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { modalStore } from '../stores/modal.js';
	import type { Game } from '../types/game.js';
	import { Eye, PenTool, Gamepad2, Trophy, Clock, Calendar, X } from 'lucide-svelte';

	let modalState = $state(modalStore.getState());

	// Subscribe to modal store changes
	$effect(() => {
		const unsubscribe = modalStore.subscribe((state) => {
			modalState = state;
		});
		return unsubscribe;
	});

	let modalElement: HTMLDivElement;
	let coverImage: HTMLImageElement;

	// Handle escape key
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			modalStore.closeModal();
		}
	}

	// Handle overlay click
	function handleOverlayClick(event: MouseEvent) {
		if (event.target === modalElement) {
			modalStore.closeModal();
		}
	}

	// Format date for display
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

	// Get tier color
	function getTierColor(tier: string | null): string {
		switch (tier) {
			case 'S': return 'bg-red-500';
			case 'A': return 'bg-orange-500';
			case 'B': return 'bg-yellow-500';
			case 'C': return 'bg-green-500';
			case 'D': return 'bg-cyan-500';
			case 'E': return 'bg-gray-500';
			default: return 'bg-gray-400';
		}
	}

	// Get platform color
	function getPlatformColor(platform: string): string {
		const colors: Record<string, string> = {
			'PC': 'bg-blue-600',
			'PS5': 'bg-cyan-600',
			'Xbox': 'bg-green-600',
			'Switch': 'bg-orange-600'
		};
		return colors[platform] || 'bg-gray-600';
	}

	// Get genre color
	function getGenreColor(genre: string): string {
		const colors: Record<string, string> = {
			'RPG': 'bg-purple-600',
			'Action': 'bg-red-600',
			'Adventure': 'bg-amber-600',
			'Puzzle': 'bg-fuchsia-600',
			'Metroidvania': 'bg-violet-600'
		};
		return colors[genre] || 'bg-gray-600';
	}

	onMount(() => {
		document.addEventListener('keydown', handleKeydown);
	});

	onDestroy(() => {
		document.removeEventListener('keydown', handleKeydown);
	});
</script>

{#if modalState.isOpen && modalState.activeGame && modalState.mode === 'view'}
	<!-- Modal Overlay -->
	<div
		bind:this={modalElement}
		class="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
		on:click={handleOverlayClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div class="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden relative">
			<!-- Close Button -->
			<button
				on:click={() => modalStore.closeModal()}
				class="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
				aria-label="Close modal"
			>
				<X size={20} class="text-gray-600 dark:text-gray-300" />
			</button>

			<div class="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-0">
				<!-- Cover Section -->
				<div class="relative">
					<img
						bind:this={coverImage}
						src="/{modalState.activeGame.coverImage}"
						alt="{modalState.activeGame.title} cover"
						class="w-full h-64 lg:h-full object-cover rounded-l-lg"
						loading="lazy"
					/>

					<!-- Tier Badge -->
					{#if modalState.activeGame.tier}
						<div class="absolute top-4 left-4 px-3 py-1 rounded-md text-white font-semibold text-sm {getTierColor(modalState.activeGame.tier)}">
							{modalState.activeGame.tier}
						</div>
					{/if}

					<!-- Co-op Badge -->
					{#if modalState.activeGame.coOp === 'Yes'}
						<div class="absolute top-4 right-4 px-3 py-1 rounded-md text-white font-semibold text-sm bg-blue-600">
							👥 Co-op
						</div>
					{/if}
				</div>

				<!-- Info Section -->
				<div class="p-6 lg:p-8 overflow-y-auto max-h-[60vh] lg:max-h-none">
					<!-- Title -->
					<h1 id="modal-title" class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
						{modalState.activeGame.title}
					</h1>

					<!-- Meta Badges -->
					<div class="flex flex-wrap gap-2 mb-6">
						<span class="px-3 py-1 rounded-md text-white font-medium text-sm {getPlatformColor(modalState.activeGame.platform)}">
							{modalState.activeGame.platform}
						</span>
						<span class="px-3 py-1 rounded-md text-white font-medium text-sm {getGenreColor(modalState.activeGame.genre)}">
							{modalState.activeGame.genre}
						</span>
						{#if modalState.activeGame.coOp === 'Yes'}
							<span class="px-3 py-1 rounded-md text-white font-medium text-sm bg-blue-600">
								Co-op
							</span>
						{/if}
					</div>

					<!-- Detail Grid -->
					<div class="grid grid-cols-2 gap-4 mb-8">
						<div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Year Released</div>
							<div class="font-semibold text-gray-900 dark:text-white">{modalState.activeGame.year}</div>
						</div>
						<div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Time to Beat</div>
							<div class="font-semibold text-gray-900 dark:text-white">{modalState.activeGame.timeToBeat}</div>
						</div>
						<div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Hours Played</div>
							<div class="font-semibold text-gray-900 dark:text-white">{modalState.activeGame.hoursPlayed || 'Not completed'}</div>
						</div>
						<div>
							<div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Finished Date</div>
							<div class="font-semibold text-gray-900 dark:text-white">{formatDate(modalState.activeGame.finishedDate)}</div>
						</div>
					</div>

					<!-- Ratings Section -->
					{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.ratingPresentation !== null && modalState.activeGame.ratingStory !== null && modalState.activeGame.ratingGameplay !== null}
						<div class="space-y-4">
							<h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Ratings</h3>

							<!-- Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex items-center gap-2 min-w-0 flex-1">
									<Eye size={20} class="text-blue-500 flex-shrink-0" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Presentation</span>
								</div>
								<span class="text-sm font-semibold text-gray-900 dark:text-white min-w-0">
									{modalState.activeGame.ratingPresentation}/10
								</span>
								<div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
									<div
										class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
										style="width: {modalState.activeGame.ratingPresentation * 10}%"
									></div>
								</div>
							</div>

							<!-- Story Rating -->
							<div class="flex items-center gap-3">
								<div class="flex items-center gap-2 min-w-0 flex-1">
									<PenTool size={20} class="text-green-500 flex-shrink-0" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Story</span>
								</div>
								<span class="text-sm font-semibold text-gray-900 dark:text-white min-w-0">
									{modalState.activeGame.ratingStory}/10
								</span>
								<div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
									<div
										class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
										style="width: {modalState.activeGame.ratingStory * 10}%"
									></div>
								</div>
							</div>

							<!-- Gameplay Rating -->
							<div class="flex items-center gap-3">
								<div class="flex items-center gap-2 min-w-0 flex-1">
									<Gamepad2 size={20} class="text-purple-500 flex-shrink-0" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gameplay</span>
								</div>
								<span class="text-sm font-semibold text-gray-900 dark:text-white min-w-0">
									{modalState.activeGame.ratingGameplay}/10
								</span>
								<div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-2">
									<div
										class="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
										style="width: {modalState.activeGame.ratingGameplay * 10}%"
									></div>
								</div>
							</div>

							<!-- Total Score -->
							{#if modalState.activeGame.score !== null}
								<div class="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
									<div class="flex items-center justify-center gap-2">
										<Trophy size={24} class="text-yellow-500" />
										<span class="text-lg font-bold text-gray-900 dark:text-white">
											Total Score: {modalState.activeGame.score}/20
										</span>
									</div>
								</div>
							{/if}
						</div>
					{:else}
						<div class="text-center py-8 text-gray-500 dark:text-gray-400">
							<Gamepad2 size={48} class="mx-auto mb-4 opacity-50" />
							<p class="text-lg">Game not completed yet</p>
							<p class="text-sm">Complete the game to see detailed ratings</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { modalStore } from '../stores/modal.js';
	import { Eye, PenTool, Gamepad2, Trophy, X } from 'lucide-svelte';

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
			case 'S':
				return 'bg-red-500';
			case 'A':
				return 'bg-orange-500';
			case 'B':
				return 'bg-yellow-500';
			case 'C':
				return 'bg-green-500';
			case 'D':
				return 'bg-cyan-500';
			case 'E':
				return 'bg-gray-500';
			default:
				return 'bg-gray-400';
		}
	}

	// Get platform color
	function getPlatformColor(platform: string): string {
		const colors: Record<string, string> = {
			PC: 'bg-blue-600',
			PS5: 'bg-cyan-600',
			Xbox: 'bg-green-600',
			Switch: 'bg-orange-600'
		};
		return colors[platform] || 'bg-gray-600';
	}

	// Get genre color
	function getGenreColor(genre: string): string {
		const colors: Record<string, string> = {
			RPG: 'bg-purple-600',
			Action: 'bg-red-600',
			Adventure: 'bg-amber-600',
			Puzzle: 'bg-fuchsia-600',
			Metroidvania: 'bg-violet-600'
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
		class="bg-opacity-80 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		on:click={handleOverlayClick}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div
			class="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900"
		>
			<!-- Close Button -->
			<button
				on:click={() => modalStore.closeModal()}
				class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
				aria-label="Close modal"
			>
				<X size={20} class="text-gray-600 dark:text-gray-300" />
			</button>

			<div class="grid grid-cols-1 gap-0 lg:grid-cols-[400px_1fr]">
				<!-- Cover Section -->
				<div class="relative">
					<img
						bind:this={coverImage}
						src="/{modalState.activeGame.coverImage}"
						alt="{modalState.activeGame.title} cover"
						class="h-64 w-full rounded-l-lg object-cover lg:h-full"
						loading="lazy"
					/>

					<!-- Tier Badge -->
					{#if modalState.activeGame.tier}
						<div
							class="absolute top-4 left-4 rounded-md px-3 py-1 text-sm font-semibold text-white {getTierColor(
								modalState.activeGame.tier
							)}"
						>
							{modalState.activeGame.tier}
						</div>
					{/if}

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
				<div class="max-h-[60vh] overflow-y-auto p-6 lg:max-h-none lg:p-8">
					<!-- Title -->
					<h1
						id="modal-title"
						class="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl dark:text-white"
					>
						{modalState.activeGame.title}
					</h1>

					<!-- Meta Badges -->
					<div class="mb-6 flex flex-wrap gap-2">
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

					<!-- Detail Grid -->
					<div class="mb-8 grid grid-cols-2 gap-4">
						<div>
							<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">Year Released</div>
							<div class="font-semibold text-gray-900 dark:text-white">
								{modalState.activeGame.year}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">Time to Beat</div>
							<div class="font-semibold text-gray-900 dark:text-white">
								{modalState.activeGame.timeToBeat}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">Hours Played</div>
							<div class="font-semibold text-gray-900 dark:text-white">
								{modalState.activeGame.hoursPlayed || 'Not completed'}
							</div>
						</div>
						<div>
							<div class="mb-1 text-sm text-gray-500 dark:text-gray-400">Finished Date</div>
							<div class="font-semibold text-gray-900 dark:text-white">
								{formatDate(modalState.activeGame.finishedDate)}
							</div>
						</div>
					</div>

					<!-- Ratings Section -->
					{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.ratingPresentation !== null && modalState.activeGame.ratingStory !== null && modalState.activeGame.ratingGameplay !== null}
						<div class="space-y-4">
							<h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Ratings</h3>

							<!-- Presentation Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Eye size={20} class="flex-shrink-0 text-blue-500" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300"
										>Presentation</span
									>
								</div>
								<span class="min-w-0 text-sm font-semibold text-gray-900 dark:text-white">
									{modalState.activeGame.ratingPresentation}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
										style="width: {modalState.activeGame.ratingPresentation * 10}%"
									></div>
								</div>
							</div>

							<!-- Story Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<PenTool size={20} class="flex-shrink-0 text-green-500" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Story</span>
								</div>
								<span class="min-w-0 text-sm font-semibold text-gray-900 dark:text-white">
									{modalState.activeGame.ratingStory}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
										style="width: {modalState.activeGame.ratingStory * 10}%"
									></div>
								</div>
							</div>

							<!-- Gameplay Rating -->
							<div class="flex items-center gap-3">
								<div class="flex min-w-0 flex-1 items-center gap-2">
									<Gamepad2 size={20} class="flex-shrink-0 text-purple-500" />
									<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Gameplay</span>
								</div>
								<span class="min-w-0 text-sm font-semibold text-gray-900 dark:text-white">
									{modalState.activeGame.ratingGameplay}/10
								</span>
								<div class="ml-2 h-2 flex-1 rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
										style="width: {modalState.activeGame.ratingGameplay * 10}%"
									></div>
								</div>
							</div>

							<!-- Total Score -->
							{#if modalState.activeGame.score !== null}
								<div
									class="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20"
								>
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
						<div class="py-8 text-center text-gray-500 dark:text-gray-400">
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

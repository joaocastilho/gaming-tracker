<script lang="ts">
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';

	// Subscribe to modal state
	let modalState = $state({
		isOpen: false,
		activeGame: null as Game | null,
		mode: 'view' as 'view' | 'edit' | 'add'
	});

	$effect(() => {
		const unsubscribe = modalStore.subscribe((state) => {
			modalState = state;
		});
		return unsubscribe;
	});

	// Close modal function
	function closeModal(): void {
		modalStore.closeModal();
	}

	// Handle escape key
	function handleKeydown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	// Format date for display
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	// Calculate total score for completed games
	function calculateScore(game: Game): number | null {
		if (
			game.status === 'Completed' &&
			game.ratingPresentation !== null &&
			game.ratingStory !== null &&
			game.ratingGameplay !== null
		) {
			return Math.round(
				((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2
			);
		}
		return null;
	}

	// Tier colors
	const tierColors: Record<string, string> = {
		S: 'bg-[#dc2626] text-white',
		A: 'bg-[#f97316] text-white',
		B: 'bg-[#eab308] text-black',
		C: 'bg-[#22c55e] text-white',
		D: 'bg-[#06b6d4] text-white',
		E: 'bg-[#6b7280] text-white'
	};

	// Platform colors
	const platformColors: Record<string, string> = {
		PC: 'bg-[#1e3a5f] text-[#60a5fa]',
		PS5: 'bg-[#1e293b] text-[#38bdf8]',
		Xbox: 'bg-[#14532d] text-[#4ade80]',
		Switch: 'bg-[#7c2d12] text-[#fb923c]'
	};

	// Genre colors
	const genreColors: Record<string, string> = {
		'Action RPG': 'bg-[#2d1f3f] text-[#c084fc]',
		Platformer: 'bg-[#c2410c] text-[#fdba74]',
		'Survival Horror': 'bg-[#581c87] text-[#d8b4fe]',
		Metroidvania: 'bg-[#4c1d95] text-[#a78bfa]',
		'Classic RPG': 'bg-[#92400e] text-[#fed7aa]'
	};
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modalState.isOpen && modalState.activeGame}
	<!-- Modal Overlay -->
	<div
		class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={closeModal}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal Content -->
		<div
			class="modal-content bg-background border-border max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border shadow-2xl"
			onclick={(e) => e.stopPropagation()}
		>
			<!-- Header -->
			<div class="modal-header border-border flex items-center justify-between border-b p-6">
				<h2 id="modal-title" class="text-2xl font-bold">
					{modalState.activeGame.title}
				</h2>
				<button
					class="close-button text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-2 transition-colors"
					onclick={closeModal}
					aria-label="Close modal"
				>
					<span class="text-xl">✕</span>
				</button>
			</div>

			<!-- Content -->
			<div
				class="modal-body grid max-h-[calc(90vh-120px)] grid-cols-1 gap-6 overflow-y-auto p-6 lg:grid-cols-5"
			>
				<!-- Left Column: Cover Image -->
				<div class="lg:col-span-2">
					<div class="relative">
						<img
							src="/{modalState.activeGame.coverImage}"
							alt="{modalState.activeGame.title} cover"
							class="w-full rounded-lg shadow-lg"
							onerror={(e) => {
								const img = e.target as HTMLImageElement;
								img.style.display = 'none';
							}}
						/>

						<!-- Tier Badge -->
						{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.tier}
							<div class="absolute top-4 right-4">
								<span
									class="inline-flex rounded-full px-3 py-1 text-sm font-bold {tierColors[
										modalState.activeGame.tier
									]}"
								>
									Tier {modalState.activeGame.tier}
								</span>
							</div>
						{/if}

						<!-- Co-op Badge -->
						{#if modalState.activeGame.coOp === 'Yes'}
							<div class="absolute top-4 left-4">
								<span
									class="inline-flex items-center gap-1 rounded-md bg-blue-600/90 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm"
								>
									<span>👥</span>
									Co-op
								</span>
							</div>
						{/if}
					</div>
				</div>

				<!-- Right Column: Game Info -->
				<div class="space-y-6 lg:col-span-3">
					<!-- Basic Info Grid -->
					<div class="grid grid-cols-2 gap-4">
						<div>
							<h3 class="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
								Platform
							</h3>
							<span
								class="inline-flex rounded px-2 py-1 text-sm font-medium {platformColors[
									modalState.activeGame.platform
								] || 'bg-gray-600 text-white'}"
							>
								{modalState.activeGame.platform}
							</span>
						</div>
						<div>
							<h3 class="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
								Genre
							</h3>
							<span
								class="inline-flex rounded px-2 py-1 text-sm font-medium {genreColors[
									modalState.activeGame.genre
								] || 'bg-gray-600 text-white'}"
							>
								{modalState.activeGame.genre}
							</span>
						</div>
						<div>
							<h3 class="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
								Year
							</h3>
							<p class="text-lg font-medium">{modalState.activeGame.year}</p>
						</div>
						<div>
							<h3 class="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
								Status
							</h3>
							<span
								class="inline-flex rounded px-2 py-1 text-sm font-medium {modalState.activeGame
									.status === 'Completed'
									? 'bg-green-600 text-white'
									: 'bg-yellow-600 text-white'}"
							>
								{modalState.activeGame.status}
							</span>
						</div>
					</div>

					<!-- Time Information -->
					<div>
						<h3 class="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase">
							Time Information
						</h3>
						<div class="grid grid-cols-2 gap-4">
							<div>
								<h4 class="text-muted-foreground text-sm">Time to Beat</h4>
								<p class="font-medium">⏱️ {modalState.activeGame.timeToBeat}</p>
							</div>
							{#if modalState.activeGame.status === 'Completed'}
								<div>
									<h4 class="text-muted-foreground text-sm">Hours Played</h4>
									<p class="font-medium">🎮 {modalState.activeGame.hoursPlayed}</p>
								</div>
								{#if modalState.activeGame.finishedDate}
									<div class="col-span-2">
										<h4 class="text-muted-foreground text-sm">Finished Date</h4>
										<p class="font-medium">✓ {formatDate(modalState.activeGame.finishedDate)}</p>
									</div>
								{/if}
							{/if}
						</div>
					</div>

					<!-- Ratings Section (for completed games) -->
					{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.ratingPresentation !== null && modalState.activeGame.ratingStory !== null && modalState.activeGame.ratingGameplay !== null}
						<div>
							<h3 class="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
								Ratings
							</h3>
							<div class="space-y-4">
								<!-- Individual Ratings -->
								<div class="grid grid-cols-3 gap-4">
									<div class="text-center">
										<h4 class="text-muted-foreground mb-1 text-xs">👁️ Presentation</h4>
										<p class="text-xl font-bold">{modalState.activeGame.ratingPresentation}/10</p>
										<div class="bg-muted mt-2 h-2 w-full rounded-full">
											<div
												class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
												style="width: {modalState.activeGame.ratingPresentation * 10}%"
											></div>
										</div>
									</div>
									<div class="text-center">
										<h4 class="text-muted-foreground mb-1 text-xs">✏️ Story</h4>
										<p class="text-xl font-bold">{modalState.activeGame.ratingStory}/10</p>
										<div class="bg-muted mt-2 h-2 w-full rounded-full">
											<div
												class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
												style="width: {modalState.activeGame.ratingStory * 10}%"
											></div>
										</div>
									</div>
									<div class="text-center">
										<h4 class="text-muted-foreground mb-1 text-xs">🎮 Gameplay</h4>
										<p class="text-xl font-bold">{modalState.activeGame.ratingGameplay}/10</p>
										<div class="bg-muted mt-2 h-2 w-full rounded-full">
											<div
												class="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
												style="width: {modalState.activeGame.ratingGameplay * 10}%"
											></div>
										</div>
									</div>
								</div>

								<!-- Total Score -->
								<div class="bg-muted/50 rounded-lg p-4 text-center">
									<h4 class="text-muted-foreground mb-2 text-sm font-semibold">🏆 Total Score</h4>
									<p class="text-primary text-3xl font-bold">
										{calculateScore(modalState.activeGame)}/20
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Footer -->
			<div class="modal-footer border-border bg-muted/30 flex justify-end gap-3 border-t p-6">
				<button
					class="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition-colors"
					onclick={closeModal}
				>
					Close
				</button>
				<button
					class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
					onclick={() => {
						// TODO: Implement edit functionality
						console.log('Edit clicked for:', modalState.activeGame?.title || 'unknown');
					}}
				>
					Edit Game
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		animation: fadeIn 0.2s ease-out;
	}

	.modal-content {
		animation: slideIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(20px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	/* Scrollbar styling for modal body */
	.modal-body::-webkit-scrollbar {
		width: 6px;
	}

	.modal-body::-webkit-scrollbar-track {
		background: transparent;
	}

	.modal-body::-webkit-scrollbar-thumb {
		background: rgba(139, 146, 168, 0.3);
		border-radius: 3px;
	}

	.modal-body::-webkit-scrollbar-thumb:hover {
		background: rgba(139, 146, 168, 0.5);
	}

	:global(.light) .modal-body::-webkit-scrollbar-thumb {
		background: rgba(107, 114, 128, 0.3);
	}

	:global(.light) .modal-body::-webkit-scrollbar-thumb:hover {
		background: rgba(107, 114, 128, 0.5);
	}
</style>

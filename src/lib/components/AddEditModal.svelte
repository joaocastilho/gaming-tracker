<script lang="ts">
	import { modalStore } from '$lib/stores/modal.js';
	import type { Game } from '$lib/types/game.js';
	import { X } from 'lucide-svelte';

	// Subscribe to modal state
	let modalState = $state({
		isOpen: false,
		activeGame: null as Game | null,
		mode: 'view' as 'view' | 'edit' | 'add',
		formData: {} as Partial<Game>,
		validationErrors: {} as Record<string, string>,
		isSubmitting: false
	});

	// Form field states - used in template with bind:value
	let formTitle = $state('');
	let formPlatform = $state('');
	let formYear = $state<number | ''>('');
	let formGenre = $state('');
	let formCoOp = $state<'Yes' | 'No'>('No');
	let formStatus = $state<'Planned' | 'Completed'>('Planned');
	let formTimeToBeat = $state('');
	let formHoursPlayed = $state('');
	let formFinishedDate = $state('');
	let formRatingPresentation = $state<number | ''>('');
	let formRatingStory = $state<number | ''>('');
	let formRatingGameplay = $state<number | ''>('');

	$effect(() => {
		const unsubscribe = modalStore.subscribe((state) => {
			modalState = state;

			// Initialize form data when modal opens for add/edit
			if (state.isOpen && (state.mode === 'add' || state.mode === 'edit')) {
				initializeFormData();
			}
		});
		return unsubscribe;
	});

	// Initialize form data
	function initializeFormData() {
		const data = modalState.formData;
		formTitle = data.title || '';
		formPlatform = data.platform || '';
		formYear = data.year || '';
		formGenre = data.genre || '';
		formCoOp = data.coOp || 'No';
		formStatus = data.status || 'Planned';
		formTimeToBeat = data.timeToBeat || '';
		formHoursPlayed = data.hoursPlayed || '';
		formFinishedDate = data.finishedDate ? data.finishedDate.split('T')[0] : '';
		formRatingPresentation = data.ratingPresentation ?? '';
		formRatingStory = data.ratingStory ?? '';
		formRatingGameplay = data.ratingGameplay ?? '';
	}

	// Update form field in store
	function updateField(field: string, value: unknown) {
		modalStore.updateFormData(field, value);
	}

	// Submit form
	async function handleSubmit() {
		const success = await modalStore.submitForm();
		if (success) {
			// Modal will close automatically on success
		}
	}

	// Reset form
	function handleReset() {
		modalStore.resetForm();
		initializeFormData();
	}

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

	// Handle status change
	function handleStatusChange(status: 'Planned' | 'Completed') {
		updateField('status', status);
		formStatus = status;

		// Clear completed-specific fields if switching to Planned
		if (status === 'Planned') {
			updateField('hoursPlayed', null);
			updateField('finishedDate', null);
			updateField('ratingPresentation', null);
			updateField('ratingStory', null);
			updateField('ratingGameplay', null);
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

	// Input validation helpers
	function getFieldError(field: string): string {
		return modalState.validationErrors[field] || '';
	}

	function hasFieldError(field: string): boolean {
		return !!modalState.validationErrors[field];
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if modalState.isOpen}
	<!-- Modal Overlay -->
	<div
		class="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
		onclick={closeModal}
		onkeydown={(e) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				closeModal();
			}
		}}
		role="dialog"
		tabindex="-1"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Close Button -->
		<button
			class="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
			onclick={closeModal}
			aria-label="Close modal"
		>
			<X size={20} class="text-gray-600 dark:text-gray-300" />
		</button>

		<!-- Modal Content -->
		<div class="bg-background max-h-[90vh] w-full max-w-4xl rounded-2xl shadow-2xl" role="document">
			<!-- Modal Body -->
			<div class="modal-body max-h-[90vh] overflow-y-auto p-6">
				{#if modalState.mode === 'view' && modalState.activeGame}
					<!-- View Mode Content -->
					<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
						<!-- Left Column: Cover Image -->
						<div class="lg:col-span-2">
							<div class="relative">
								<img
									src="/{modalState.activeGame.coverImage}"
									alt="{modalState.activeGame.title} cover"
									class="w-full rounded-lg shadow-lg"
									loading="lazy"
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
								<h3
									class="text-muted-foreground mb-3 text-sm font-semibold tracking-wider uppercase"
								>
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
												<p class="font-medium">
													✓ {formatDate(modalState.activeGame.finishedDate)}
												</p>
											</div>
										{/if}
									{/if}
								</div>
							</div>

							<!-- Ratings Section (for completed games) -->
							{#if modalState.activeGame.status === 'Completed' && modalState.activeGame.ratingPresentation !== null && modalState.activeGame.ratingStory !== null && modalState.activeGame.ratingGameplay !== null}
								<div>
									<h3
										class="text-muted-foreground mb-4 text-sm font-semibold tracking-wider uppercase"
									>
										Ratings
									</h3>
									<div class="space-y-4">
										<!-- Individual Ratings -->
										<div class="grid grid-cols-3 gap-4">
											<div class="text-center">
												<h4 class="text-muted-foreground mb-1 text-xs">👁️ Presentation</h4>
												<p class="text-xl font-bold">
													{modalState.activeGame.ratingPresentation}/10
												</p>
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
											<h4 class="text-muted-foreground mb-2 text-sm font-semibold">
												🏆 Total Score
											</h4>
											<p class="text-primary text-3xl font-bold">
												{calculateScore(modalState.activeGame)}/20
											</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else if modalState.mode === 'add' || modalState.mode === 'edit'}
					<!-- Add/Edit Form -->
					<form
						class="space-y-6"
						onsubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<!-- Basic Information -->
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<label for="title" class="mb-2 block text-sm font-medium">
									Title <span class="text-red-500">*</span>
								</label>
								<input
									id="title"
									type="text"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
										'title'
									)
										? 'border-red-500'
										: ''}"
									bind:value={formTitle}
									oninput={(e) => updateField('title', (e.target as HTMLInputElement).value)}
									placeholder="Game title"
									required
								/>
								{#if hasFieldError('title')}
									<p class="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
								{/if}
							</div>

							<div>
								<label for="platform" class="mb-2 block text-sm font-medium">
									Platform <span class="text-red-500">*</span>
								</label>
								<select
									id="platform"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
										'platform'
									)
										? 'border-red-500'
										: ''}"
									bind:value={formPlatform}
									onchange={(e) => updateField('platform', (e.target as HTMLSelectElement).value)}
									required
								>
									<option value="">Select platform</option>
									<option value="PC">PC</option>
									<option value="PS5">PS5</option>
									<option value="Xbox">Xbox</option>
									<option value="Switch">Switch</option>
								</select>
								{#if hasFieldError('platform')}
									<p class="mt-1 text-sm text-red-600">{getFieldError('platform')}</p>
								{/if}
							</div>

							<div>
								<label for="year" class="mb-2 block text-sm font-medium">
									Year <span class="text-red-500">*</span>
								</label>
								<input
									id="year"
									type="number"
									min="1970"
									max="2099"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
										'year'
									)
										? 'border-red-500'
										: ''}"
									bind:value={formYear}
									oninput={(e) =>
										updateField('year', parseInt((e.target as HTMLInputElement).value) || '')}
									placeholder="2024"
									required
								/>
								{#if hasFieldError('year')}
									<p class="mt-1 text-sm text-red-600">{getFieldError('year')}</p>
								{/if}
							</div>

							<div>
								<label for="genre" class="mb-2 block text-sm font-medium">
									Genre <span class="text-red-500">*</span>
								</label>
								<select
									id="genre"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
										'genre'
									)
										? 'border-red-500'
										: ''}"
									bind:value={formGenre}
									onchange={(e) => updateField('genre', (e.target as HTMLSelectElement).value)}
									required
								>
									<option value="">Select genre</option>
									<option value="Action RPG">Action RPG</option>
									<option value="Platformer">Platformer</option>
									<option value="Adventure">Adventure</option>
									<option value="RPG">RPG</option>
									<option value="Strategy">Strategy</option>
									<option value="Puzzle">Puzzle</option>
								</select>
								{#if hasFieldError('genre')}
									<p class="mt-1 text-sm text-red-600">{getFieldError('genre')}</p>
								{/if}
							</div>

							<div>
								<label for="coOp" class="mb-2 block text-sm font-medium"> Co-op </label>
								<select
									id="coOp"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									bind:value={formCoOp}
									onchange={(e) =>
										updateField('coOp', (e.target as HTMLSelectElement).value as 'Yes' | 'No')}
								>
									<option value="No">No</option>
									<option value="Yes">Yes</option>
								</select>
							</div>

							<div>
								<label for="status" class="mb-2 block text-sm font-medium">
									Status <span class="text-red-500">*</span>
								</label>
								<select
									id="status"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
									bind:value={formStatus}
									onchange={(e) =>
										handleStatusChange(
											(e.target as HTMLSelectElement).value as 'Planned' | 'Completed'
										)}
								>
									<option value="Planned">Planned</option>
									<option value="Completed">Completed</option>
								</select>
							</div>
						</div>

						<!-- Time Information -->
						<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
							<div>
								<label for="timeToBeat" class="mb-2 block text-sm font-medium">
									Time to Beat <span class="text-red-500">*</span>
								</label>
								<input
									id="timeToBeat"
									type="text"
									class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
										'timeToBeat'
									)
										? 'border-red-500'
										: ''}"
									bind:value={formTimeToBeat}
									oninput={(e) => updateField('timeToBeat', (e.target as HTMLInputElement).value)}
									placeholder="10h 30m"
									required
								/>
								{#if hasFieldError('timeToBeat')}
									<p class="mt-1 text-sm text-red-600">{getFieldError('timeToBeat')}</p>
								{/if}
							</div>

							{#if formStatus === 'Completed'}
								<div>
									<label for="hoursPlayed" class="mb-2 block text-sm font-medium">
										Hours Played
									</label>
									<input
										id="hoursPlayed"
										type="text"
										class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
											'hoursPlayed'
										)
											? 'border-red-500'
											: ''}"
										bind:value={formHoursPlayed}
										oninput={(e) =>
											updateField('hoursPlayed', (e.target as HTMLInputElement).value)}
										placeholder="15h 20m"
									/>
									{#if hasFieldError('hoursPlayed')}
										<p class="mt-1 text-sm text-red-600">{getFieldError('hoursPlayed')}</p>
									{/if}
								</div>

								<div>
									<label for="finishedDate" class="mb-2 block text-sm font-medium">
										Finished Date
									</label>
									<input
										id="finishedDate"
										type="date"
										class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
											'finishedDate'
										)
											? 'border-red-500'
											: ''}"
										bind:value={formFinishedDate}
										oninput={(e) =>
											updateField(
												'finishedDate',
												(e.target as HTMLInputElement).value
													? `${(e.target as HTMLInputElement).value}T00:00:00.000Z`
													: null
											)}
									/>
									{#if hasFieldError('finishedDate')}
										<p class="mt-1 text-sm text-red-600">{getFieldError('finishedDate')}</p>
									{/if}
								</div>
							{/if}
						</div>

						<!-- Ratings (only for completed games) -->
						{#if formStatus === 'Completed'}
							<div class="space-y-4">
								<h3 class="text-lg font-medium">Ratings</h3>
								<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
									<div>
										<label for="ratingPresentation" class="mb-2 block text-sm font-medium">
											Presentation (0-10)
										</label>
										<input
											id="ratingPresentation"
											type="number"
											min="0"
											max="10"
											step="0.1"
											class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
												'ratingPresentation'
											)
												? 'border-red-500'
												: ''}"
											bind:value={formRatingPresentation}
											oninput={(e) =>
												updateField(
													'ratingPresentation',
													(e.target as HTMLInputElement).value
														? parseFloat((e.target as HTMLInputElement).value)
														: null
												)}
										/>
										{#if hasFieldError('ratingPresentation')}
											<p class="mt-1 text-sm text-red-600">{getFieldError('ratingPresentation')}</p>
										{/if}
									</div>

									<div>
										<label for="ratingStory" class="mb-2 block text-sm font-medium">
											Story (0-10)
										</label>
										<input
											id="ratingStory"
											type="number"
											min="0"
											max="10"
											step="0.1"
											class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
												'ratingStory'
											)
												? 'border-red-500'
												: ''}"
											bind:value={formRatingStory}
											oninput={(e) =>
												updateField(
													'ratingStory',
													(e.target as HTMLInputElement).value
														? parseFloat((e.target as HTMLInputElement).value)
														: null
												)}
										/>
										{#if hasFieldError('ratingStory')}
											<p class="mt-1 text-sm text-red-600">{getFieldError('ratingStory')}</p>
										{/if}
									</div>

									<div>
										<label for="ratingGameplay" class="mb-2 block text-sm font-medium">
											Gameplay (0-10)
										</label>
										<input
											id="ratingGameplay"
											type="number"
											min="0"
											max="10"
											step="0.1"
											class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none {hasFieldError(
												'ratingGameplay'
											)
												? 'border-red-500'
												: ''}"
											bind:value={formRatingGameplay}
											oninput={(e) =>
												updateField(
													'ratingGameplay',
													(e.target as HTMLInputElement).value
														? parseFloat((e.target as HTMLInputElement).value)
														: null
												)}
										/>
										{#if hasFieldError('ratingGameplay')}
											<p class="mt-1 text-sm text-red-600">{getFieldError('ratingGameplay')}</p>
										{/if}
									</div>
								</div>
							</div>
						{/if}

						<!-- Submit Error -->
						{#if modalState.validationErrors.submit}
							<div class="rounded-md bg-red-50 p-4">
								<p class="text-sm text-red-600">{modalState.validationErrors.submit}</p>
							</div>
						{/if}
					</form>
				{/if}
			</div>

			<!-- Footer -->
			<div class="modal-footer border-border bg-muted/30 flex justify-end gap-3 border-t p-6">
				{#if modalState.mode === 'view'}
					<button
						class="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition-colors"
						onclick={closeModal}
					>
						Close
					</button>
					<button
						class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
						onclick={() => {
							if (modalState.activeGame) {
								modalStore.openEditModal(modalState.activeGame);
							}
						}}
					>
						Edit Game
					</button>
				{:else}
					<button
						type="button"
						class="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition-colors"
						onclick={handleReset}
						disabled={modalState.isSubmitting}
					>
						Reset
					</button>
					<button
						type="button"
						class="border-border hover:bg-muted rounded-md border px-4 py-2 text-sm font-medium transition-colors"
						onclick={closeModal}
						disabled={modalState.isSubmitting}
					>
						Cancel
					</button>
					<button
						type="button"
						class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
						onclick={handleSubmit}
						disabled={modalState.isSubmitting}
					>
						{modalState.isSubmitting
							? 'Saving...'
							: modalState.mode === 'add'
								? 'Add Game'
								: 'Save Changes'}
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		animation: fadeIn 0.2s ease-out;
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
</style>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { Game } from '$lib/types/game';
	import { GameSchema, computeScore, TIER_VALUES, formatRating } from '$lib/validation/game';
	import { editorStore } from '$lib/stores/editor.svelte';
	import { dev } from '$app/environment';

	// Helper to format implicit "Xh Ym" from a decimal number (e.g. 2.5 -> "2h 30m")
	// Used to auto-fill timeToBeat from hoursPlayed if needed, or just for display.
	function formatDuration(decimalHours: number): string {
		const h = Math.floor(decimalHours);
		const m = Math.round((decimalHours - h) * 60);
		return `${h}h ${m}m`;
	}

	type Mode = 'create' | 'edit';

	interface Props {
		mode: Mode;
		initialGame?: Game | null;
		allGames: Game[];
		onClose: () => void;
	}

	let { mode, initialGame = null, allGames, onClose }: Props = $props();

	let working = $state<Game>();
	let error = $state<string | null>(null);
	let saving = $state(false);
	let dateInput = $state('');
	let hours = $state(0);
	let minutes = $state(0);
	let completionOrderInput = $state<number | null>(null);

	let copied = $state(false);

	// Cover image upload state
	let coverUrl = $state('');
	let coverFile = $state<File | null>(null);
	let coverPreview = $state<string | null>(null);

	// Track blob URLs for cleanup
	let blobUrls: string[] = [];

	let coverError = $state<string | null>(null);
	let fileInputRef = $state<HTMLInputElement>();

	// Refs for focus management
	let modalRef = $state<HTMLDivElement>();
	let titleInputRef = $state<HTMLInputElement>();

	// Focus trap: keep focus within the modal
	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
			return;
		}

		if (event.key === 'Tab' && modalRef) {
			const focusableElements = modalRef.querySelectorAll<HTMLElement>(
				'input:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
			);
			const focusableArray = Array.from(focusableElements);

			if (focusableArray.length === 0) return;

			const firstElement = focusableArray[0];
			const lastElement = focusableArray[focusableArray.length - 1];

			if (event.shiftKey) {
				// Shift+Tab: if on first element, go to last
				if (document.activeElement === firstElement) {
					event.preventDefault();
					lastElement.focus();
				}
			} else {
				// Tab: if on last element, go to first
				if (document.activeElement === lastElement) {
					event.preventDefault();
					firstElement.focus();
				}
			}
		}
	}

	function copyGameId() {
		if (working?.id) {
			navigator.clipboard.writeText(working.id);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		}
	}

	// Cover image handling functions
	function isValidImageUrl(url: string): boolean {
		try {
			const parsed = new URL(url);
			return ['http:', 'https:'].includes(parsed.protocol);
		} catch {
			return false;
		}
	}

	function handleCoverUrlChange() {
		coverError = null;
		if (coverUrl && isValidImageUrl(coverUrl)) {
			coverPreview = coverUrl;
			coverFile = null;
		} else if (coverUrl) {
			coverError = 'Invalid URL';
			coverPreview = null;
		} else {
			coverPreview = null;
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		coverError = null;

		if (file) {
			if (!file.type.includes('png') && !file.name.toLowerCase().endsWith('.png')) {
				coverError = 'Only PNG files are accepted';
				coverFile = null;
				coverPreview = null;
				return;
			}

			coverFile = file;
			coverUrl = '';
			// Revoke previous blob URL if exists
			if (coverPreview?.startsWith('blob:')) {
				URL.revokeObjectURL(coverPreview);
				blobUrls = blobUrls.filter((url) => url !== coverPreview);
			}
			coverPreview = URL.createObjectURL(file);
			blobUrls.push(coverPreview);
		}
	}

	function clearCover() {
		coverUrl = '';
		coverFile = null;
		if (coverPreview && coverPreview.startsWith('blob:')) {
			URL.revokeObjectURL(coverPreview);
			blobUrls = blobUrls.filter((url) => url !== coverPreview);
		}
		coverPreview = null;
		coverError = null;
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}

	// Derived unique lists for auto-complete
	const uniquePlatforms = $derived([...new Set(allGames.map((g) => g.platform))].sort());
	const uniqueGenres = $derived([...new Set(allGames.map((g) => g.genre))].sort());

	// Auto-focus title input when it becomes available
	$effect(() => {
		if (titleInputRef) {
			untrack(() => {
				setTimeout(() => titleInputRef?.focus(), 50);
			});
		}
	});

	// One-time initialization + cleanup
	let _initialized = false;
	$effect(() => {
		if (_initialized) return;
		_initialized = true;

		if (mode === 'edit' && initialGame) {
			// structuredClone struggles with Svelte 5 proxies sometimes, so we use JSON scan
			working = JSON.parse(JSON.stringify(initialGame));
			// Fix compatibility: Convert numeric playtime to string if needed
			if (working && typeof working.playtime === 'number') {
				working.playtime = formatDuration(working.playtime);
			}

			// Init hours/minutes from playtime string
			if (working && working.playtime) {
				const match = working.playtime.match(/(\d+)h\s*(\d+)m/);
				if (match) {
					hours = parseInt(match[1]);
					minutes = parseInt(match[2]);
				}
			}
			// Init date input
			if (working && working.finishedDate) {
				dateInput = working.finishedDate.split('T')[0];
			}
			// Init completionOrder
			if (working) {
				completionOrderInput = working.completionOrder ?? null;
			}

			// Reset cover upload state but show existing cover as preview
			coverUrl = '';
			coverFile = null;
			coverError = null;
			// Show existing cover image as preview if it exists
			if (working && working.coverImage) {
				coverPreview = `/${working.coverImage}`;
			} else {
				coverPreview = null;
			}
		} else {
			const now = new Date();
			working = {
				id: '',
				title: '',
				mainTitle: '',
				subtitle: null,
				platform: '',
				genre: '',
				status: 'Planned',
				year: now.getFullYear(),
				coverImage: '',
				coOp: 'No',
				ratingPresentation: null,
				ratingStory: null,
				ratingGameplay: null,
				score: null,
				tier: null,
				playtime: '0h 0m',
				finishedDate: null
			} as Game;
			completionOrderInput = null;

			// Reset cover upload state for new game
			coverUrl = '';
			coverFile = null;
			coverPreview = null;
			coverError = null;
		}

		// Cleanup blob URLs when component unmounts
		return () => {
			blobUrls.forEach((url) => {
				if (url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
			blobUrls = [];
		};
	});

	// Sync dateInput to working.finishedDate
	$effect(() => {
		if (!working) return;
		// Only update if status is Completed, otherwise finishedDate should be null (handled by validateGame/cleanup but good to keep clean)
		if (working.status === 'Completed') {
			if (dateInput) {
				working.finishedDate = `${dateInput}T00:00:00.000Z`;
			} else {
				working.finishedDate = null;
			}
		} else {
			// If not completed, these should be null
			working.finishedDate = null;
		}
	});

	// Auto-generate ID and Cover Path, and MainTitle/Subtitle logic from Title
	$effect(() => {
		if (!working) return;

		// 1. Auto MainTitle (always same as Title now)
		working.mainTitle = working.title;
		working.subtitle = null; // No longer used as input

		// 2. Auto ID and Cover for NEW games only (or if editing allows ID change? usually restricted)
		// For consistency, let's only do this if mode is Create, OR if we want to enforce it on Edit too.
		// Usually changing ID is risky if images are matched by ID. Logic says "the generated covers will use this id".
		if (mode === 'create' && working.title) {
			const slug = working.title
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-|-$/g, '');
			working.id = slug;
			working.coverImage = `covers/${slug}.webp`;
		}

		// 3. Score Calc (auto)
		if (
			working.status === 'Completed' &&
			working.ratingPresentation != null &&
			working.ratingStory != null &&
			working.ratingGameplay != null
		) {
			working.score = computeScore({
				ratingPresentation: working.ratingPresentation,
				ratingStory: working.ratingStory,
				ratingGameplay: working.ratingGameplay
			});
		}
	});

	// Sync hours/minutes to playtime string
	$effect(() => {
		if (working) {
			working.playtime = `${hours}h ${minutes}m`;
		}
	});

	// Sync completionOrderInput to working.completionOrder
	$effect(() => {
		if (working) {
			working.completionOrder = completionOrderInput;
		}
	});

	function validateGame(game: Game): string | null {
		// Field cleanups before validation
		if (game.status === 'Planned') {
			game.finishedDate = null;
			game.ratingPresentation = null;
			game.ratingStory = null;
			game.ratingGameplay = null;
			game.score = null;
			game.tier = null;
			delete game.completionOrder;
		}

		if (!game.title) return 'Title is required.';
		if (!game.platform) return 'Platform is required.';
		if (!game.genre) return 'Genre is required.';

		// Zod validation
		const result = GameSchema.safeParse(game);
		if (!result.success) {
			const first = result.error.issues[0];
			return `${first.path.join('.')}: ${first.message}`;
		}

		return null;
	}

	import { invalidateAll } from '$app/navigation';
	import { gamesStore } from '$lib/stores/games.svelte';

	async function handleSave() {
		if (!working) return;
		error = null;
		const validationError = validateGame(working);
		if (validationError) {
			error = validationError;
			return;
		}

		saving = true;

		try {
			// Update the pending store with the game and optional cover file
			if (mode === 'create') {
				editorStore.addPendingGame(working, coverFile);
			} else {
				editorStore.editPendingGame(working.id, working, coverFile);
			}

			// In development mode, we save immediately to local JSON file via the store
			if (dev) {
				const currentGames = gamesStore.games;

				// Safety check
				if (currentGames.length === 0 && mode === 'edit') {
					throw new Error(
						'Cannot save: games data appears to be missing. Please refresh the page.'
					);
				}

				const success = await editorStore.saveLocally(currentGames);
				if (success) {
					// Directly update the games store to bypass Vite's static file cache
					// Note: saveLocally clears pending changes on success
					const finalGames = editorStore.buildFinalGames(currentGames);
					gamesStore.setAllGames(finalGames);
					await invalidateAll();
					onClose();
				} else {
					error = editorStore.saveError || 'Failed to save changes locally.';
					saving = false;
				}
			} else {
				// Production mode: just close after queueing to store.
				// User will click "Apply Changes" globally to trigger the full save including files.
				onClose();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Save failed';
			saving = false;
		}
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') {
			e.preventDefault();
			onClose();
		}
	}}
/>

<div class="backdrop" role="presentation" onclick={onClose} onkeydown={handleKeyDown} tabindex="-1">
	<div
		bind:this={modalRef}
		class="modal"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(event) => event.stopPropagation()}
		onkeydown={handleKeyDown}
	>
		<h2>{mode === 'create' ? 'Add Game' : 'Edit Game'}</h2>

		{#if error}
			<div class="error">{error}</div>
		{/if}

		{#if !working}
			<div class="loading">Loading...</div>
		{:else}
			<div class="form-grid">
				<!-- Title Block -->
				<label class="full">
					<span>Title</span>
					<input
						bind:this={titleInputRef}
						type="text"
						bind:value={working.title}
						name="title"
						placeholder="Game Title"
						required
						autocomplete="off"
					/>
				</label>

				<!-- Platform / Genre with Datalists -->
				<label>
					<span>Platform</span>
					<input
						type="text"
						bind:value={working.platform}
						name="platform"
						list="platforms"
						placeholder="Select or type..."
						required
					/>
					<datalist id="platforms">
						{#each uniquePlatforms as p (p)}
							<option value={p}>{p}</option>
						{/each}
					</datalist>
				</label>

				<label>
					<span>Genre</span>
					<input
						type="text"
						bind:value={working.genre}
						name="genre"
						list="genres"
						placeholder="Select or type..."
						required
					/>
					<datalist id="genres">
						{#each uniqueGenres as g (g)}
							<option value={g}>{g}</option>
						{/each}
					</datalist>
				</label>

				<label class="full">
					<span>Status</span>
					<select bind:value={working.status} name="status">
						<option value="Planned">Planned</option>
						<option value="Completed">Completed</option>
					</select>
				</label>

				<!-- Combined Row: Year, Playtime, Co-op -->
				<div class="row-triple full">
					<label class="year-col">
						<span>Year</span>
						<input
							type="number"
							bind:value={working.year}
							name="year"
							min="1980"
							max="2100"
							required
						/>
					</label>

					<label class="time-col">
						<span>{working.status === 'Completed' ? 'Hours Played' : 'Time to Beat'}</span>
						<div class="playtime-inputs">
							<div class="input-group">
								<input type="number" bind:value={hours} name="hours" min="0" placeholder="0" />
								<span class="unit">h</span>
							</div>
							<div class="input-group">
								<input
									type="number"
									bind:value={minutes}
									name="minutes"
									min="0"
									max="59"
									placeholder="0"
								/>
								<span class="unit">m</span>
							</div>
						</div>
					</label>

					<label class="coop-col">
						<span>Co-op</span>
						<div class="checkbox-simple">
							<input
								type="checkbox"
								name="coOp"
								checked={working.coOp === 'Yes'}
								onchange={(e) => {
									if (working) working.coOp = e.currentTarget.checked ? 'Yes' : 'No';
								}}
							/>
						</div>
					</label>
				</div>
				{#if working.status === 'Completed'}
					<label>
						<span>Finished Date</span>
						<input type="date" bind:value={dateInput} required />
					</label>
					<label>
						<span>Daily Order</span>
						<input type="number" bind:value={completionOrderInput} placeholder="0" />
					</label>
				{/if}

				<div class="full cover-path" style="margin-top: 1.5rem;">
					<span class="label-text">Game ID</span>
					<!-- Read-only auto-generated path visualization + copy -->
					<div
						class="read-only-field copyable large-id"
						role="button"
						tabindex="0"
						onclick={copyGameId}
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								copyGameId();
							}
						}}
						title="Click to copy ID"
					>
						{#if copied}
							<span style="color: #4ade80; font-weight: 600;">Copied!</span>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="#4ade80"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
							>
								<polyline points="20 6 9 17 4 12" />
							</svg>
						{:else}
							<span>{working.id || '(Auto-generated)'}</span>
							<!-- Clipboard Icon -->
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="icon-copy"
							>
								<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
								<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
							</svg>
						{/if}
					</div>
				</div>

				<!-- Cover Image Upload -->
				<div class="full cover-upload-section">
					<span class="label-text">Cover Image (Optional)</span>
					<div class="cover-input-row">
						<input
							type="text"
							placeholder="Paste image URL..."
							bind:value={coverUrl}
							oninput={handleCoverUrlChange}
							disabled={!!coverFile}
							class="cover-url-input"
						/>
						<span class="or-divider">or</span>
						<label class="file-upload-btn">
							<input
								bind:this={fileInputRef}
								type="file"
								accept=".png,image/png"
								onchange={handleFileSelect}
								style="display: none;"
							/>
							<span class="upload-btn">Upload PNG</span>
						</label>
					</div>

					{#if coverError}
						<div class="cover-error">{coverError}</div>
					{/if}

					{#if coverPreview}
						<div class="cover-preview-wrap">
							<img src={coverPreview} alt="Cover preview" class="cover-preview" />
							<button
								type="button"
								class="clear-cover-btn"
								onclick={clearCover}
								title="Remove cover"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								>
									<line x1="18" y1="6" x2="6" y2="18"></line>
									<line x1="6" y1="6" x2="18" y2="18"></line>
								</svg>
							</button>
						</div>
					{/if}
				</div>

				<!-- Ratings (Completed Only) -->
				{#if working.status === 'Completed'}
					<div class="full divider"></div>
					<div class="full section-header">Ratings</div>

					<!-- Rating Presentation & Story -->
					<div class="rating-slider">
						<div class="label-row">
							<span>Presentation</span>
							<span class="val">{formatRating(working.ratingPresentation)}</span>
						</div>
						<input type="range" min="0" max="10" step="1" bind:value={working.ratingPresentation} />
					</div>

					<div class="rating-slider">
						<div class="label-row">
							<span>Story</span>
							<span class="val">{formatRating(working.ratingStory)}</span>
						</div>
						<input type="range" min="0" max="10" step="1" bind:value={working.ratingStory} />
					</div>

					<div class="rating-slider">
						<div class="label-row">
							<span>Gameplay</span>
							<span class="val">{formatRating(working.ratingGameplay)}</span>
						</div>
						<input type="range" min="0" max="10" step="1" bind:value={working.ratingGameplay} />
					</div>

					<div class="score-display">
						<span>Calculated Score:</span>
						<strong>{working.score ?? '-'}</strong>
					</div>

					<label class="full">
						<span>Tier</span>
						<select bind:value={working.tier}>
							<option value={null}>Select Tier...</option>
							{#each TIER_VALUES as t (t)}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</label>
				{/if}
			</div>

			<div class="actions">
				<button type="button" class="secondary" onclick={onClose} disabled={saving}>
					Cancel
				</button>
				<button type="button" class="primary" onclick={handleSave} disabled={saving}>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 60;
		backdrop-filter: blur(2px);
	}

	.modal {
		background: #020817;
		color: #e5e7eb;
		border-radius: 16px;
		padding: 1.5rem 1.5rem 1.25rem;
		max-width: 600px;
		width: 100%;
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(148, 163, 253, 0.1);
		max-height: 90vh;
		overflow-y: auto;
	}

	h2 {
		margin: 0 0 1.25rem;
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.error {
		margin-bottom: 1rem;
		padding: 0.6rem 0.8rem;
		border-radius: 0.5rem;
		background: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
		font-size: 0.85rem;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem 1.25rem;
		font-size: 0.85rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.full {
		grid-column: 1 / -1;
	}

	/* Remove spinner buttons */
	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.row-triple {
		display: grid;
		grid-template-columns: 100px 1fr auto;
		gap: 1.25rem;
		align-items: start;
	}

	.year-col input {
		text-align: center;
	}

	.checkbox-simple {
		display: flex;
		align-items: center;
		padding: 0.5rem 0; /* Align with input height approx */
		height: 38px;
	}

	.checkbox-simple input[type='checkbox'] {
		-webkit-appearance: none;
		appearance: none;
		width: 1.25rem;
		height: 1.25rem;
		cursor: pointer;
		background-color: #0f172a;
		border: 1px solid rgba(75, 85, 99, 0.4);
		border-radius: 4px;
		display: grid;
		place-content: center;
		transition:
			background-color 0.2s,
			border-color 0.2s;
	}

	.checkbox-simple input[type='checkbox']:checked {
		background-color: #6366f1;
		border-color: #6366f1;
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		background-position: center;
		background-repeat: no-repeat;
		background-size: 80%;
	}

	.large-id {
		font-size: 1rem;
		padding: 0.75rem 1rem;
		/* Make it visually pop a bit more */
		background: rgba(0, 0, 0, 0.3);
		border-color: rgba(148, 163, 253, 0.2);
	}

	span {
		color: #94a3b8;
		font-size: 0.8rem;
		font-weight: 500;
	}

	input[type='text'],
	input[type='number'],
	input[type='date'],
	select {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
		width: 100%;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	.read-only-field {
		padding: 0.5rem 0.75rem;
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 0.5rem;
		color: #64748b;
		font-family: monospace;
		font-size: 0.8rem;
	}

	.divider {
		height: 1px;
		background: rgba(255, 255, 255, 0.1);
		margin: 0.5rem 0;
	}

	.section-header {
		font-size: 0.9rem;
		font-weight: 600;
		color: #e2e8f0;
		margin-bottom: 0.5rem;
	}

	.rating-slider {
		grid-column: 1 / -1;
		background: rgba(255, 255, 255, 0.03);
		padding: 0.75rem;
		border-radius: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label-row {
		display: flex;
		justify-content: space-between;
	}

	.val {
		color: #fff;
		font-weight: 600;
	}

	input[type='range'] {
		width: 100%;
		accent-color: #6366f1;
		cursor: pointer;
	}

	.score-display {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		justify-content: flex-end;
		font-size: 1rem;
		color: #cbd5e1;
	}

	.score-display strong {
		color: #818cf8;
		font-size: 1.2rem;
	}

	.actions {
		margin-top: 1.5rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	button {
		border-radius: 9999px;
		padding: 0.5rem 1.25rem;
		border: none;
		font-size: 0.85rem;
		font-weight: 500;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		transition:
			transform 0.1s,
			opacity 0.2s;
	}

	button:active {
		transform: scale(0.98);
	}

	.primary {
		background: #4f46e5;
		color: #fff;
		box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
	}

	.primary:hover {
		background: #4338ca;
	}

	.primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
	}

	.secondary {
		background: transparent;
		color: #94a3b8;
	}

	.secondary:hover {
		color: #e2e8f0;
		background: rgba(255, 255, 255, 0.05);
	}

	.read-only-field.copyable {
		cursor: pointer;
		transition:
			background 0.2s,
			color 0.2s;
	}

	.read-only-field.copyable:hover {
		background: rgba(255, 255, 255, 0.1);
		color: #e2e8f0;
	}

	.read-only-field.copyable:active {
		background: rgba(255, 255, 255, 0.15);
	}

	.read-only-field.large-id {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.icon-copy {
		opacity: 0.6;
	}

	.read-only-field.copyable:hover .icon-copy {
		opacity: 1;
	}

	.playtime-inputs {
		display: flex;
		gap: 1rem;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
	}

	.input-group input {
		text-align: right;
	}

	.unit {
		color: #94a3b8;
		font-size: 0.85rem;
		font-weight: 500;
	}

	/* Cover Upload Styles */
	.cover-upload-section {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.cover-input-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.cover-url-input {
		flex: 1;
	}

	.or-divider {
		color: #64748b;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.file-upload-btn {
		cursor: pointer;
	}

	.upload-btn {
		display: inline-flex;
		align-items: center;
		padding: 0.5rem 1rem;
		background: rgba(99, 102, 241, 0.1);
		border: 1px solid rgba(99, 102, 241, 0.3);
		border-radius: 0.5rem;
		color: #818cf8;
		font-size: 0.85rem;
		font-weight: 500;
		transition: all 0.2s;
	}

	.upload-btn:hover {
		background: rgba(99, 102, 241, 0.2);
		border-color: rgba(99, 102, 241, 0.5);
	}

	.cover-error {
		margin-top: 0.5rem;
		padding: 0.4rem 0.6rem;
		border-radius: 0.375rem;
		background: rgba(239, 68, 68, 0.1);
		color: #fca5a5;
		font-size: 0.8rem;
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.cover-preview-wrap {
		position: relative;
		margin-top: 0.75rem;
		display: inline-block;
	}

	.cover-preview {
		width: 100px;
		height: 150px;
		object-fit: cover;
		border-radius: 0.5rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.clear-cover-btn {
		position: absolute;
		top: -8px;
		right: -8px;
		width: 24px;
		height: 24px;
		padding: 0;
		border-radius: 50%;
		background: #ef4444;
		color: white;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: transform 0.1s;
	}

	.clear-cover-btn:hover {
		transform: scale(1.1);
	}
</style>

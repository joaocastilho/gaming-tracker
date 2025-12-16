<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from '$lib/types/game';
	import { GameSchema, computeScore, TIER_VALUES } from '$lib/validation/game';
	import { editorStore } from '$lib/stores/editor.svelte';

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

	// Derived unique lists for auto-complete
	const uniquePlatforms = $derived([...new Set(allGames.map((g) => g.platform))].sort());
	const uniqueGenres = $derived([...new Set(allGames.map((g) => g.genre))].sort());

	onMount(() => {
		if (mode === 'edit' && initialGame) {
			working = structuredClone(initialGame);
			// Fix compatibility: Convert numeric playtime to string if needed
			if (typeof (working.playtime as unknown) === 'number') {
				// @ts-ignore - Runtime fix for data mismatch
				working.playtime = formatDuration(working.playtime as number);
			}
		} else {
			const now = new Date();
			// We'll generate ID from title later, but for now init empty
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

	function validateGame(game: Game): string | null {
		// Field cleanups before validation
		if (game.status === 'Planned') {
			game.finishedDate = null;
			game.ratingPresentation = null;
			game.ratingStory = null;
			game.ratingGameplay = null;
			game.score = null;
			game.tier = null;
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

	function handleSave() {
		if (!working) return;
		error = null;
		const validationError = validateGame(working);
		if (validationError) {
			error = validationError;
			return;
		}

		// Queue the change
		if (mode === 'create') {
			editorStore.addPendingGame(working);
		} else {
			editorStore.editPendingGame(working.id, working);
		}
		onClose();
	}
</script>

<div
	class="backdrop"
	role="presentation"
	onclick={onClose}
	onkeydown={(event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			onClose();
		}
	}}
	tabindex="-1"
>
	<div
		class="modal"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(event) => event.stopPropagation()}
		onkeydown={(event) => {
			if (event.key === 'Escape') {
				event.preventDefault();
				onClose();
			}
		}}
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
					<span>Title *</span>
					<input
						type="text"
						bind:value={working.title}
						placeholder="Game Title"
						required
						autocomplete="off"
					/>
				</label>

				<!-- Platform / Genre with Datalists -->
				<label>
					<span>Platform *</span>
					<input
						type="text"
						bind:value={working.platform}
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
					<span>Genre *</span>
					<input
						type="text"
						bind:value={working.genre}
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

				<label>
					<span>Year *</span>
					<input type="number" bind:value={working.year} min="1980" max="2100" required />
				</label>

				<label>
					<span>Status *</span>
					<select bind:value={working.status}>
						<option value="Planned">Planned</option>
						<option value="Completed">Completed</option>
					</select>
				</label>

				<!-- Co-op as Checkbox -->
				<label>
					<span>Co-op</span>
					<div class="checkbox-container">
						<input
							type="checkbox"
							checked={working.coOp === 'Yes'}
							onchange={(e) => (working!.coOp = e.currentTarget.checked ? 'Yes' : 'No')}
						/>
					</div>
				</label>

				<!-- Playtime Field (unified - label changes based on status) -->
				<label>
					<span>{working.status === 'Completed' ? 'Hours Played *' : 'Time to Beat'}</span>
					<input type="text" bind:value={working.playtime} placeholder="e.g. 15h 30m" />
				</label>
				{#if working.status === 'Completed'}
					<label>
						<span>Finished Date *</span>
						<input type="date" bind:value={working.finishedDate} required />
					</label>
				{/if}

				<div class="full cover-path">
					<span class="label-text">Cover Image Path</span>
					<!-- Read-only auto-generated path visualization -->
					<div class="read-only-field">
						{working.coverImage || '(Auto-generated from Title on Create)'}
					</div>
				</div>

				<!-- Ratings (Completed Only) -->
				{#if working.status === 'Completed'}
					<div class="full divider"></div>
					<div class="full section-header">Ratings</div>

					<div class="rating-slider">
						<div class="label-row">
							<span>Presentation</span>
							<span class="val">{working.ratingPresentation?.toFixed(1) ?? '-'}</span>
						</div>
						<input
							type="range"
							min="0"
							max="10"
							step="0.5"
							bind:value={working.ratingPresentation}
						/>
					</div>

					<div class="rating-slider">
						<div class="label-row">
							<span>Story</span>
							<span class="val">{working.ratingStory?.toFixed(1) ?? '-'}</span>
						</div>
						<input type="range" min="0" max="10" step="0.5" bind:value={working.ratingStory} />
					</div>

					<div class="rating-slider">
						<div class="label-row">
							<span>Gameplay</span>
							<span class="val">{working.ratingGameplay?.toFixed(1) ?? '-'}</span>
						</div>
						<input type="range" min="0" max="10" step="0.5" bind:value={working.ratingGameplay} />
					</div>

					<div class="score-display">
						<span>Calculated Score:</span>
						<strong>{working.score ?? '-'}</strong>
					</div>

					<label class="full">
						<span>Tier *</span>
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

	label.full {
		grid-column: 1 / -1;
	}

	.checkbox-container {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		min-height: 38px; /* Approximate height of text inputs */
		display: flex;
		align-items: center;
	}

	/* Specific override for checkbox inside container */
	.checkbox-container input[type='checkbox'] {
		width: 1rem;
		height: 1rem;
		margin: 0;
		padding: 0;
		border-radius: 4px;
		/* Standard inputs have background/border styling which might conflict if applied to checkbox directly 
           via global input selector. Let's rely on browser default or global cleanups, 
           ensuring it's centered. */
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
</style>

<script lang="ts">
	import { onMount } from 'svelte';
	import type { Game } from '$lib/types/game';
	import { GameSchema, computeScore } from '$lib/validation/game';
	import { gamesStore } from '$lib/stores/games';
	import { editorStore } from '$lib/stores/editor';

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

	onMount(() => {
		if (mode === 'edit' && initialGame) {
			working = structuredClone(initialGame);
		} else {
			const now = new Date();
			const id = `game-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`;
			working = {
				id,
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
				hoursPlayed: null,
				timeToBeat: '0h 0m',
				finishedDate: null
			} as Game;
		}
	});

	function validateGame(game: Game): string | null {
		if (!game.title && game.mainTitle) {
			game.title = game.mainTitle;
		}
		if (!game.mainTitle && game.title) {
			game.mainTitle = game.title;
		}

		if (!game.title) return 'Title is required.';
		if (!game.mainTitle) return 'Main title is required.';
		if (!game.platform) return 'Platform is required.';
		if (!game.genre) return 'Genre is required.';
		if (!game.coverImage) return 'Cover image path is required.';
		if (!game.timeToBeat) return 'Time to beat is required in "Xh Ym" format.';

		if (game.status === 'Planned') {
			if (
				game.hoursPlayed !== null ||
				game.finishedDate !== null ||
				game.ratingPresentation !== null ||
				game.ratingStory !== null ||
				game.ratingGameplay !== null ||
				game.score !== null ||
				game.tier !== null
			) {
				return 'Planned games cannot have completion data, ratings, score, or tier.';
			}
		}

		if (game.status === 'Completed') {
			if (game.hoursPlayed === null) {
				return 'Completed games must have hours played.';
			}
			if (!/^\d+h \d+m$/.test(String(game.hoursPlayed))) {
				return 'Hours played must be in "Xh Ym" format.';
			}
			if (!game.finishedDate) {
				return 'Completed games must have a finished date.';
			}
			if (
				game.ratingPresentation == null ||
				game.ratingStory == null ||
				game.ratingGameplay == null
			) {
				return 'Completed games must have all three ratings.';
			}
			if (game.tier == null) {
				return 'Completed games must have a tier.';
			}

			const expectedScore = computeScore({
				ratingPresentation: game.ratingPresentation,
				ratingStory: game.ratingStory,
				ratingGameplay: game.ratingGameplay
			});
			game.score = expectedScore;
		}

		const result = GameSchema.safeParse(game);
		if (!result.success) {
			const first = result.error.issues[0];
			return first?.message || 'Invalid game data.';
		}

		return null;
	}

	function buildNextGames(): Game[] {
		if (mode === 'create') {
			return [...allGames, working];
		}

		return allGames.map((g) => (g.id === working.id ? working : g));
	}

	async function handleSave() {
		error = null;
		const validationError = validateGame(working);
		if (validationError) {
			error = validationError;
			return;
		}

		saving = true;

		const succeeded = await editorStore.saveGames(() => {
			const games = buildNextGames();
			return { games };
		});

		saving = false;

		if (!succeeded) {
			error = editorStore.saveError || 'Save failed. Please try again.';
			return;
		}

		try {
			const res = await fetch('/api/games', {
				method: 'GET',
				headers: { Accept: 'application/json' },
				credentials: 'include'
			});

			if (res.ok) {
				const data = await res.json();
				if (data && Array.isArray(data.games)) {
					gamesStore.initializeGames(data.games as Game[]);
				}
			}
		} catch {
			// Ignore post-save refresh errors
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

		<div class="form-grid">
			<label>
				<span>Title *</span>
				<input type="text" bind:value={working.title} placeholder="Display title" required />
			</label>

			<label>
				<span>Main Title</span>
				<input
					type="text"
					bind:value={working.mainTitle}
					placeholder="Full title (optional if Title set)"
				/>
			</label>

			<label>
				<span>Subtitle</span>
				<input type="text" bind:value={working.subtitle} placeholder="Subtitle (optional)" />
			</label>

			<label>
				<span>Platform *</span>
				<input type="text" bind:value={working.platform} placeholder="e.g. PC, PS5" required />
			</label>

			<label>
				<span>Genre *</span>
				<input type="text" bind:value={working.genre} placeholder="e.g. RPG, Action" required />
			</label>

			<label>
				<span>Year *</span>
				<input type="number" bind:value={working.year} min="1980" max="2100" required />
			</label>

			<label class="full">
				<span>Cover Image Path *</span>
				<input
					type="text"
					bind:value={working.coverImage}
					placeholder="static/covers/... (must match deployed assets)"
					required
				/>
			</label>

			<label>
				<span>Status *</span>
				<select bind:value={working.status}>
					<option value="Planned">Planned</option>
					<option value="Completed">Completed</option>
				</select>
			</label>

			<label>
				<span>Co-op</span>
				<select bind:value={working.coOp}>
					<option value="No">No</option>
					<option value="Yes">Yes</option>
				</select>
			</label>

			<label>
				<span>Presentation Rating</span>
				<input type="number" min="0" max="10" step="0.5" bind:value={working.ratingPresentation} />
			</label>
			<label>
				<span>Story Rating</span>
				<input type="number" min="0" max="10" step="0.5" bind:value={working.ratingStory} />
			</label>
			<label>
				<span>Gameplay Rating</span>
				<input type="number" min="0" max="10" step="0.5" bind:value={working.ratingGameplay} />
			</label>

			<label>
				<span>Tier</span>
				<select bind:value={working.tier}>
					<option value={null}>None</option>
					<option value="S">S</option>
					<option value="A">A</option>
					<option value="B">B</option>
					<option value="C">C</option>
					<option value="D">D</option>
					<option value="E">E</option>
				</select>
			</label>

			<label>
				<span>Hours Played</span>
				<input
					type="text"
					bind:value={working.hoursPlayed}
					placeholder="e.g. 20h 30m (required for Completed)"
				/>
			</label>

			<label>
				<span>Time to Beat</span>
				<input type="text" bind:value={working.timeToBeat} placeholder="e.g. 20h 0m" />
			</label>

			<label>
				<span>Finished Date</span>
				<input type="date" bind:value={working.finishedDate} />
			</label>
		</div>

		<div class="actions">
			<button type="button" class="secondary" onclick={onClose} disabled={saving}> Cancel </button>
			<button type="button" class="primary" onclick={handleSave} disabled={saving}>
				{#if saving}
					Saving...
				{:else}
					Save
				{/if}
			</button>
		</div>
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
	}

	.modal {
		background: #020817;
		color: #e5e7eb;
		border-radius: 16px;
		padding: 1.5rem 1.5rem 1.25rem;
		max-width: 720px;
		width: 100%;
		box-shadow: 0 24px 60px rgba(15, 23, 42, 0.9);
		border: 1px solid rgba(148, 163, 253, 0.25);
		max-height: 90vh;
		overflow-y: auto;
	}

	h2 {
		margin: 0 0 0.75rem;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.error {
		margin-bottom: 0.75rem;
		padding: 0.4rem 0.6rem;
		border-radius: 0.5rem;
		background: rgba(239, 68, 68, 0.12);
		color: #fecaca;
		font-size: 0.8rem;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem 0.9rem;
		font-size: 0.78rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	label.full {
		grid-column: 1 / -1;
	}

	span {
		color: #9ca3af;
	}

	input,
	select {
		padding: 0.35rem 0.5rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.9);
		background: #020817;
		color: #e5e7eb;
		font-size: 0.78rem;
	}

	input:focus-visible,
	select:focus-visible {
		outline: 2px solid rgba(129, 140, 248, 0.9);
		outline-offset: 1px;
		border-color: transparent;
	}

	.actions {
		margin-top: 0.9rem;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
	}

	button {
		border-radius: 999px;
		padding: 0.35rem 0.9rem;
		border: none;
		font-size: 0.78rem;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.primary {
		background: #4f46e5;
		color: #e5e7eb;
	}

	.primary:hover {
		background: #4338ca;
	}

	.secondary {
		background: transparent;
		color: #9ca3af;
	}

	.secondary:hover {
		color: #e5e7eb;
		background: rgba(148, 163, 253, 0.06);
	}
</style>

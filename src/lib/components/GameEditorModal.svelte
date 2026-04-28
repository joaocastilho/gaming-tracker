<script lang="ts">
import { untrack } from 'svelte';
import type { Game } from '$lib/types/game';
import { GameSchema, computeScore } from '$lib/validation/game';
import { editorStore } from '$lib/stores/editor.svelte';
import { dev } from '$app/environment';
import { invalidateAll } from '$app/navigation';
import { gamesStore } from '$lib/stores/games.svelte';
import GameFormIdDisplay from './game-editor/GameFormIdDisplay.svelte';
import GameFormBasicInfo from './game-editor/GameFormBasicInfo.svelte';
import GameFormCover from './game-editor/GameFormCover.svelte';
import GameFormRatings from './game-editor/GameFormRatings.svelte';

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

let coverUrl = $state('');
let coverFile = $state<File | null>(null);
let coverPreview = $state<string | null>(null);
let blobUrls: string[] = [];
let coverError = $state<string | null>(null);
let fileInputRef = $state<HTMLInputElement>();

let modalRef = $state<HTMLDivElement>();
let titleInputRef = $state<HTMLInputElement>();

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
			if (document.activeElement === firstElement) {
				event.preventDefault();
				lastElement.focus();
			}
		} else {
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

function handleCoverUrlChange(url: string) {
	coverError = null;
	if (url) {
		try {
			const parsed = new URL(url);
			if (['http:', 'https:'].includes(parsed.protocol)) {
				coverPreview = url;
				coverFile = null;
			} else {
				coverError = 'Invalid URL';
				coverPreview = null;
			}
		} catch {
			coverError = 'Invalid URL';
			coverPreview = null;
		}
	} else {
		coverPreview = null;
	}
}

function handleFileSelect(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];
	coverError = null;

	if (file) {
		if (!file.type.startsWith('image/')) {
			coverError = 'Please select an image file';
			coverFile = null;
			coverPreview = null;
			return;
		}

		coverFile = file;
		coverUrl = '';
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

let _initialized = $state(false);

$effect(() => {
	if (titleInputRef && _initialized) {
		untrack(() => {
			setTimeout(() => titleInputRef?.focus(), 50);
		});
	}
});

$effect(() => {
	if (_initialized) return;
	_initialized = true;

	if (mode === 'edit' && initialGame) {
		working = JSON.parse(JSON.stringify(initialGame));
		if (working && typeof working.playtime === 'number') {
			working.playtime = formatDuration(working.playtime);
		}

		if (working && working.playtime) {
			const match = working.playtime.match(/(\d+)h\s*(\d+)m/);
			if (match) {
				hours = parseInt(match[1]);
				minutes = parseInt(match[2]);
			}
		}
		if (working && working.finishedDate) {
			dateInput = working.finishedDate.split('T')[0];
		}
		if (working) {
			completionOrderInput = working.completionOrder ?? null;
		}

		coverUrl = '';
		coverFile = null;
		coverError = null;
		if (working && working.coverImage) {
			coverPreview = `/${working.coverImage}`;
		} else {
			coverPreview = null;
		}
	} else {
		const now = new Date();
		const today = now.toISOString().split('T')[0];
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
			finishedDate: null,
		} as Game;
		dateInput = today;
		completionOrderInput = null;
		coverUrl = '';
		coverFile = null;
		coverPreview = null;
		coverError = null;
	}

	return () => {
		blobUrls.forEach((url) => {
			if (url.startsWith('blob:')) {
				URL.revokeObjectURL(url);
			}
		});
		blobUrls = [];
	};
});

$effect(() => {
	if (!working) return;
	if (working.status === 'Completed') {
		if (dateInput) {
			working.finishedDate = `${dateInput}T00:00:00.000Z`;
		} else {
			working.finishedDate = null;
		}
	} else {
		working.finishedDate = null;
	}
});

$effect(() => {
	if (!working) return;

	working.mainTitle = working.title;
	working.subtitle = null;

	if (mode === 'create' && working.title) {
		const slug = working.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
		working.id = slug;
		working.coverImage = `covers/${slug}.webp`;
	}

	if (
		working.status === 'Completed' &&
		working.ratingPresentation != null &&
		working.ratingStory != null &&
		working.ratingGameplay != null
	) {
		working.score = computeScore({
			ratingPresentation: working.ratingPresentation,
			ratingStory: working.ratingStory,
			ratingGameplay: working.ratingGameplay,
		});
	}
});

$effect(() => {
	if (working) {
		working.playtime = `${hours}h ${minutes}m`;
	}
});

$effect(() => {
	if (working) {
		working.completionOrder = completionOrderInput;
	}
});

function validateGame(game: Game): string | null {
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
	if (!game.year) return 'Year is required.';

	if (hours === undefined || hours === null || isNaN(hours)) return 'Hours field is required.';
	if (minutes === undefined || minutes === null || isNaN(minutes)) return 'Minutes field is required.';

	if (!coverUrl && !coverFile && !coverPreview) {
		return 'Cover Image is required.';
	}

	if (game.status === 'Completed') {
		if (!dateInput) return 'Finished Date is required.';
		if (game.ratingPresentation === null) return 'Presentation rating is required.';
		if (game.ratingStory === null) return 'Story rating is required.';
		if (game.ratingGameplay === null) return 'Gameplay rating is required.';
		if (!game.tier) return 'Tier is required.';
	}

	const result = GameSchema.safeParse(game);
	if (!result.success) {
		const first = result.error.issues[0];
		return `${first.path.join('.')}: ${first.message}`;
	}

	return null;
}

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
		if (mode === 'create') {
			editorStore.addPendingGame(working, coverFile);
		} else {
			editorStore.editPendingGame(working.id, working, coverFile);
		}

		if (dev) {
			const currentGames = gamesStore.games;

			if (currentGames.length === 0 && mode === 'edit') {
				throw new Error('Cannot save: games data appears to be missing. Please refresh the page.');
			}

			const success = await editorStore.saveLocally(currentGames);
			if (success) {
				const finalGames = editorStore.buildFinalGames(currentGames);
				gamesStore.setAllGames(finalGames);
				await invalidateAll();
				onClose();
			} else {
				error = editorStore.saveError || 'Failed to save changes locally.';
				saving = false;
			}
		} else {
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
			<div class="form-fields">
				<GameFormBasicInfo {working} {allGames} />

				<!-- Status, Finished Date, Order + Playtime, Co-op (single row) -->
				<div class="row-status">
					<div class="field-col">
						<label for="status">Status</label>
						<select id="status" bind:value={working.status}>
							<option value="Planned">Planned</option>
							<option value="Completed">Completed</option>
						</select>
					</div>

					{#if working.status === 'Completed'}
						<div class="field-col date-col">
							<label for="finishedDate">Finished Date *</label>
							<input id="finishedDate" type="date" bind:value={dateInput} required />
						</div>
					{/if}

					<div class="field-col">
						<span class="field-label">
							{working.status === 'Completed' ? 'Hours Played *' : 'Time to Beat *'}
						</span>
						<div class="playtime-inputs">
							<div class="input-group">
								<input type="number" bind:value={hours} name="hours" min="0" placeholder="0" required />
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
									required
								/>
								<span class="unit">m</span>
							</div>
						</div>
					</div>

					<div class="field-col narrow">
						<label for="order">Order</label>
						<input id="order" type="number" bind:value={completionOrderInput} placeholder="0" />
					</div>

					<div class="field-col coop-col">
						<span class="field-label">Co-op</span>
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
					</div>
				</div>

				<GameFormCover
					{coverUrl}
					{coverPreview}
					{coverError}
					onUrlChange={handleCoverUrlChange}
					onFileSelect={handleFileSelect}
					onClear={clearCover}
					bind:fileInputRef
				/>

				{#if working.status === 'Completed'}
					<GameFormRatings {working} />
				{/if}

				<GameFormIdDisplay gameId={working.id} onCopy={copyGameId} {copied} />
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
		width: calc(100% - 2rem);
		box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
		border: 1px solid rgba(148, 163, 253, 0.1);
		max-height: 92svh;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.modal::-webkit-scrollbar {
		display: none;
	}

	@media (min-width: 768px) {
		.modal {
			scrollbar-width: auto;
			-ms-overflow-style: auto;
		}
		.modal::-webkit-scrollbar {
			display: block;
			width: 6px;
		}
		.modal::-webkit-scrollbar-thumb {
			background-color: rgba(255, 255, 255, 0.1);
			border-radius: 3px;
		}
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

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: 0.85rem;
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input[type='number'] {
		-moz-appearance: textfield;
		appearance: textfield;
	}

	/* Horizontal rows */
	.row-status {
		display: flex;
		flex-wrap: nowrap;
		gap: 0.5rem 0.6rem;
		align-items: flex-end;
	}

	@media (max-width: 480px) {
		.row-status {
			flex-wrap: wrap;
		}
		.field-col.date-col {
			flex: 1 1 auto;
		}
	}

	.field-col label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}

	/* Column helper inside status row */
	.field-col {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.field-col > label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
	}

	.field-col.date-col {
		flex: 0 0 120px;
	}

	.field-col.narrow {
		flex: 0 0 68px;
	}

	.field-col.narrow input {
		text-align: center;
	}

	/* Shared input appearance */
	input[type='date'],
	input[type='number'],
	select {
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(75, 85, 99, 0.4);
		background: #0f172a;
		color: #e5e7eb;
		font-size: 0.9rem;
		width: 100%;
		box-sizing: border-box;
		height: 38px;
		font-family: inherit;
		line-height: normal;
		transition:
			border-color 0.2s,
			background-color 0.2s;
	}

	input[type='date']:focus,
	input[type='number']:focus,
	select:focus {
		outline: none;
		border-color: #6366f1;
		background: #1e293b;
	}

	/* Override date picker icon colour in webkit */
	input[type='date']::-webkit-calendar-picker-indicator {
		filter: invert(0.6);
		cursor: pointer;
	}

	/* Label span above inputs */
	.field-label {
		font-size: 0.8rem;
		color: #94a3b8;
		font-weight: 500;
		white-space: nowrap;
	}

	.coop-col {
		flex: 0 0 auto;
	}

	.checkbox-simple {
		display: flex;
		align-items: center;
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

	.playtime-inputs {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.input-group {
		display: flex;
		align-items: center;
		gap: 0.4rem;
	}

	.input-group input[type='number'] {
		width: 44px;
		text-align: center;
		padding: 0.4rem 0.35rem;
	}

	.unit {
		color: #64748b;
		font-size: 0.8rem;
		font-weight: 500;
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

	.loading {
		text-align: center;
		padding: 2rem;
		color: #94a3b8;
	}
</style>

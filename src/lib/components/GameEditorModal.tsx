import type { JSX } from '@solidjs/web';
import { createSignal, onSettled, Show } from 'solid-js';
import { editorStore } from '#lib/stores/editor.js';
import { gamesStore } from '#lib/stores/games.js';
import type { Game } from '#lib/types/game.js';
import { dev } from '#lib/utils/env.js';
import { computeScore, GameSchema } from '#lib/validation/game.js';
import GameFormBasicInfo from './game-editor/GameFormBasicInfo.js';
import GameFormCover from './game-editor/GameFormCover.js';
import GameFormIdDisplay from './game-editor/GameFormIdDisplay.js';
import GameFormRatings from './game-editor/GameFormRatings.js';
import './GameEditorModal.css';

function formatDuration(decimalHours: number): string {
	const h = Math.floor(decimalHours);
	const m = Math.round((decimalHours - h) * 60);
	return `${h}h ${m}m`;
}

export type EditorMode = 'create' | 'edit';

export interface GameEditorModalProps {
	mode: EditorMode;
	initialGame?: Game | null;
	allGames: Game[];
	onClose: () => void;
}

function createInitialWorking(
	mode: EditorMode,
	initialGame: Game | null | undefined
): {
	working: Game;
	hours: number;
	minutes: number;
	dateInput: string;
	completionOrder: number | null;
	coverPreview: string | null;
} {
	if (mode === 'edit' && initialGame) {
		const copy: Game = { ...initialGame };
		if (typeof copy.playtime === 'number') {
			copy.playtime = formatDuration(copy.playtime);
		}
		let h = 0;
		let m = 0;
		if (copy.playtime) {
			const match = copy.playtime.match(/(\d+)h\s*(\d+)m/);
			if (match) {
				h = parseInt(match[1], 10);
				m = parseInt(match[2], 10);
			}
		}
		const dateInput = copy.finishedDate ? copy.finishedDate.split('T')[0] : '';
		return {
			working: copy,
			hours: h,
			minutes: m,
			dateInput,
			completionOrder: copy.completionOrder ?? null,
			coverPreview: copy.coverImage ? `/${copy.coverImage}` : null,
		};
	}

	const now = new Date();
	const today = now.toISOString().split('T')[0];
	return {
		working: {
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
		},
		hours: 0,
		minutes: 0,
		dateInput: today,
		completionOrder: null,
		coverPreview: null,
	};
}

export default function GameEditorModal(props: GameEditorModalProps): JSX.Element {
	const [working, setWorking] = createSignal<Game | null>(null);
	const [error, setError] = createSignal<string | null>(null);
	const [saving, setSaving] = createSignal(false);
	const [dateInput, setDateInput] = createSignal('');
	const [hours, setHours] = createSignal(0);
	const [minutes, setMinutes] = createSignal(0);
	const [completionOrderInput, setCompletionOrderInput] = createSignal<number | null>(null);
	const [copied, setCopied] = createSignal(false);

	const [coverUrl, setCoverUrl] = createSignal('');
	const [coverFile, setCoverFile] = createSignal<File | null>(null);
	const [coverPreview, setCoverPreview] = createSignal<string | null>(null);
	const [coverError, setCoverError] = createSignal<string | null>(null);

	let blobUrls: string[] = [];
	let fileInputRef: HTMLInputElement | undefined;
	let modalRef: HTMLDivElement | undefined;

	function deriveWorking(
		base: Game,
		mode: EditorMode,
		nextDate: string,
		h: number,
		m: number,
		order: number | null
	): Game {
		const next: Game = { ...base };
		next.playtime = `${h}h ${m}m`;
		next.completionOrder = order;
		next.finishedDate = next.status === 'Completed' ? (nextDate ? `${nextDate}T00:00:00.000Z` : null) : null;

		if (mode === 'create') {
			next.mainTitle = next.title;
			next.subtitle = null;
			if (next.title) {
				const slug = next.title
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, '');
				next.id = slug;
				next.coverImage = `covers/${slug}.webp`;
			}
		}

		if (
			next.status === 'Completed' &&
			next.ratingPresentation != null &&
			next.ratingStory != null &&
			next.ratingGameplay != null
		) {
			next.score = computeScore({
				ratingPresentation: next.ratingPresentation,
				ratingStory: next.ratingStory,
				ratingGameplay: next.ratingGameplay,
			});
		}

		return next;
	}

	function patchWorking(patch: Partial<Game>): void {
		const curr = working();
		if (!curr) return;
		setWorking(
			deriveWorking({ ...curr, ...patch }, props.mode, dateInput(), hours(), minutes(), completionOrderInput())
		);
	}

	onSettled(() => {
		const init = createInitialWorking(props.mode, props.initialGame);
		setHours(init.hours);
		setMinutes(init.minutes);
		setDateInput(init.dateInput);
		setCompletionOrderInput(init.completionOrder);
		setCoverPreview(init.coverPreview);
		setWorking(deriveWorking(init.working, props.mode, init.dateInput, init.hours, init.minutes, init.completionOrder));

		const onWinKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				e.preventDefault();
				props.onClose();
			}
		};
		window.addEventListener('keydown', onWinKeyDown);

		return () => {
			window.removeEventListener('keydown', onWinKeyDown);
			blobUrls.forEach((url) => {
				if (url.startsWith('blob:')) {
					URL.revokeObjectURL(url);
				}
			});
			blobUrls = [];
		};
	});

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.key === 'Escape') {
			event.preventDefault();
			props.onClose();
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
			} else if (document.activeElement === lastElement) {
				event.preventDefault();
				firstElement.focus();
			}
		}
	}

	function copyGameId(): void {
		const curr = working();
		if (curr?.id) {
			void navigator.clipboard.writeText(curr.id);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	}

	function handleCoverUrlChange(url: string): void {
		setCoverUrl(url);
		setCoverError(null);
		if (url) {
			try {
				const parsed = new URL(url);
				if (['http:', 'https:'].includes(parsed.protocol)) {
					setCoverPreview(url);
					setCoverFile(null);
				} else {
					setCoverError('Invalid URL');
					setCoverPreview(null);
				}
			} catch {
				setCoverError('Invalid URL');
				setCoverPreview(null);
			}
		} else {
			setCoverPreview(null);
		}
	}

	function handleFileSelect(event: Event): void {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		setCoverError(null);

		if (file) {
			if (!file.type.startsWith('image/')) {
				setCoverError('Please select an image file');
				setCoverFile(null);
				setCoverPreview(null);
				return;
			}

			setCoverFile(file);
			setCoverUrl('');
			const prev = coverPreview();
			if (prev?.startsWith('blob:')) {
				URL.revokeObjectURL(prev);
				blobUrls = blobUrls.filter((u) => u !== prev);
			}
			const nextUrl = URL.createObjectURL(file);
			setCoverPreview(nextUrl);
			blobUrls.push(nextUrl);
		}
	}

	function clearCover(): void {
		setCoverUrl('');
		setCoverFile(null);
		const prev = coverPreview();
		if (prev?.startsWith('blob:')) {
			URL.revokeObjectURL(prev);
			blobUrls = blobUrls.filter((u) => u !== prev);
		}
		setCoverPreview(null);
		setCoverError(null);
		if (fileInputRef) {
			fileInputRef.value = '';
		}
	}

	function validateGame(game: Game): string | null {
		if (game.status === 'Planned' || game.status === 'Playing') {
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

		const h = hours();
		const m = minutes();
		if (h === undefined || h === null || Number.isNaN(h)) return 'Hours field is required.';
		if (m === undefined || m === null || Number.isNaN(m)) return 'Minutes field is required.';

		if (!coverUrl() && !coverFile() && !coverPreview()) {
			return 'Cover Image is required.';
		}

		if (game.status === 'Completed') {
			if (!dateInput()) return 'Finished Date is required.';
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

	async function handleSave(): Promise<void> {
		const curr = working();
		if (!curr) return;
		const candidate: Game = { ...curr };
		setError(null);

		const validationError = validateGame(candidate);
		if (validationError) {
			setError(validationError);
			return;
		}

		setSaving(true);
		try {
			if (props.mode === 'create') {
				editorStore.addPendingGame(candidate, coverFile(), coverUrl());
			} else {
				editorStore.editPendingGame(candidate.id, candidate, coverFile(), coverUrl());
			}

			if (dev) {
				const currentGames = gamesStore.games;
				if (currentGames.length === 0 && props.mode === 'edit') {
					throw new Error('Cannot save: games data appears to be missing. Please refresh the page.');
				}

				const success = await editorStore.saveLocally(currentGames);
				if (success) {
					props.onClose();
				} else {
					setError(editorStore.saveError || 'Failed to save changes locally.');
					setSaving(false);
				}
			} else {
				props.onClose();
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Save failed');
			setSaving(false);
		}
	}

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: modal backdrop dismisses on outside click
		<div
			class="backdrop game-editor-backdrop"
			role="presentation"
			onClick={() => props.onClose()}
			onKeyDown={handleKeyDown}
			tabindex="-1"
		>
			<div
				ref={(el) => {
					modalRef = el;
				}}
				class="modal game-editor-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="editor-title"
				tabindex="-1"
				onClick={(event) => event.stopPropagation()}
				onKeyDown={handleKeyDown}
			>
				<h2 id="editor-title">{props.mode === 'create' ? 'Add Game' : 'Edit Game'}</h2>

				<Show when={error()}>
					<div class="error">{error()}</div>
				</Show>

				<Show when={working()} fallback={<div class="loading">Loading...</div>}>
					{(w) => (
						<>
							<div class="form-fields">
								<GameFormBasicInfo working={w()} allGames={props.allGames} onUpdate={patchWorking} />

								<div class="row-status">
									<div class="field-col">
										<label for="status">Status</label>
										<select
											id="status"
											value={w().status}
											onChange={(e) => patchWorking({ status: e.currentTarget.value as Game['status'] })}
										>
											<option value="Planned">Planned</option>
											<option value="Playing">Playing</option>
											<option value="Completed">Completed</option>
										</select>
									</div>

									<Show when={w().status === 'Completed'}>
										<div class="field-col date-col">
											<label for="finishedDate">Finished Date *</label>
											<input
												id="finishedDate"
												type="date"
												value={dateInput()}
												onInput={(e) => {
													const next = e.currentTarget.value;
													setDateInput(next);
													patchWorking({});
												}}
												required
											/>
										</div>
									</Show>

									<div class="field-col">
										<span class="field-label" id="playtime-label">
											{w().status === 'Completed' ? 'Hours Played *' : 'Time to Beat *'}
										</span>
										<div class="playtime-inputs">
											<div class="input-group">
												<input
													type="number"
													value={hours()}
													onInput={(e) => {
														setHours(Number(e.currentTarget.value));
														patchWorking({});
													}}
													name="hours"
													min={0}
													placeholder="0"
													required
													aria-labelledby="playtime-label"
												/>
												<span class="unit">h</span>
											</div>
											<div class="input-group">
												<input
													type="number"
													value={minutes()}
													onInput={(e) => {
														setMinutes(Number(e.currentTarget.value));
														patchWorking({});
													}}
													name="minutes"
													min={0}
													max={59}
													placeholder="0"
													required
													aria-labelledby="playtime-label"
												/>
												<span class="unit">m</span>
											</div>
										</div>
									</div>

									<div class="field-col narrow">
										<label for="order">Order</label>
										<input
											id="order"
											type="number"
											value={completionOrderInput() ?? ''}
											onInput={(e) => {
												const raw = e.currentTarget.value;
												setCompletionOrderInput(raw === '' ? null : Number(raw));
												patchWorking({});
											}}
											placeholder="0"
										/>
									</div>

									<div class="field-col coop-col">
										<span class="field-label" id="coop-label">
											Co-op
										</span>
										<div class="checkbox-simple">
											<input
												type="checkbox"
												name="coOp"
												aria-labelledby="coop-label"
												checked={w().coOp === 'Yes'}
												onChange={(e) => patchWorking({ coOp: e.currentTarget.checked ? 'Yes' : 'No' })}
											/>
										</div>
									</div>
								</div>

								<GameFormCover
									coverUrl={coverUrl()}
									coverPreview={coverPreview()}
									coverError={coverError()}
									onUrlChange={handleCoverUrlChange}
									onFileSelect={handleFileSelect}
									onClear={clearCover}
									onFileInputRef={(el) => {
										fileInputRef = el;
									}}
								/>

								<Show when={w().status === 'Completed'}>
									<GameFormRatings working={w()} onUpdate={patchWorking} />
								</Show>

								<GameFormIdDisplay gameId={w().id} onCopy={copyGameId} copied={copied()} />
							</div>

							<div class="actions">
								<button type="button" class="secondary" onClick={() => props.onClose()} disabled={saving()}>
									Cancel
								</button>
								<button type="button" class="primary" onClick={() => void handleSave()} disabled={saving()}>
									{saving() ? 'Saving...' : 'Save'}
								</button>
							</div>
						</>
					)}
				</Show>
			</div>
		</div>
	);
}

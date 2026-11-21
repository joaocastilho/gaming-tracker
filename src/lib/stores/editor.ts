import type { Game } from '#lib/types/game.js';
import { type RawGameData, transformGameData } from '#lib/utils/dataTransformer.js';
import { browser, dev } from '#lib/utils/env.js';
import { gamesStore } from './games.js';
import { offlineStore } from './offline.js';
import { createSyncSignal } from './signalHelpers.js';

const SESSION_STORAGE_KEY = 'gaming-tracker-editor-mode';

type EditorState = {
	editorMode: boolean;
	loginPending: boolean;
	loginError: string | null;
	savePending: boolean;
	saveSuccess: boolean;
	saveError: string | null;
	lastSnapshot: unknown | null;
};

type PendingChanges = {
	adds: Game[];
	edits: Map<string, Game>;
	deletes: Set<string>;
	files: Map<string, File>;
	urls: Map<string, string>;
};

const initialState: EditorState = {
	editorMode: false,
	loginPending: false,
	loginError: null,
	savePending: false,
	saveSuccess: false,
	saveError: null,
	lastSnapshot: null,
};

class EditorStore {
	private _state = createSyncSignal<EditorState>({ ...initialState });
	private _pending = createSyncSignal<PendingChanges>({
		adds: [],
		edits: new Map(),
		deletes: new Set(),
		files: new Map(),
		urls: new Map(),
	});

	private patchState(partial: Partial<EditorState>): void {
		this._state.set({ ...this._state.get(), ...partial });
	}

	get editorMode(): boolean {
		return this._state.get().editorMode;
	}

	get loginPending(): boolean {
		return this._state.get().loginPending;
	}

	get loginError(): string | null {
		return this._state.get().loginError;
	}

	get savePending(): boolean {
		return this._state.get().savePending;
	}

	get saveSuccess(): boolean {
		return this._state.get().saveSuccess;
	}

	get saveError(): string | null {
		return this._state.get().saveError;
	}

	get hasSaveError(): boolean {
		return Boolean(this._state.get().saveError);
	}

	get hasLoginError(): boolean {
		return Boolean(this._state.get().loginError);
	}

	get isDevMode(): boolean {
		return dev;
	}

	get pendingAdds(): Game[] {
		return this._pending.get().adds;
	}

	get pendingEdits(): Map<string, Game> {
		return this._pending.get().edits;
	}

	get pendingDeletes(): Set<string> {
		return this._pending.get().deletes;
	}

	get hasPendingChanges(): boolean {
		const pending = this._pending.get();
		return pending.adds.length > 0 || pending.edits.size > 0 || pending.deletes.size > 0;
	}

	get pendingChangesCount(): number {
		const pending = this._pending.get();
		return pending.adds.length + pending.edits.size + pending.deletes.size;
	}

	addPendingGame(game: Game, file?: File | null, url?: string | null): void {
		const current = this._pending.get();
		const newFiles = new Map(current.files);
		if (file) {
			newFiles.set(game.id, file);
		}

		const newUrls = new Map(current.urls);
		if (url && !file) {
			newUrls.set(game.id, url);
		}

		const existingAddIndex = current.adds.findIndex((g) => g.id === game.id);
		const newAdds = [...current.adds];

		if (existingAddIndex !== -1) {
			newAdds[existingAddIndex] = game;
		} else {
			newAdds.push(game);
		}

		this._pending.set({
			...current,
			adds: newAdds,
			files: newFiles,
			urls: newUrls,
		});
	}

	editPendingGame(id: string, game: Game, file?: File | null, url?: string | null): void {
		const current = this._pending.get();
		const newEdits = new Map(current.edits);
		newEdits.set(id, game);

		const newFiles = new Map(current.files);
		if (file) {
			newFiles.set(id, file);
		}

		const newUrls = new Map(current.urls);
		if (url && !file) {
			newUrls.set(id, url);
		}

		this._pending.set({
			...current,
			edits: newEdits,
			files: newFiles,
			urls: newUrls,
		});
	}

	deletePendingGame(id: string): void {
		const current = this._pending.get();
		const newFiles = new Map(current.files);
		newFiles.delete(id);

		const newUrls = new Map(current.urls);
		newUrls.delete(id);

		const addIndex = current.adds.findIndex((g) => g.id === id);
		if (addIndex !== -1) {
			const newAdds = [...current.adds];
			newAdds.splice(addIndex, 1);
			this._pending.set({
				...current,
				adds: newAdds,
				files: newFiles,
				urls: newUrls,
			});
			return;
		}

		const newEdits = new Map(current.edits);
		newEdits.delete(id);

		const newDeletes = new Set(current.deletes);
		newDeletes.add(id);

		this._pending.set({
			...current,
			edits: newEdits,
			deletes: newDeletes,
			files: newFiles,
			urls: newUrls,
		});
	}

	discardAllChanges(): void {
		this._pending.set({
			adds: [],
			edits: new Map(),
			deletes: new Set(),
			files: new Map(),
			urls: new Map(),
		});
	}

	buildFinalGames(currentGames: Game[]): Game[] {
		const pending = this._pending.get();
		let result = [...currentGames];
		result = result.filter((g) => !pending.deletes.has(g.id));

		result = result.map((g) => {
			const edited = pending.edits.get(g.id);
			return edited ? edited : g;
		});

		result = [...result, ...pending.adds];

		return result;
	}

	async fetchLatestGames(): Promise<Game[] | null> {
		try {
			const res = await fetch(`/games.json?t=${Date.now()}`, {
				cache: 'no-store',
				headers: { accept: 'application/json' },
			});
			if (!res.ok) return null;
			const data = (await res.json()) as { games?: unknown };
			if (!data || !Array.isArray(data.games)) return null;
			return data.games.map((gameRaw) => transformGameData(gameRaw as RawGameData));
		} catch {
			return null;
		}
	}

	private async resolveBaseGames(currentGames: Game[]): Promise<Game[]> {
		try {
			if (browser && typeof navigator !== 'undefined' && !navigator.onLine) {
				return currentGames;
			}
		} catch {
			return currentGames;
		}
		try {
			const latest = await this.fetchLatestGames();
			if (latest && latest.length > 0) return latest;
		} catch {
			// Fall through to stale base
		}
		return currentGames;
	}

	async applyAllChanges(currentGames: Game[]): Promise<boolean> {
		if (!this.hasPendingChanges) {
			return true;
		}

		if (browser && !navigator.onLine) {
			const finalGames = this.buildFinalGames(currentGames);
			try {
				const { db } = await import('#lib/db.js');
				await db.sync_queue.put({ games: finalGames }, 'pending');
				this.discardAllChanges();
				offlineStore.setHasPendingSync(true);
				return true;
			} catch (error) {
				console.error('Failed to save changes offline:', error);
				return false;
			}
		}

		const finalGames = this.buildFinalGames(await this.resolveBaseGames(currentGames));
		const success = await this.saveGames(() => ({ games: finalGames }));

		if (success) {
			try {
				await gamesStore.setAllGames(finalGames);
			} catch {
				// Store update is best-effort; actual save succeeded
			}
			this.discardAllChanges();
		}

		return success;
	}

	private buildSaveFormData(payload: { games: Game[] }): FormData {
		const pending = this._pending.get();
		const formData = new FormData();
		const blob = new Blob([JSON.stringify(payload)], { type: 'application/json; charset=utf-8' });
		formData.append('games', blob, 'games.json');

		for (const [id, file] of pending.files.entries()) {
			formData.append(`cover_${id}`, file);
		}

		for (const [id, url] of pending.urls.entries()) {
			formData.append(`cover_url_${id}`, url);
		}

		return formData;
	}

	async saveLocally(currentGames: Game[]): Promise<boolean> {
		if (!this.hasPendingChanges) {
			return true;
		}

		const finalGames = this.buildFinalGames(await this.resolveBaseGames(currentGames));

		this.patchState({ savePending: true, saveSuccess: false, saveError: null });

		try {
			const formData = this.buildSaveFormData({ games: finalGames });

			const res = await fetch('/api/games-local', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				this.patchState({
					savePending: false,
					saveSuccess: false,
					saveError: (errorData as { error?: string }).error || 'Failed to save locally.',
				});
				return false;
			}

			try {
				await gamesStore.setAllGames(finalGames);
			} catch {
				// Store update is best-effort; actual save succeeded
			}
			this.patchState({ savePending: false, saveSuccess: true, saveError: null });
			this.discardAllChanges();
			return true;
		} catch (error) {
			this.patchState({
				savePending: false,
				saveSuccess: false,
				saveError: `Local save failed: ${error instanceof Error ? error.message : String(error)}`,
			});
			return false;
		}
	}

	async checkSession(): Promise<boolean> {
		try {
			const res = await fetch('/api/auth/check', {
				method: 'GET',
				credentials: 'include',
			});

			if (!res.ok) {
				this.patchState({ editorMode: false });
				return false;
			}

			const data = await res.json();
			if (!data.valid) {
				this.patchState({ editorMode: false });
				return false;
			}

			return true;
		} catch {
			return true;
		}
	}

	async login(username: string, password: string): Promise<boolean> {
		this.patchState({ loginPending: true, loginError: null });

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
				credentials: 'include',
			});

			if (!res.ok) {
				this.patchState({
					loginPending: false,
					editorMode: false,
					loginError: 'Login failed. Please try again.',
				});
				return false;
			}

			this.patchState({
				loginPending: false,
				loginError: null,
				editorMode: true,
			});

			if (browser) {
				try {
					sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
				} catch {
					// sessionStorage may throw in private browsing mode
				}
			}

			return true;
		} catch {
			this.patchState({
				loginPending: false,
				editorMode: false,
				loginError: 'Login failed. Please try again.',
			});
			return false;
		}
	}

	async logout(): Promise<void> {
		this._state.set({ ...initialState, editorMode: false });
		this.discardAllChanges();

		if (browser) {
			try {
				sessionStorage.removeItem(SESSION_STORAGE_KEY);
			} catch {
				// Ignore storage errors
			}

			if (!dev) {
				try {
					await fetch('/api/auth/logout', {
						method: 'POST',
						credentials: 'include',
					});
				} catch {
					// Ignore API errors - local state is already cleared
				}
			}
		}
	}

	setEditorModeFromSessionCheck(enabled: boolean): void {
		this.patchState({ editorMode: enabled });

		if (browser) {
			try {
				if (enabled) {
					sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
				} else {
					sessionStorage.removeItem(SESSION_STORAGE_KEY);
				}
			} catch {
				// Ignore storage errors
			}
		}
	}

	restoreFromSession(): void {
		if (browser) {
			try {
				const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
				if (stored === 'true') {
					this.patchState({ editorMode: true });
				}
			} catch {
				// Ignore storage errors
			}
		}
	}

	async saveGames(buildPayload: () => { games: Game[] }): Promise<boolean> {
		const snapshot = buildPayload();
		this.patchState({
			savePending: true,
			saveSuccess: false,
			saveError: null,
			lastSnapshot: snapshot,
		});

		try {
			const formData = this.buildSaveFormData(snapshot);

			const res = await fetch('/api/games', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			if (!res.ok) {
				await res.text().catch(() => '');
				this.patchState({
					savePending: false,
					saveSuccess: false,
					saveError: 'Save failed. Please try again.',
				});
				return false;
			}

			this.patchState({ savePending: false, saveSuccess: true, saveError: null });
			return true;
		} catch {
			this.patchState({
				savePending: false,
				saveSuccess: false,
				saveError: 'Save failed. Please try again.',
			});
			return false;
		}
	}
}

export const editorStore = new EditorStore();
export type { EditorStore, PendingChanges };

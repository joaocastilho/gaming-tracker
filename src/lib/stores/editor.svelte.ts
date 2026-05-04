import { untrack } from 'svelte';
import { browser, dev } from '$app/environment';
import type { Game } from '$lib/types/game';
import { db } from '$lib/db';
import { offlineStore } from './offline.svelte';

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
	private _state = $state<EditorState>({ ...initialState });
	private _pending = $state<PendingChanges>({
		adds: [],
		edits: new Map(),
		deletes: new Set(),
		files: new Map(),
		urls: new Map(),
	});

	// Direct property getters
	get editorMode(): boolean {
		return this._state.editorMode;
	}

	get loginPending(): boolean {
		return this._state.loginPending;
	}

	get loginError(): string | null {
		return this._state.loginError;
	}

	get savePending(): boolean {
		return this._state.savePending;
	}

	get saveSuccess(): boolean {
		return this._state.saveSuccess;
	}

	get saveError(): string | null {
		return this._state.saveError;
	}

	// Derived properties
	get isEditor(): boolean {
		return this._state.editorMode;
	}

	get hasSaveError(): boolean {
		return Boolean(this._state.saveError);
	}

	get hasLoginError(): boolean {
		return Boolean(this._state.loginError);
	}

	// Environment check
	get isDevMode(): boolean {
		return dev;
	}

	// Pending changes getters
	get pendingAdds(): Game[] {
		return this._pending.adds;
	}

	get pendingEdits(): Map<string, Game> {
		return this._pending.edits;
	}

	get pendingDeletes(): Set<string> {
		return this._pending.deletes;
	}

	get hasPendingChanges(): boolean {
		return this._pending.adds.length > 0 || this._pending.edits.size > 0 || this._pending.deletes.size > 0;
	}

	get pendingChangesCount(): number {
		return this._pending.adds.length + this._pending.edits.size + this._pending.deletes.size;
	}

	// Pending changes methods
	addPendingGame(game: Game, file?: File | null, url?: string | null): void {
		const newFiles = new Map(this._pending.files);
		if (file) {
			newFiles.set(game.id, file);
		}

		const newUrls = new Map(this._pending.urls);
		if (url && !file) {
			newUrls.set(game.id, url);
		}

		const existingAddIndex = this._pending.adds.findIndex((g) => g.id === game.id);
		const newAdds = [...this._pending.adds];

		if (existingAddIndex !== -1) {
			// Replace the existing pending add
			newAdds[existingAddIndex] = game;
		} else {
			// Push new add
			newAdds.push(game);
		}

		this._pending = {
			...this._pending,
			adds: newAdds,
			files: newFiles,
			urls: newUrls,
		};
	}

	editPendingGame(id: string, game: Game, file?: File | null, url?: string | null): void {
		const newEdits = new Map(this._pending.edits);
		newEdits.set(id, game);

		const newFiles = new Map(this._pending.files);
		if (file) {
			newFiles.set(id, file);
		}

		const newUrls = new Map(this._pending.urls);
		if (url && !file) {
			newUrls.set(id, url);
		}

		this._pending = {
			...this._pending,
			edits: newEdits,
			files: newFiles,
			urls: newUrls,
		};
	}

	deletePendingGame(id: string): void {
		const newFiles = new Map(this._pending.files);
		if (newFiles.has(id)) {
			newFiles.delete(id);
		}

		const newUrls = new Map(this._pending.urls);
		if (newUrls.has(id)) {
			newUrls.delete(id);
		}

		const addIndex = this._pending.adds.findIndex((g) => g.id === id);
		if (addIndex !== -1) {
			const newAdds = [...this._pending.adds];
			newAdds.splice(addIndex, 1);
			this._pending = {
				...this._pending,
				adds: newAdds,
				files: newFiles,
				urls: newUrls,
			};
			return;
		}

		// If it's a pending edit, remove from edits and add to deletes
		const newEdits = new Map(this._pending.edits);
		newEdits.delete(id);

		const newDeletes = new Set(this._pending.deletes);
		newDeletes.add(id);

		this._pending = {
			...this._pending,
			edits: newEdits,
			deletes: newDeletes,
			files: newFiles,
			urls: newUrls,
		};
	}

	discardAllChanges(): void {
		this._pending = {
			adds: [],
			edits: new Map(),
			deletes: new Set(),
			files: new Map(),
			urls: new Map(),
		};
	}

	clearPending(): void {
		this.discardAllChanges();
	}

	buildFinalGames(currentGames: Game[]): Game[] {
		let result = [...currentGames];
		result = result.filter((g) => !this._pending.deletes.has(g.id));

		result = result.map((g) => {
			const edited = this._pending.edits.get(g.id);
			return edited ? edited : g;
		});

		result = [...result, ...this._pending.adds];

		return result;
	}

	async applyAllChanges(currentGames: Game[]): Promise<boolean> {
		if (!this.hasPendingChanges) {
			return true;
		}

		if (browser && !navigator.onLine) {
			const finalGames = this.buildFinalGames(currentGames);
			try {
				await db.sync_queue.put({ games: finalGames }, 'pending');
				this.discardAllChanges();
				offlineStore.setHasPendingSync(true);
				return true;
			} catch (error) {
				console.error('Failed to save changes offline:', error);
				return false;
			}
		}

		const finalGames = this.buildFinalGames(currentGames);
		const success = await this.saveGames(() => ({ games: finalGames }));

		if (success) {
			this.discardAllChanges();
		}

		return success;
	}

	async saveLocally(currentGames: Game[]): Promise<boolean> {
		if (!this.hasPendingChanges) {
			return true;
		}

		const finalGames = this.buildFinalGames(currentGames);

		this._state = {
			...this._state,
			savePending: true,
			saveSuccess: false,
			saveError: null,
		};

		try {
			const formData = new FormData();
			const payload = { games: finalGames };
			const blob = new Blob([JSON.stringify(payload)], { type: 'application/json; charset=utf-8' });
			formData.append('games', blob, 'games.json');

			// Append all pending files
			for (const [id, file] of this._pending.files.entries()) {
				formData.append(`cover_${id}`, file);
			}

			// Append all pending urls
			for (const [id, url] of this._pending.urls.entries()) {
				formData.append(`cover_url_${id}`, url);
			}

			const res = await fetch('/api/games-local', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				this._state = {
					...this._state,
					savePending: false,
					saveSuccess: false,
					saveError: (errorData as { error?: string }).error || 'Failed to save locally.',
				};
				return false;
			}

			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: true,
				saveError: null,
			};

			this.discardAllChanges();
			return true;
		} catch (error) {
			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: false,
				saveError: `Local save failed: ${error instanceof Error ? error.message : String(error)}`,
			};
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
				this._state = { ...this._state, editorMode: false };
				return false;
			}

			const data = await res.json();
			if (!data.valid) {
				this._state = { ...this._state, editorMode: false };
				return false;
			}

			return true;
		} catch {
			return true;
		}
	}

	async login(username: string, password: string): Promise<boolean> {
		this._state = { ...this._state, loginPending: true, loginError: null };

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
				this._state = {
					...this._state,
					loginPending: false,
					editorMode: false,
					loginError: 'Login failed. Please try again.',
				};
				return false;
			}

			this._state = {
				...this._state,
				loginPending: false,
				loginError: null,
				editorMode: true,
			};

			if (browser) {
				try {
					sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
				} catch {}
			}

			return true;
		} catch {
			this._state = {
				...this._state,
				loginPending: false,
				editorMode: false,
				loginError: 'Login failed. Please try again.',
			};
			return false;
		}
	}

	async logout(): Promise<void> {
		this._state = { ...initialState, editorMode: false };
		this.discardAllChanges();

		// Clear session storage
		if (browser) {
			try {
				sessionStorage.removeItem(SESSION_STORAGE_KEY);
			} catch {
				// Ignore storage errors
			}

			// Call logout API to clear the server-side cookie (production only)
			// In dev mode there's no /api/auth/logout endpoint
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
		this._state = { ...this._state, editorMode: enabled };

		// Sync with session storage
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
					this._state = { ...this._state, editorMode: true };
				}
			} catch {
				// Ignore storage errors
			}
		}
	}

	captureSnapshot(snapshot: unknown): void {
		this._state = { ...this._state, lastSnapshot: snapshot };
	}

	restoreSnapshot(): unknown {
		return this._state.lastSnapshot;
	}

	async saveGames(buildPayload: () => { games: unknown }): Promise<boolean> {
		const snapshot = buildPayload();
		this._state = {
			...this._state,
			savePending: true,
			saveSuccess: false,
			saveError: null,
			lastSnapshot: snapshot,
		};

		try {
			const formData = new FormData();
			const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json; charset=utf-8' });
			formData.append('games', blob, 'games.json');

			// Append all pending files
			for (const [id, file] of this._pending.files.entries()) {
				formData.append(`cover_${id}`, file);
			}

			// Append all pending urls
			for (const [id, url] of this._pending.urls.entries()) {
				formData.append(`cover_url_${id}`, url);
			}

			const res = await fetch('/api/games', {
				method: 'POST',
				body: formData,
				credentials: 'include',
			});

			if (!res.ok) {
				await res.text().catch(() => '');
				this._state = {
					...this._state,
					savePending: false,
					saveSuccess: false,
					saveError: 'Save failed. Please try again.',
				};
				return false;
			}

			const data = await res.json().catch(() => null);

			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: true,
				saveError: null,
			};

			if (data && typeof data === 'object' && 'games' in data) {
				return true;
			}

			return true;
		} catch {
			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: false,
				saveError: 'Save failed. Please try again.',
			};
			return false;
		}
	}

	subscribe(fn: (value: EditorState) => void): () => void {
		fn(this._state);

		const root = $effect.root(() => {
			let first = true;
			$effect(() => {
				const state = this._state;
				if (first) {
					first = false;
					return;
				}
				untrack(() => fn(state));
			});
		});

		return () => {
			root();
		};
	}
}

export const editorStore = new EditorStore();
export type { EditorStore, PendingChanges };

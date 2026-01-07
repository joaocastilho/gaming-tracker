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
};

const initialState: EditorState = {
	editorMode: false,
	loginPending: false,
	loginError: null,
	savePending: false,
	saveSuccess: false,
	saveError: null,
	lastSnapshot: null
};

class EditorStore {
	private _state = $state<EditorState>({ ...initialState });
	private _pending = $state<PendingChanges>({
		adds: [],
		edits: new Map(),
		deletes: new Set()
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
		return (
			this._pending.adds.length > 0 ||
			this._pending.edits.size > 0 ||
			this._pending.deletes.size > 0
		);
	}

	get pendingChangesCount(): number {
		return this._pending.adds.length + this._pending.edits.size + this._pending.deletes.size;
	}

	// Pending changes methods
	addPendingGame(game: Game): void {
		this._pending = {
			...this._pending,
			adds: [...this._pending.adds, game]
		};
	}

	editPendingGame(id: string, game: Game): void {
		const newEdits = new Map(this._pending.edits);
		newEdits.set(id, game);
		this._pending = {
			...this._pending,
			edits: newEdits
		};
	}

	deletePendingGame(id: string): void {
		// If it's a pending add, just remove it from adds
		const addIndex = this._pending.adds.findIndex((g) => g.id === id);
		if (addIndex !== -1) {
			const newAdds = [...this._pending.adds];
			newAdds.splice(addIndex, 1);
			this._pending = {
				...this._pending,
				adds: newAdds
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
			deletes: newDeletes
		};
	}

	discardAllChanges(): void {
		this._pending = {
			adds: [],
			edits: new Map(),
			deletes: new Set()
		};
	}

	/**
	 * Build the final games array by applying all pending changes to the current games
	 */
	buildFinalGames(currentGames: Game[]): Game[] {
		// Start with current games
		let result = [...currentGames];

		// Remove deleted games
		result = result.filter((g) => !this._pending.deletes.has(g.id));

		// Apply edits
		result = result.map((g) => {
			const edited = this._pending.edits.get(g.id);
			return edited ? edited : g;
		});

		// Add new games
		result = [...result, ...this._pending.adds];

		return result;
	}

	/**
	 * Apply all pending changes by sending to the API
	 */
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

	/**
	 * Save games directly to local static/games.json file (dev mode only).
	 * This bypasses the production API and writes to the file system.
	 */
	async saveLocally(currentGames: Game[]): Promise<boolean> {
		if (!this.hasPendingChanges) {
			return true;
		}

		const finalGames = this.buildFinalGames(currentGames);

		this._state = {
			...this._state,
			savePending: true,
			saveSuccess: false,
			saveError: null
		};

		try {
			const res = await fetch('/api/games-local', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ games: finalGames })
			});

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}));
				this._state = {
					...this._state,
					savePending: false,
					saveSuccess: false,
					saveError: (errorData as { error?: string }).error || 'Failed to save locally.'
				};
				return false;
			}

			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: true,
				saveError: null
			};

			this.discardAllChanges();
			return true;
		} catch (error) {
			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: false,
				saveError: `Local save failed: ${error instanceof Error ? error.message : String(error)}`
			};
			return false;
		}
	}

	/**
	 * Check if session is still valid by calling the auth check endpoint.
	 */
	async checkSession(): Promise<boolean> {
		try {
			const res = await fetch('/api/auth/check', {
				method: 'GET',
				credentials: 'include'
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
			// Network error - assume session is still valid
			return true;
		}
	}

	async login(username: string, password: string): Promise<boolean> {
		this._state = { ...this._state, loginPending: true, loginError: null };

		try {
			const res = await fetch('/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password }),
				credentials: 'include'
			});

			if (!res.ok) {
				this._state = {
					...this._state,
					loginPending: false,
					editorMode: false,
					loginError: 'Login failed. Please try again.'
				};
				return false;
			}

			this._state = {
				...this._state,
				loginPending: false,
				loginError: null,
				editorMode: true
			};

			// Persist to session storage
			if (browser) {
				try {
					sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
				} catch {
					// Ignore storage errors
				}
			}

			return true;
		} catch {
			this._state = {
				...this._state,
				loginPending: false,
				editorMode: false,
				loginError: 'Login failed. Please try again.'
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
						credentials: 'include'
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

	/**
	 * Restore editor mode from session storage on page load
	 */
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
			lastSnapshot: snapshot
		};

		try {
			const res = await fetch('/api/games', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(snapshot),
				credentials: 'include'
			});

			if (!res.ok) {
				await res.text().catch(() => '');
				this._state = {
					...this._state,
					savePending: false,
					saveSuccess: false,
					saveError: 'Save failed. Please try again.'
				};
				return false;
			}

			const data = await res.json().catch(() => null);

			this._state = {
				...this._state,
				savePending: false,
				saveSuccess: true,
				saveError: null
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
				saveError: 'Save failed. Please try again.'
			};
			return false;
		}
	}

	// For backwards compatibility with $editorStore subscription
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

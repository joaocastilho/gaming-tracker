/**
 * Editor Store - Svelte 5 Runes
 * Manages admin editor state, login, and save operations
 */

type EditorState = {
	editorMode: boolean;
	loginPending: boolean;
	loginError: string | null;
	savePending: boolean;
	saveSuccess: boolean;
	saveError: string | null;
	lastSnapshot: unknown | null;
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

	logout(): void {
		this._state = { ...initialState, editorMode: false };
	}

	setEditorModeFromSessionCheck(enabled: boolean): void {
		this._state = { ...this._state, editorMode: enabled };
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

	// For backwards compatibility
	subscribe(fn: (value: EditorState) => void): () => void {
		fn(this._state);
		return () => {};
	}
}

export const editorStore = new EditorStore();
export type { EditorStore };

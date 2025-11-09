import { writable, derived, get } from 'svelte/store';

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

function createEditorStore() {
	const state = writable<EditorState>({ ...initialState });

	const isEditor = derived(state, ($s) => $s.editorMode);
	const hasSaveError = derived(state, ($s) => Boolean($s.saveError));
	const hasLoginError = derived(state, ($s) => Boolean($s.loginError));

	async function login(username: string, password: string): Promise<boolean> {
		state.update((s) => ({ ...s, loginPending: true, loginError: null }));

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
				state.update((s) => ({
					...s,
					loginPending: false,
					editorMode: false,
					loginError: 'Login failed. Please try again.'
				}));
				return false;
			}

			state.update((s) => ({
				...s,
				loginPending: false,
				loginError: null,
				editorMode: true
			}));

			return true;
		} catch (error) {
			console.error('Login error', error);
			state.update((s) => ({
				...s,
				loginPending: false,
				editorMode: false,
				loginError: 'Login failed. Please try again.'
			}));
			return false;
		}
	}

	function logout() {
		state.set({ ...initialState, editorMode: false });
	}

	function setEditorModeFromSessionCheck(enabled: boolean) {
		state.update((s) => ({ ...s, editorMode: enabled }));
	}

	function captureSnapshot(snapshot: unknown) {
		state.update((s) => ({ ...s, lastSnapshot: snapshot }));
	}

	function restoreSnapshot() {
		const s = get(state);
		return s.lastSnapshot;
	}

	async function saveGames(buildPayload: () => { games: unknown }): Promise<boolean> {
		const snapshot = buildPayload();
		state.update((s) => ({
			...s,
			savePending: true,
			saveSuccess: false,
			saveError: null,
			lastSnapshot: snapshot
		}));

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
				const text = await res.text().catch(() => '');
				console.error('Save failed', res.status, text);
				state.update((s) => ({
					...s,
					savePending: false,
					saveSuccess: false,
					saveError: 'Save failed. Please try again.'
				}));
				return false;
			}

			const data = await res.json().catch(() => null);

			state.update((s) => ({
				...s,
				savePending: false,
				saveSuccess: true,
				saveError: null
			}));

			// Caller is responsible for updating the shared games store
			// with data.games/meta if the API returns it.
			if (data && typeof data === 'object' && 'games' in data) {
				return true;
			}

			return true;
		} catch (error) {
			console.error('Save error', error);
			state.update((s) => ({
				...s,
				savePending: false,
				saveSuccess: false,
				saveError: 'Save failed. Please try again.'
			}));
			return false;
		}
	}

	return {
		subscribe: state.subscribe,
		// expose raw state booleans for $editorStore usage in components
		get editorMode() {
			return get(state).editorMode;
		},
		get loginPending() {
			return get(state).loginPending;
		},
		get loginError() {
			return get(state).loginError;
		},
		get savePending() {
			return get(state).savePending;
		},
		get saveSuccess() {
			return get(state).saveSuccess;
		},
		get saveError() {
			return get(state).saveError;
		},
		isEditor,
		hasSaveError,
		hasLoginError,
		login,
		logout,
		setEditorModeFromSessionCheck,
		captureSnapshot,
		restoreSnapshot,
		saveGames
	};
}

export const editorStore = createEditorStore();
export type EditorStore = ReturnType<typeof createEditorStore>;

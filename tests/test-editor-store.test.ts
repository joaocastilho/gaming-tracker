import { beforeEach, describe, expect, it, vi } from 'vitest';
import { editorStore } from '$lib/stores/editor.svelte';

/**
 * Comprehensive tests for editorStore (Svelte 5 version)
 * Tests login, logout, save, and snapshot functionality
 */

// Store original fetch for restore
const originalFetch = globalThis.fetch;

// Helper to create typed mock fetch
function mockFetch(response: Partial<Response>): typeof fetch {
	return vi.fn(() => Promise.resolve(response as Response)) as unknown as typeof fetch;
}

function mockFetchError(): typeof fetch {
	return vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch;
}

describe('EditorStore', () => {
	beforeEach(() => {
		editorStore.logout();
		globalThis.fetch = originalFetch;
	});

	describe('Initial State', () => {
		it('starts with editor mode disabled', () => {
			expect(editorStore.editorMode).toBe(false);
		});

		it('starts with no pending states', () => {
			expect(editorStore.loginPending).toBe(false);
			expect(editorStore.savePending).toBe(false);
		});

		it('starts with no errors', () => {
			expect(editorStore.loginError).toBeNull();
			expect(editorStore.saveError).toBeNull();
		});
	});

	describe('Editor Mode', () => {
		it('setEditorModeFromSessionCheck enables editor mode', () => {
			editorStore.setEditorModeFromSessionCheck(true);
			expect(editorStore.editorMode).toBe(true);
		});

		it('setEditorModeFromSessionCheck disables editor mode', () => {
			editorStore.setEditorModeFromSessionCheck(true);
			editorStore.setEditorModeFromSessionCheck(false);
			expect(editorStore.editorMode).toBe(false);
		});

		it('logout resets editor mode', () => {
			editorStore.setEditorModeFromSessionCheck(true);
			expect(editorStore.editorMode).toBe(true);

			editorStore.logout();
			expect(editorStore.editorMode).toBe(false);
		});
	});

	describe('Derived Properties', () => {
		it('isEditor reflects editorMode', () => {
			expect(editorStore.isEditor).toBe(false);

			editorStore.setEditorModeFromSessionCheck(true);
			expect(editorStore.isEditor).toBe(true);
		});

		it('hasLoginError reflects login error state', () => {
			expect(editorStore.hasLoginError).toBe(false);
		});

		it('hasSaveError reflects save error state', () => {
			expect(editorStore.hasSaveError).toBe(false);
		});
	});

	describe('Snapshot', () => {
		it('captureSnapshot stores data', () => {
			const testData = { games: [{ id: '1', title: 'Test' }] };
			editorStore.captureSnapshot(testData);

			const restored = editorStore.restoreSnapshot();
			expect(restored).toEqual(testData);
		});

		it('restoreSnapshot returns null when no snapshot', () => {
			editorStore.logout();
			const restored = editorStore.restoreSnapshot();
			expect(restored).toBeNull();
		});
	});

	describe('Login Flow', () => {
		it('login returns true on success', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ success: true })
			});

			const result = await editorStore.login('admin', 'password');
			expect(result).toBe(true);
			expect(editorStore.editorMode).toBe(true);
			expect(editorStore.loginError).toBeNull();
		});

		it('login returns false on failure', async () => {
			globalThis.fetch = mockFetch({
				ok: false,
				json: () => Promise.resolve({ error: 'Invalid' })
			});

			const result = await editorStore.login('wrong', 'wrong');
			expect(result).toBe(false);
			expect(editorStore.editorMode).toBe(false);
			expect(editorStore.loginError).toBeDefined();
		});

		it('login handles network error', async () => {
			globalThis.fetch = mockFetchError();

			const result = await editorStore.login('admin', 'password');
			expect(result).toBe(false);
			expect(editorStore.loginError).toBeDefined();
		});
	});

	describe('Save Flow', () => {
		it('saveGames returns true on success', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ games: [] })
			});

			const result = await editorStore.saveGames(() => ({ games: [{ id: '1' }] }));

			expect(result).toBe(true);
			expect(editorStore.saveSuccess).toBe(true);
			expect(editorStore.saveError).toBeNull();
		});

		it('saveGames returns false on failure', async () => {
			globalThis.fetch = mockFetch({
				ok: false,
				text: () => Promise.resolve('Error')
			});

			const result = await editorStore.saveGames(() => ({ games: [] }));

			expect(result).toBe(false);
			expect(editorStore.saveError).toBeDefined();
		});

		it('saveGames handles network error', async () => {
			globalThis.fetch = mockFetchError();

			const result = await editorStore.saveGames(() => ({ games: [] }));

			expect(result).toBe(false);
			expect(editorStore.saveError).toBeDefined();
		});

		it('saveGames captures snapshot', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ games: [] })
			});

			const testPayload = { games: [{ id: 'captured' }] };
			await editorStore.saveGames(() => testPayload);

			const restored = editorStore.restoreSnapshot();
			expect(restored).toEqual(testPayload);
		});
	});

	describe('Local Save Flow', () => {
		const mockGame = {
			id: 'test-game-1',
			title: 'Test Game',
			mainTitle: 'Test Game',
			subtitle: null,
			platform: 'PC',
			year: 2024,
			genre: 'Action',
			coOp: 'No' as const,
			status: 'Planned' as const,
			coverImage: 'covers/test.webp',
			playtime: '10h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null
		};

		it('saveLocally returns true when no pending changes', async () => {
			const result = await editorStore.saveLocally([]);
			expect(result).toBe(true);
		});

		it('saveLocally calls /api/games-local endpoint', async () => {
			const mockFn = vi.fn(() =>
				Promise.resolve({
					ok: true,
					json: () => Promise.resolve({ ok: true, saved: 1 })
				} as Response)
			);
			globalThis.fetch = mockFn as unknown as typeof fetch;

			editorStore.addPendingGame(mockGame);
			await editorStore.saveLocally([]);

			expect(mockFn).toHaveBeenCalledWith(
				'/api/games-local',
				expect.objectContaining({
					method: 'POST',
					headers: { 'Content-Type': 'application/json' }
				})
			);
		});

		it('saveLocally clears pending changes on success', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ ok: true, saved: 1 })
			});

			editorStore.addPendingGame(mockGame);
			expect(editorStore.hasPendingChanges).toBe(true);

			await editorStore.saveLocally([]);

			expect(editorStore.hasPendingChanges).toBe(false);
		});

		it('saveLocally returns false on failure', async () => {
			globalThis.fetch = mockFetch({
				ok: false,
				json: () => Promise.resolve({ error: 'Write failed' })
			});

			editorStore.addPendingGame(mockGame);
			const result = await editorStore.saveLocally([]);

			expect(result).toBe(false);
			expect(editorStore.saveError).toBeDefined();
		});

		it('saveLocally handles network error', async () => {
			globalThis.fetch = mockFetchError();

			editorStore.addPendingGame(mockGame);
			const result = await editorStore.saveLocally([]);

			expect(result).toBe(false);
			expect(editorStore.saveError).toContain('Local save failed');
		});
	});

	describe('Subscribe', () => {
		it('exposes subscribe for Svelte store compatibility', () => {
			expect(typeof editorStore.subscribe).toBe('function');

			let callCount = 0;
			const unsubscribe = editorStore.subscribe(() => {
				callCount++;
			});

			// The subscribe is called once immediately
			expect(callCount).toBeGreaterThan(0);

			unsubscribe();
		});
	});

	describe('Pending Changes Queue', () => {
		const mockGame = {
			id: 'test-game-1',
			title: 'Test Game',
			mainTitle: 'Test Game',
			subtitle: null,
			platform: 'PC',
			year: 2024,
			genre: 'Action',
			coOp: 'No' as const,
			status: 'Planned' as const,
			coverImage: 'covers/test.webp',
			playtime: '10h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null
		};

		it('starts with no pending changes', () => {
			expect(editorStore.hasPendingChanges).toBe(false);
			expect(editorStore.pendingChangesCount).toBe(0);
			expect(editorStore.pendingAdds).toEqual([]);
			expect(editorStore.pendingEdits.size).toBe(0);
			expect(editorStore.pendingDeletes.size).toBe(0);
		});

		it('addPendingGame adds game to pending adds', () => {
			editorStore.addPendingGame(mockGame);

			expect(editorStore.hasPendingChanges).toBe(true);
			expect(editorStore.pendingChangesCount).toBe(1);
			expect(editorStore.pendingAdds).toHaveLength(1);
			expect(editorStore.pendingAdds[0].id).toBe('test-game-1');
		});

		it('editPendingGame adds game to pending edits', () => {
			const editedGame = { ...mockGame, title: 'Edited Game' };
			editorStore.editPendingGame(mockGame.id, editedGame);

			expect(editorStore.hasPendingChanges).toBe(true);
			expect(editorStore.pendingEdits.has(mockGame.id)).toBe(true);
			expect(editorStore.pendingEdits.get(mockGame.id)?.title).toBe('Edited Game');
		});

		it('deletePendingGame adds id to pending deletes', () => {
			editorStore.deletePendingGame('existing-game-id');

			expect(editorStore.hasPendingChanges).toBe(true);
			expect(editorStore.pendingDeletes.has('existing-game-id')).toBe(true);
		});

		it('deletePendingGame removes from pending adds if game was pending add', () => {
			editorStore.addPendingGame(mockGame);
			expect(editorStore.pendingAdds).toHaveLength(1);

			editorStore.deletePendingGame(mockGame.id);

			expect(editorStore.pendingAdds).toHaveLength(0);
			expect(editorStore.pendingDeletes.has(mockGame.id)).toBe(false);
		});

		it('discardAllChanges clears all pending changes', () => {
			editorStore.addPendingGame(mockGame);
			editorStore.editPendingGame('another-id', { ...mockGame, id: 'another-id' });
			editorStore.deletePendingGame('delete-id');

			expect(editorStore.hasPendingChanges).toBe(true);

			editorStore.discardAllChanges();

			expect(editorStore.hasPendingChanges).toBe(false);
			expect(editorStore.pendingAdds).toEqual([]);
			expect(editorStore.pendingEdits.size).toBe(0);
			expect(editorStore.pendingDeletes.size).toBe(0);
		});

		it('logout clears pending changes', () => {
			editorStore.addPendingGame(mockGame);
			expect(editorStore.hasPendingChanges).toBe(true);

			editorStore.logout();

			expect(editorStore.hasPendingChanges).toBe(false);
		});

		it('buildFinalGames applies all pending changes correctly', () => {
			const existingGames = [
				{ ...mockGame, id: 'existing-1', title: 'Existing 1' },
				{ ...mockGame, id: 'existing-2', title: 'Existing 2' },
				{ ...mockGame, id: 'existing-3', title: 'Existing 3' }
			];

			// Add a new game
			editorStore.addPendingGame({ ...mockGame, id: 'new-game', title: 'New Game' });

			// Edit existing-1
			editorStore.editPendingGame('existing-1', {
				...mockGame,
				id: 'existing-1',
				title: 'Edited Existing 1'
			});

			// Delete existing-3
			editorStore.deletePendingGame('existing-3');

			const result = editorStore.buildFinalGames(existingGames);

			expect(result).toHaveLength(3); // 3 existing - 1 deleted + 1 added = 3
			expect(result.find((g) => g.id === 'existing-1')?.title).toBe('Edited Existing 1');
			expect(result.find((g) => g.id === 'existing-2')?.title).toBe('Existing 2');
			expect(result.find((g) => g.id === 'existing-3')).toBeUndefined();
			expect(result.find((g) => g.id === 'new-game')?.title).toBe('New Game');
		});
	});

	describe('Session Check', () => {
		it('checkSession returns true when session is valid', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ valid: true })
			});

			editorStore.setEditorModeFromSessionCheck(true);
			const result = await editorStore.checkSession();

			expect(result).toBe(true);
			expect(editorStore.editorMode).toBe(true);
		});

		it('checkSession returns false and disables editor mode when session is invalid', async () => {
			globalThis.fetch = mockFetch({
				ok: true,
				json: () => Promise.resolve({ valid: false })
			});

			editorStore.setEditorModeFromSessionCheck(true);
			const result = await editorStore.checkSession();

			expect(result).toBe(false);
			expect(editorStore.editorMode).toBe(false);
		});

		it('checkSession returns true on network error (assumes session valid)', async () => {
			globalThis.fetch = mockFetchError();

			editorStore.setEditorModeFromSessionCheck(true);
			const result = await editorStore.checkSession();

			expect(result).toBe(true);
		});
	});
});

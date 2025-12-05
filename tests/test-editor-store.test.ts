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

			const buildPayload = () => ({ games: [{ id: '1' }] });
			const result = await editorStore.saveGames(buildPayload);

			expect(result).toBe(true);
			expect(editorStore.saveSuccess).toBe(true);
			expect(editorStore.saveError).toBeNull();
		});

		it('saveGames returns false on failure', async () => {
			globalThis.fetch = mockFetch({
				ok: false,
				text: () => Promise.resolve('Error')
			});

			const buildPayload = () => ({ games: [] });
			const result = await editorStore.saveGames(buildPayload);

			expect(result).toBe(false);
			expect(editorStore.saveError).toBeDefined();
		});

		it('saveGames handles network error', async () => {
			globalThis.fetch = mockFetchError();

			const buildPayload = () => ({ games: [] });
			const result = await editorStore.saveGames(buildPayload);

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
});

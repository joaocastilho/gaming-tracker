import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigator, mockWindow } = vi.hoisted(() => ({
	mockNavigator: { onLine: true },
	mockWindow: { addEventListener: vi.fn(), removeEventListener: vi.fn() }
}));

vi.stubGlobal('navigator', mockNavigator);
vi.stubGlobal('window', mockWindow);

// Mock IndexedDB
vi.mock('$lib/utils/idb', () => ({
	idb: {
		getGames: vi.fn(),
		setGames: vi.fn(),
		getPendingSync: vi.fn(),
		setPendingSync: vi.fn(),
		clearPendingSync: vi.fn()
	}
}));

// Mock browser environment for $app/environment
vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

// Mock editorStore
vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		editorMode: true,
		applyAllChanges: vi.fn(),
		saveGames: vi.fn(),
		discardAllChanges: vi.fn(),
		buildFinalGames: vi.fn()
	}
}));

// Mock gamesStore
vi.mock('$lib/stores/games.svelte', () => ({
	gamesStore: {
		setAllGames: vi.fn()
	}
}));

import { idb } from '$lib/utils/idb';
import { editorStore } from '$lib/stores/editor.svelte';
import { gamesStore } from '$lib/stores/games.svelte';

const mockIdb = vi.mocked(idb);
const mockEditorStore = vi.mocked(editorStore);

describe('Offline Support Logic', () => {
	let offlineStore: any;

	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		mockNavigator.onLine = true;
		// Dynamically import to ensure constructor runs AFTER mocks
		const module = await import('../src/lib/stores/offline.svelte');
		offlineStore = module.offlineStore;
	});

	it('should initialize with correct online status', () => {
		expect(offlineStore.isOnline).toBe(true);
	});

	it('should update online status on window events', () => {
		const onlineHandler = mockWindow.addEventListener.mock.calls.find(
			(call) => call[0] === 'online'
		)[1];
		const offlineHandler = mockWindow.addEventListener.mock.calls.find(
			(call) => call[0] === 'offline'
		)[1];

		offlineHandler();
		expect(offlineStore.isOnline).toBe(false);

		onlineHandler();
		expect(offlineStore.isOnline).toBe(true);
	});

	it('should check for pending sync on initialization', async () => {
		mockIdb.getPendingSync.mockResolvedValueOnce({ games: [] });

		await offlineStore.checkPendingSync();

		expect(mockIdb.getPendingSync).toHaveBeenCalled();
		expect(offlineStore.hasPendingSync).toBe(true);
	});

	it('should try to sync when coming online if there is pending sync', async () => {
		mockIdb.getPendingSync.mockResolvedValueOnce({ games: [{ id: '1', title: 'Test' }] } as any);
		mockEditorStore.saveGames.mockResolvedValueOnce(true);

		const onlineHandler = mockWindow.addEventListener.mock.calls.find(
			(call) => call[0] === 'online'
		)[1];

		await onlineHandler();

		// Note: trySync is called inside onlineHandler
		// Depending on timing/promises, we might need to wait
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockEditorStore.saveGames).toHaveBeenCalled();
		expect(mockIdb.clearPendingSync).toHaveBeenCalled();
		expect(offlineStore.hasPendingSync).toBe(false);
	});
});

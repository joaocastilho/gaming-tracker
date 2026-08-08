import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigator, mockWindow } = vi.hoisted(() => {
	const mockNavigator: { onLine: boolean } = { onLine: true };
	const mockWindow = { addEventListener: vi.fn(), removeEventListener: vi.fn() };
	Object.defineProperty(globalThis, 'navigator', { value: mockNavigator, configurable: true, writable: true });
	Object.defineProperty(globalThis, 'window', { value: mockWindow, configurable: true, writable: true });
	return { mockNavigator, mockWindow };
});

vi.mock('$lib/db', () => ({
	db: {
		games: {
			toArray: vi.fn(),
			bulkPut: vi.fn(),
			clear: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		},
		sync_queue: {
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn(),
		},
	},
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false,
}));

vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		editorMode: true,
		applyAllChanges: vi.fn(),
		saveGames: vi.fn(),
		discardAllChanges: vi.fn(),
		buildFinalGames: vi.fn(),
	},
}));

vi.mock('$lib/stores/games.svelte', () => ({
	gamesStore: {
		setAllGames: vi.fn(),
	},
}));

import { db } from '$lib/db';
import { editorStore } from '$lib/stores/editor.svelte';
import { offlineStore } from '$lib/stores/offline.svelte';

// Cast to Record to avoid complex type mocking issues
const mockDb = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockEditorStore = editorStore as unknown as Record<string, ReturnType<typeof vi.fn>>;

// Capture the handlers the store registered at import time
const addListenerCalls = vi.mocked(mockWindow.addEventListener).mock.calls;
const onlineHandler = addListenerCalls.find((call) => call[0] === 'online')?.[1] as () => Promise<void>;
const offlineHandler = addListenerCalls.find((call) => call[0] === 'offline')?.[1] as () => void;

describe('Offline Support Logic', () => {
	beforeEach(() => {
		mockNavigator.onLine = true;
		vi.mocked(mockDb.sync_queue.get).mockReset();
		vi.mocked(mockDb.sync_queue.delete).mockReset();
		vi.mocked(mockEditorStore.saveGames).mockReset();
		offlineStore.isOnline = true;
		offlineStore.setHasPendingSync(false);
	});

	it('should initialize with correct online status', () => {
		expect(offlineStore.isOnline).toBe(true);
	});

	it('should update online status on window events', () => {
		expect(onlineHandler).toBeDefined();
		expect(offlineHandler).toBeDefined();

		offlineHandler();
		expect(offlineStore.isOnline).toBe(false);

		onlineHandler();
		expect(offlineStore.isOnline).toBe(true);
	});

	it('should check for pending sync on initialization', async () => {
		mockDb.sync_queue.get.mockResolvedValueOnce({ games: [] });

		await offlineStore.checkPendingSync();

		expect(mockDb.sync_queue.get).toHaveBeenCalledWith('pending');
		expect(offlineStore.hasPendingSync).toBe(true);
	});

	it('should try to sync when coming online if there is pending sync', async () => {
		mockDb.sync_queue.get.mockResolvedValueOnce({ games: [{ id: '1', title: 'Test' }] } as unknown);
		mockEditorStore.saveGames.mockResolvedValueOnce(true);

		await onlineHandler();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockEditorStore.saveGames).toHaveBeenCalled();
		expect(mockDb.sync_queue.delete).toHaveBeenCalledWith('pending');
		expect(offlineStore.hasPendingSync).toBe(false);
	});
});

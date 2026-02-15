import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockNavigator, mockWindow } = vi.hoisted(() => ({
	mockNavigator: { onLine: true },
	mockWindow: { addEventListener: vi.fn(), removeEventListener: vi.fn() }
}));

vi.stubGlobal('navigator', mockNavigator);
vi.stubGlobal('window', mockWindow);

vi.mock('$lib/db', () => ({
	db: {
		games: {
			toArray: vi.fn(),
			bulkPut: vi.fn(),
			clear: vi.fn(),
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn()
		},
		sync_queue: {
			get: vi.fn(),
			put: vi.fn(),
			delete: vi.fn()
		}
	}
}));

vi.mock('$app/environment', () => ({
	browser: true,
	dev: false
}));

vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: {
		editorMode: true,
		applyAllChanges: vi.fn(),
		saveGames: vi.fn(),
		discardAllChanges: vi.fn(),
		buildFinalGames: vi.fn()
	}
}));

vi.mock('$lib/stores/games.svelte', () => ({
	gamesStore: {
		setAllGames: vi.fn()
	}
}));

import { db } from '$lib/db';
import { editorStore } from '$lib/stores/editor.svelte';

// Cast to Record to avoid complex type mocking issues
const mockDb = db as unknown as Record<string, Record<string, ReturnType<typeof vi.fn>>>;
const mockEditorStore = editorStore as unknown as Record<string, ReturnType<typeof vi.fn>>;

describe('Offline Support Logic', () => {
	let offlineStore: {
		isOnline: boolean;
		hasPendingSync: boolean;
		checkPendingSync: () => Promise<void>;
	};

	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		mockNavigator.onLine = true;
		const module = await import('../src/lib/stores/offline.svelte');
		offlineStore = module.offlineStore;
	});

	it('should initialize with correct online status', () => {
		expect(offlineStore.isOnline).toBe(true);
	});

	it('should update online status on window events', () => {
		const onlineCall = mockWindow.addEventListener.mock.calls.find((call) => call[0] === 'online');
		const offlineCall = mockWindow.addEventListener.mock.calls.find(
			(call) => call[0] === 'offline'
		);

		expect(onlineCall).toBeDefined();
		expect(offlineCall).toBeDefined();

		const onlineHandler = onlineCall?.[1] as () => void;
		const offlineHandler = offlineCall?.[1] as () => void;

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

		const onlineCall = mockWindow.addEventListener.mock.calls.find((call) => call[0] === 'online');

		expect(onlineCall).toBeDefined();
		const onlineHandler = onlineCall?.[1] as () => Promise<void>;

		await onlineHandler();
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(mockEditorStore.saveGames).toHaveBeenCalled();
		expect(mockDb.sync_queue.delete).toHaveBeenCalledWith('pending');
		expect(offlineStore.hasPendingSync).toBe(false);
	});
});

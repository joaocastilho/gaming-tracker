// @vitest-environment happy-dom
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { editorStore } from '$lib/stores/editor.svelte';
import type { Game } from '$lib/types/game';

// Mock File
class MockFile {
	name: string;
	lastModified: number;
	size: number;
	type: string;
	constructor(_: any[], name: string, options?: any) {
		this.name = name;
		this.lastModified = Date.now();
		this.size = 0;
		this.type = options?.type || '';
	}
}
global.File = MockFile as any;

// Mock FormData
class MockFormData {
	data = new Map<string, any>();
	append(key: string, value: any) {
		this.data.set(key, value);
	}
	get(key: string) {
		return this.data.get(key);
	}
	entries() {
		return this.data.entries();
	}
}
global.FormData = MockFormData as any;

describe('Editor Store Multipart Upload', () => {
	beforeEach(() => {
		editorStore.clearPending();
		vi.resetAllMocks();
	});

	test('saveLocally sends FormData with games and covers', async () => {
		// Mock fetch
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ ok: true })
		});
		global.fetch = fetchMock as any;

		// Create a dummy game
		const gameId = 'test-game-123';
		const newGame: Game = {
			id: gameId,
			title: 'Test Game',
			mainTitle: 'Test Game',
			subtitle: null,
			platform: 'PC',
			genre: 'Action',
			year: 2024,
			status: 'Planned',
			coOp: 'No',
			playtime: '0h 0m',
			finishedDate: null,
			ratingPresentation: null,
			ratingStory: null,
			ratingGameplay: null,
			score: null,
			tier: null,
			coverImage: `covers/${gameId}.webp`
		};

		// Create a mock file
		const mockFile = new File([''], 'cover.png', { type: 'image/png' });

		// Add pending game with file
		editorStore.addPendingGame(newGame, mockFile as any);

		expect(editorStore.hasPendingChanges).toBe(true);
		expect(editorStore.pendingAdds.length).toBe(1);

		// Trigger saveLocally
		// We pass empty array as current games for simplicity
		await editorStore.saveLocally([]);

		expect(fetchMock).toHaveBeenCalledTimes(1);
		const url = fetchMock.mock.calls[0][0];
		const options = fetchMock.mock.calls[0][1];

		expect(url).toBe('/api/games-local');
		expect(options.method).toBe('POST');

		const body = options.body as MockFormData;
		expect(body).toBeInstanceOf(MockFormData);

		// Verify payload
		const gamesJson = body.get('games');
		expect(gamesJson).toBeDefined();
		const parsed = JSON.parse(gamesJson);
		expect(parsed.games).toHaveLength(1);
		expect(parsed.games[0].title).toBe('Test Game');

		// Verify file attached with correct key
		const coverFile = body.get(`cover_${gameId}`);
		expect(coverFile).toBeDefined();
		expect(coverFile.name).toBe('cover.png');
	});
});

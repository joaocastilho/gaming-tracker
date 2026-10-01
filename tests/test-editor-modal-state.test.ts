import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Game } from '$lib/types/game';
import { createTestGame } from './helpers/factories';

const mocks = vi.hoisted(() => ({
	editorStore: {
		buildFinalGames: vi.fn((games: Game[]) => games),
		applyAllChanges: vi.fn(async () => true),
	},
	gamesStore: {
		games: [] as Game[],
		setAllGames: vi.fn(),
	},
}));

vi.mock('$lib/stores/editor.svelte', () => ({
	editorStore: mocks.editorStore,
}));

vi.mock('$lib/stores/games.svelte', () => ({
	gamesStore: mocks.gamesStore,
}));

import { editorModalState } from '$lib/stores/editorModalState.svelte';

describe('editorModalState', () => {
	beforeEach(() => {
		editorModalState.editorModalOpen = false;
		editorModalState.editorModalMode = 'create';
		editorModalState.editorModalGame = null;
		editorModalState.deleteModalOpen = false;
		editorModalState.deleteModalGame = null;
		mocks.gamesStore.games = [];
		vi.clearAllMocks();
	});

	it('starts closed with create mode and no game', () => {
		expect(editorModalState.editorModalOpen).toBe(false);
		expect(editorModalState.editorModalMode).toBe('create');
		expect(editorModalState.editorModalGame).toBeNull();
		expect(editorModalState.deleteModalOpen).toBe(false);
	});

	it('handleAddGame opens the editor in create mode without a game', () => {
		editorModalState.handleAddGame();
		expect(editorModalState.editorModalOpen).toBe(true);
		expect(editorModalState.editorModalMode).toBe('create');
		expect(editorModalState.editorModalGame).toBeNull();
	});

	it('handleEditGame opens the editor in edit mode with the game', () => {
		const game = createTestGame();
		editorModalState.handleEditGame(game);
		expect(editorModalState.editorModalOpen).toBe(true);
		expect(editorModalState.editorModalMode).toBe('edit');
		expect(editorModalState.editorModalGame?.id).toBe(game.id);
	});

	it('handleDeleteGame opens the delete modal with the game', () => {
		const game = createTestGame();
		editorModalState.handleDeleteGame(game);
		expect(editorModalState.deleteModalOpen).toBe(true);
		expect(editorModalState.deleteModalGame?.id).toBe(game.id);
		expect(editorModalState.editorModalOpen).toBe(false);
	});

	it('handleEditorClose closes the editor and clears the game', () => {
		editorModalState.handleEditGame(createTestGame());
		editorModalState.handleEditorClose();
		expect(editorModalState.editorModalOpen).toBe(false);
		expect(editorModalState.editorModalGame).toBeNull();
	});

	it('handleApplyChanges delegates freshness and store update to applyAllChanges', async () => {
		const games = [createTestGame({ id: 'a' }), createTestGame({ id: 'b' })];
		mocks.gamesStore.games = games;
		mocks.editorStore.applyAllChanges.mockResolvedValue(true);

		await editorModalState.handleApplyChanges();

		expect(mocks.editorStore.applyAllChanges).toHaveBeenCalledWith(games);
		// handleApplyChanges must not overwrite the store with a stale base:
		// applyAllChanges fetches latest server data and updates the store itself.
		expect(mocks.gamesStore.setAllGames).not.toHaveBeenCalled();
	});
});

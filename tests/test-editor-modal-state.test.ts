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

	it('handleApplyChanges applies changes and updates games on success', async () => {
		const games = [createTestGame({ id: 'a' }), createTestGame({ id: 'b' })];
		mocks.gamesStore.games = games;
		const finalGames = [createTestGame({ id: 'a' })];
		mocks.editorStore.buildFinalGames.mockReturnValue(finalGames);
		mocks.editorStore.applyAllChanges.mockResolvedValue(true);

		await editorModalState.handleApplyChanges();

		expect(mocks.editorStore.buildFinalGames).toHaveBeenCalledWith(games);
		expect(mocks.editorStore.applyAllChanges).toHaveBeenCalledWith(games);
		expect(mocks.gamesStore.setAllGames).toHaveBeenCalledWith(finalGames);
	});

	it('does not update games when applyAllChanges fails', async () => {
		mocks.gamesStore.games = [createTestGame({ id: 'a' })];
		mocks.editorStore.applyAllChanges.mockResolvedValue(false);

		await editorModalState.handleApplyChanges();

		expect(mocks.gamesStore.setAllGames).not.toHaveBeenCalled();
	});
});

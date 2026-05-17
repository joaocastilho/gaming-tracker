import type { Game } from '$lib/types/game.js';
import { editorStore } from './editor.svelte';
import { gamesStore } from './games.svelte';

class EditorModalState {
	editorModalOpen = $state(false);
	editorModalMode = $state<'create' | 'edit'>('create');
	editorModalGame = $state<Game | null>(null);
	deleteModalOpen = $state(false);
	deleteModalGame = $state<Game | null>(null);

	handleAddGame(): void {
		this.editorModalMode = 'create';
		this.editorModalGame = null;
		this.editorModalOpen = true;
	}

	handleEditGame(game: Game): void {
		this.editorModalMode = 'edit';
		this.editorModalGame = game;
		this.editorModalOpen = true;
	}

	handleDeleteGame(game: Game): void {
		this.deleteModalGame = game;
		this.deleteModalOpen = true;
	}

	handleEditorClose(): void {
		this.editorModalOpen = false;
		this.editorModalGame = null;
	}

	async handleApplyChanges(): Promise<void> {
		const games = gamesStore.games;
		const finalGames = editorStore.buildFinalGames(games);

		const success = await editorStore.applyAllChanges(games);
		if (success) {
			gamesStore.setAllGames(finalGames);
		}
	}
}

export const editorModalState = new EditorModalState();

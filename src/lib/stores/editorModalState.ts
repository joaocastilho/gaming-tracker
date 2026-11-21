import type { Game } from '#lib/types/game.js';
import { editorStore } from './editor.js';
import { gamesStore } from './games.js';
import { createSyncSignal } from './signalHelpers.js';

class EditorModalState {
	private _editorModalOpen = createSyncSignal<boolean>(false);
	private _editorModalMode = createSyncSignal<'create' | 'edit'>('create');
	private _editorModalGame = createSyncSignal<Game | null>(null);
	private _deleteModalOpen = createSyncSignal<boolean>(false);
	private _deleteModalGame = createSyncSignal<Game | null>(null);

	get editorModalOpen(): boolean {
		return this._editorModalOpen.get();
	}

	set editorModalOpen(value: boolean) {
		this._editorModalOpen.set(value);
	}

	get editorModalMode(): 'create' | 'edit' {
		return this._editorModalMode.get();
	}

	set editorModalMode(value: 'create' | 'edit') {
		this._editorModalMode.set(value);
	}

	get editorModalGame(): Game | null {
		return this._editorModalGame.get();
	}

	set editorModalGame(value: Game | null) {
		this._editorModalGame.set(value);
	}

	get deleteModalOpen(): boolean {
		return this._deleteModalOpen.get();
	}

	set deleteModalOpen(value: boolean) {
		this._deleteModalOpen.set(value);
	}

	get deleteModalGame(): Game | null {
		return this._deleteModalGame.get();
	}

	set deleteModalGame(value: Game | null) {
		this._deleteModalGame.set(value);
	}

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

		// applyAllChanges fetches the latest server data and updates the store
		// itself on success, so the caller must not overwrite it with a stale base.
		await editorStore.applyAllChanges(games);
	}
}

export const editorModalState = new EditorModalState();

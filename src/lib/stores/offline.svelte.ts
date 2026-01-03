import { browser } from '$app/environment';
import { idb } from '$lib/utils/idb';
import { editorStore } from './editor.svelte';
import { gamesStore } from './games.svelte';

class OfflineStore {
	isOnline = $state(true);
	hasPendingSync = $state(false);
	isSyncing = $state(false);

	constructor() {
		if (browser) {
			this.isOnline = navigator.onLine;

			window.addEventListener('online', () => {
				this.isOnline = true;
				this.trySync();
			});

			window.addEventListener('offline', () => {
				this.isOnline = false;
			});

			// Check for pending sync on load
			this.checkPendingSync();
		}
	}

	async checkPendingSync() {
		const pending = await idb.getPendingSync();
		this.hasPendingSync = !!pending;

		if (this.hasPendingSync && this.isOnline) {
			this.trySync();
		}
	}

	async trySync() {
		if (this.isSyncing || !this.isOnline) return;

		const pending = await idb.getPendingSync();
		if (!pending) {
			this.hasPendingSync = false;
			return;
		}

		// Only sync if logged in (editor mode)
		if (!editorStore.editorMode) {
			return;
		}

		this.isSyncing = true;
		try {
			// We use applyAllChanges but it needs the current games to build the final payload
			// However, the pending sync ALREADY contains the final payload from when it was saved offline
			// So we need a way to just push that payload
			const success = await editorStore.saveGames(() => pending);

			if (success) {
				await idb.clearPendingSync();
				this.hasPendingSync = false;
				// Update local games store with the synced data to be sure
				gamesStore.setAllGames(pending.games);
				// Also update games in IDB
				await idb.setGames(pending.games);
			}
		} catch (error) {
			console.error('Failed to sync offline changes:', error);
		} finally {
			this.isSyncing = false;
		}
	}

	setHasPendingSync(value: boolean) {
		this.hasPendingSync = value;
	}
}

export const offlineStore = new OfflineStore();

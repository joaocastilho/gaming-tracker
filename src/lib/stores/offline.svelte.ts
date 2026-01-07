import { browser } from '$app/environment';
import { db } from '$lib/db';
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

			this.checkPendingSync();
		}
	}

	async checkPendingSync() {
		const pending = await db.sync_queue.get('pending');
		this.hasPendingSync = !!pending;

		if (this.hasPendingSync && this.isOnline) {
			this.trySync();
		}
	}

	async trySync() {
		if (this.isSyncing || !this.isOnline) return;

		const pending = await db.sync_queue.get('pending');
		if (!pending) {
			this.hasPendingSync = false;
			return;
		}

		if (!editorStore.editorMode) {
			return;
		}

		this.isSyncing = true;
		try {
			const success = await editorStore.saveGames(() => pending);

			if (success) {
				await db.sync_queue.delete('pending');
				this.hasPendingSync = false;
				gamesStore.setAllGames(pending.games);
				await db.games.clear();
				await db.games.bulkPut(pending.games);
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

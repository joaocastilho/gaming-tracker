import { browser } from '$app/env';
import { editorStore } from './editor.svelte';
import { gamesStore } from './games.svelte';

const DB_SEEDED_KEY = 'gaming-tracker-db-seeded';
const EDITOR_SESSION_KEY = 'gaming-tracker-editor-mode';

class OfflineStore {
	isOnline = $state(true);
	hasPendingSync = $state(false);
	isSyncing = $state(false);

	constructor() {
		if (browser) {
			this.isOnline = navigator.onLine;

			$effect.root(() => {
				$effect(() => {
					const onOnline = () => {
						this.isOnline = true;
						this.trySync();
					};
					const onOffline = () => {
						this.isOnline = false;
					};
					window.addEventListener('online', onOnline);
					window.addEventListener('offline', onOffline);
					return () => {
						window.removeEventListener('online', onOnline);
						window.removeEventListener('offline', onOffline);
					};
				});
			});

			// Only load Dexie on startup if the user has an existing local DB or
			// an active editor session, keeping the 74 KiB Dexie chunk off the
			// initial critical path for cold visits.
			let shouldCheckSync = false;
			try {
				shouldCheckSync =
					localStorage.getItem(DB_SEEDED_KEY) === '1' || sessionStorage.getItem(EDITOR_SESSION_KEY) === 'true';
			} catch {
				shouldCheckSync = false;
			}
			if (shouldCheckSync) {
				void this.checkPendingSync();
			}
		}
	}

	async checkPendingSync() {
		const { db } = await import('#lib/db.js');
		const pending = await db.sync_queue.get('pending');
		this.hasPendingSync = !!pending;

		if (this.hasPendingSync && this.isOnline) {
			this.trySync();
		}
	}

	async trySync() {
		if (this.isSyncing || !this.isOnline) return;

		const { db } = await import('#lib/db.js');
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

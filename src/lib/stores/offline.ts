import { createEffect, createRoot, runWithOwner } from 'solid-js';
import { browser } from '#lib/utils/env.js';
import { editorStore } from './editor.js';
import { gamesStore } from './games.js';
import { createSyncSignal } from './signalHelpers.js';

const DB_SEEDED_KEY = 'gaming-tracker-db-seeded';
const EDITOR_SESSION_KEY = 'gaming-tracker-editor-mode';

class OfflineStore {
	private _isOnline = createSyncSignal<boolean>(true);
	private _hasPendingSync = createSyncSignal<boolean>(false);
	private _isSyncing = createSyncSignal<boolean>(false);

	constructor() {
		if (browser) {
			this.isOnline = navigator.onLine;

			runWithOwner(null, () => {
				createRoot(() => {
					createEffect(
						() => browser,
						() => {
							const onOnline = () => {
								this.isOnline = true;
								void this.trySync();
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
						}
					);
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

	get isOnline(): boolean {
		return this._isOnline.get();
	}

	set isOnline(value: boolean) {
		this._isOnline.set(value);
	}

	get hasPendingSync(): boolean {
		return this._hasPendingSync.get();
	}

	set hasPendingSync(value: boolean) {
		this._hasPendingSync.set(value);
	}

	get isSyncing(): boolean {
		return this._isSyncing.get();
	}

	set isSyncing(value: boolean) {
		this._isSyncing.set(value);
	}

	async checkPendingSync(): Promise<void> {
		const { db } = await import('#lib/db.js');
		const pending = await db.sync_queue.get('pending');
		this.hasPendingSync = !!pending;

		if (this.hasPendingSync && this.isOnline) {
			void this.trySync();
		}
	}

	async trySync(): Promise<void> {
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

	setHasPendingSync(value: boolean): void {
		this.hasPendingSync = value;
	}
}

export const offlineStore = new OfflineStore();

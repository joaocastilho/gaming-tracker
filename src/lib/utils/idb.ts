import type { Game } from '$lib/types/game';

const DB_NAME = 'gaming-tracker-db';
const DB_VERSION = 1;

const STORES = {
	GAMES: 'games',
	SYNC_QUEUE: 'sync_queue'
} as const;

export class IndexedDBWrapper {
	private db: IDBDatabase | null = null;

	async open(): Promise<IDBDatabase> {
		if (this.db) return this.db;
		if (typeof indexedDB === 'undefined') {
			return Promise.reject(new Error('IndexedDB is not supported in this environment'));
		}

		return new Promise((resolve, reject) => {
			try {
				const request = indexedDB.open(DB_NAME, DB_VERSION);

				request.onerror = () => reject(request.error);
				request.onsuccess = () => {
					this.db = request.result;
					resolve(request.result);
				};

				request.onupgradeneeded = (event) => {
					const db = (event.target as IDBOpenDBRequest).result;

					// Store for the full list of games
					if (!db.objectStoreNames.contains(STORES.GAMES)) {
						db.createObjectStore(STORES.GAMES);
					}

					// Store for pending synchronization (only one entry usually)
					if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
						db.createObjectStore(STORES.SYNC_QUEUE);
					}
				};
			} catch (err) {
				reject(err);
			}
		});
	}

	async setGames(games: Game[]): Promise<void> {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORES.GAMES, 'readwrite');
			const store = transaction.objectStore(STORES.GAMES);

			const request = store.put(games, 'latest');

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getGames(): Promise<Game[] | null> {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORES.GAMES, 'readonly');
			const store = transaction.objectStore(STORES.GAMES);
			const request = store.get('latest');

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || null);
		});
	}

	async setPendingSync(payload: { games: Game[] }): Promise<void> {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
			const store = transaction.objectStore(STORES.SYNC_QUEUE);
			const request = store.put(payload, 'pending');

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getPendingSync(): Promise<{ games: Game[] } | null> {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORES.SYNC_QUEUE, 'readonly');
			const store = transaction.objectStore(STORES.SYNC_QUEUE);
			const request = store.get('pending');

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || null);
		});
	}

	async clearPendingSync(): Promise<void> {
		const db = await this.open();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(STORES.SYNC_QUEUE, 'readwrite');
			const store = transaction.objectStore(STORES.SYNC_QUEUE);
			const request = store.delete('pending');

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}
}

export const idb = new IndexedDBWrapper();

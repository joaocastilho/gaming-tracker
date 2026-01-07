import Dexie, { type Table } from 'dexie';
import type { Game } from '$lib/types/game';

export interface SyncPayload {
	games: Game[];
}

export class GamingTrackerDB extends Dexie {
	games!: Table<Game>;
	sync_queue!: Table<SyncPayload, string>;

	constructor() {
		super('gaming-tracker');
		this.version(1).stores({
			games: 'id, status, genre, platform, tier, finishedDate, score, year',
			sync_queue: ''
		});
	}
}

export const db = new GamingTrackerDB();

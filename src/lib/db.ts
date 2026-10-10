import Dexie, { type Table } from 'dexie';
import type { Game } from '#lib/types/game.js';

export interface SyncPayload {
	games: Game[];
}

export interface MetaEntry {
	key: string;
	value: string;
}

export class GamingTrackerDB extends Dexie {
	games!: Table<Game>;
	sync_queue!: Table<SyncPayload, string>;
	meta!: Table<MetaEntry, string>;

	constructor() {
		super('gaming-tracker');
		this.version(1).stores({
			games: 'id, status, genre, platform, tier, finishedDate, score, year',
			sync_queue: '',
		});
		this.version(2).stores({
			meta: 'key',
		});
	}
}

export const db = new GamingTrackerDB();

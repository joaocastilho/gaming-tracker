import type { Game, CoOpStatus } from '$lib/types/game';

interface RawGameData extends Record<string, unknown> {
	title?: string;
	id?: string;
	finishedDate?: string;
	hoursPlayed?: number | string;
	timeToBeat?: string;
	coOp?: CoOpStatus;
}

export function transformGameData(game: Record<string, unknown>): Game {
	// Work with the raw data that may have temporary fields
	const data = game as RawGameData;

	// Build up the Game object with proper typing
	const gameData: Partial<Game> = { ...data };

	// Ensure id is set
	if (!gameData.id) {
		if (data.title) {
			gameData.id = generateDeterministicUUID(data.title);
		} else {
			gameData.id = crypto.randomUUID();
		}
	}

	// Convert date format if needed
	if (data.finishedDate && !isValidISODateTime(data.finishedDate)) {
		const dateMatch = data.finishedDate.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (dateMatch) {
			const [, day, month, year] = dateMatch;
			gameData.finishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
		}
	}

	// Handle playtime conversion from hoursPlayed
	if (data.hoursPlayed !== undefined) {
		if (typeof data.hoursPlayed === 'number') {
			const hours = Math.floor(data.hoursPlayed);
			const minutes = Math.round((data.hoursPlayed - hours) * 60);
			gameData.playtime = `${hours}h ${minutes}m`;
		} else if (typeof data.hoursPlayed === 'string') {
			gameData.playtime = data.hoursPlayed;
		}
	} else if (data.timeToBeat) {
		gameData.playtime = data.timeToBeat;
	}

	// Ensure coOp has a default value
	if (!gameData.coOp) {
		gameData.coOp = 'No';
	}

	// Parse title into mainTitle and subtitle
	if (data.title) {
		const titleMatch = data.title.match(/^(.+?)\s*\(([^)]+)\)\s*$/);

		if (titleMatch) {
			gameData.mainTitle = titleMatch[1].trim();
			gameData.subtitle = `(${titleMatch[2]})`;
		} else {
			gameData.mainTitle = data.title;
			gameData.subtitle = null;
		}
	} else {
		gameData.mainTitle = '';
		gameData.subtitle = null;
	}

	// Cast to Game type - the transformation above should have populated all required fields
	return gameData as Game;
}

function isValidISODateTime(dateString: string): boolean {
	const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
	return isoDateTimeRegex.test(dateString);
}

function generateDeterministicUUID(seed: string): string {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}

	const hex = Math.abs(hash).toString(16).padStart(8, '0');
	const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-1${hex.slice(4, 7)}-${Math.abs(hash % 16).toString(16)}${Math.abs(hash % 16).toString(16)}${hex.slice(0, 2)}-${Math.abs(hash).toString(16).padEnd(12, '0').slice(0, 12)}`;

	return uuid;
}

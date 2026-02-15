import type { Game } from '$lib/types/game';

export function transformGameData(game: Record<string, unknown>): Game {
	const transformed: Record<string, unknown> = { ...game };

	if (!transformed.id) {
		if (transformed.title) {
			transformed.id = generateDeterministicUUID(String(transformed.title));
		} else {
			transformed.id = crypto.randomUUID();
		}
	}

	if (transformed.finishedDate && !isValidISODateTime(String(transformed.finishedDate))) {
		const dateStr = String(transformed.finishedDate);
		const dateMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (dateMatch) {
			const [, day, month, year] = dateMatch;
			transformed.finishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
		}
	}

	if (transformed.hoursPlayed && typeof transformed.hoursPlayed === 'number') {
		const hours = Math.floor(transformed.hoursPlayed);
		const minutes = Math.round((transformed.hoursPlayed - hours) * 60);
		transformed.playtime = `${hours}h ${minutes}m`;
	} else if (transformed.hoursPlayed && typeof transformed.hoursPlayed === 'string') {
		transformed.playtime = transformed.hoursPlayed;
	} else if (transformed.timeToBeat) {
		transformed.playtime = transformed.timeToBeat;
	}
	delete transformed.hoursPlayed;
	delete transformed.timeToBeat;

	if (!transformed.coOp) {
		transformed.coOp = 'No';
	}

	if (transformed.title) {
		const titleStr = String(transformed.title);
		const titleMatch = titleStr.match(/^(.+?)\s*\(([^)]+)\)\s*$/);

		if (titleMatch) {
			transformed.mainTitle = titleMatch[1].trim();
			transformed.subtitle = `(${titleMatch[2]})`;
		} else {
			transformed.mainTitle = titleStr;
			transformed.subtitle = null;
		}
	} else {
		transformed.mainTitle = '';
		transformed.subtitle = null;
	}

	return transformed as unknown as Game;
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

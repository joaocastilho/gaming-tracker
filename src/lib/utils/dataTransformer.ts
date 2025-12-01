export function transformGameData(game: Record<string, unknown>): Record<string, unknown> {
	const transformed = { ...game };

	// Ensure ID exists. If valid UUID exists, keep it.
	// If title exists, generate deterministic UUID.
	// Otherwise, generate random UUID to prevent duplicate key errors.
	if (!transformed.id || !isValidUUID(String(transformed.id))) {
		if (transformed.title) {
			transformed.id = generateDeterministicUUID(String(transformed.title));
		} else {
			transformed.id = crypto.randomUUID();
		}
	}

	// Only process date if it exists and is not already in ISO format
	if (transformed.finishedDate && !isValidISODateTime(String(transformed.finishedDate))) {
		const dateStr = String(transformed.finishedDate);
		const dateMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (dateMatch) {
			const [, day, month, year] = dateMatch;
			transformed.finishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
		}
	}

	// Only format hours if it's a number
	if (transformed.hoursPlayed && typeof transformed.hoursPlayed === 'number') {
		const hours = Math.floor(transformed.hoursPlayed);
		const minutes = Math.round((transformed.hoursPlayed - hours) * 60);
		transformed.hoursPlayed = `${hours}h ${minutes}m`;
	}

	// Set default coOp value only if it doesn't exist
	if (!transformed.coOp) {
		transformed.coOp = 'No';
	}

	// Only process title if it exists
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

	return transformed;
}

function isValidUUID(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
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

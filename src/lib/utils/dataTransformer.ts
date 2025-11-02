/**
 * Transform sample game data to match validation schema requirements
 */
export function transformGameData(game: Record<string, unknown>): Record<string, unknown> {
	const transformed = { ...game };

	// Transform ID: Convert simple strings to proper UUIDs
	if (!transformed.id || !isValidUUID(String(transformed.id))) {
		// For sample data, generate deterministic UUIDs based on title
		transformed.id = generateDeterministicUUID(String(transformed.title));
	}

	// Transform finishedDate: Convert simple date strings to ISO datetime format
	if (transformed.finishedDate && !isValidISODateTime(String(transformed.finishedDate))) {
		// Add time component if missing
		transformed.finishedDate = `${transformed.finishedDate}T00:00:00.000Z`;
	}

	return transformed;
}

/**
 * Check if a string is a valid UUID v4
 */
function isValidUUID(id: string): boolean {
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	return uuidRegex.test(id);
}

/**
 * Check if a string is a valid ISO datetime
 */
function isValidISODateTime(dateString: string): boolean {
	const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;
	return isoDateTimeRegex.test(dateString);
}

/**
 * Generate a deterministic UUID based on input string
 * This ensures the same game always gets the same UUID
 */
function generateDeterministicUUID(seed: string): string {
	// Simple hash function to generate consistent seed
	let hash = 0;
	for (let i = 0; i < seed.length; i++) {
		const char = seed.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Use the hash to generate UUID-like format
	const hex = Math.abs(hash).toString(16).padStart(8, '0');
	const uuid = `${hex.slice(0, 8)}-${hex.slice(0, 4)}-1${hex.slice(4, 7)}-${Math.abs(hash % 16).toString(16)}${Math.abs(hash % 16).toString(16)}${hex.slice(0, 2)}-${Math.abs(hash).toString(16).padEnd(12, '0').slice(0, 12)}`;

	return uuid;
}

/**
 * Transform array of games
 */
export function transformGamesData(games: Record<string, unknown>[]): Record<string, unknown>[] {
	return games.map(transformGameData);
}

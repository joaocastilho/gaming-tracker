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
		// Convert DD/MM/YYYY to YYYY-MM-DDTHH:mm:ss.sssZ
		const dateStr = String(transformed.finishedDate);
		const dateMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if (dateMatch) {
			const [, day, month, year] = dateMatch;
			transformed.finishedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`;
		}
	}

	// Transform hoursPlayed: Convert numbers to "Xh Ym" format
	if (transformed.hoursPlayed && typeof transformed.hoursPlayed === 'number') {
		const hours = Math.floor(transformed.hoursPlayed);
		const minutes = Math.round((transformed.hoursPlayed - hours) * 60);
		transformed.hoursPlayed = `${hours}h ${minutes}m`;
	}

	// Transform tier: Extract just the letter from "X - Description" format
	if (transformed.tier && typeof transformed.tier === 'string') {
		const tierMatch = transformed.tier.match(/^([SABCDE])\s*-\s*.+$/);
		if (tierMatch) {
			transformed.tier = tierMatch[1];
		}
	}

	// Ensure coOp field exists with default value
	if (!transformed.coOp) {
		transformed.coOp = 'No';
	}

	// Pre-compute title parts
	if (transformed.title) {
		const titleMatch = String(transformed.title).match(/^(.+?)\s*\(([^)]+)\)\s*$/);
		if (titleMatch) {
			transformed.mainTitle = titleMatch[1].trim();
			transformed.subtitle = `(${titleMatch[2]})`;
		} else {
			transformed.mainTitle = String(transformed.title);
			transformed.subtitle = null;
		}
	} else {
		transformed.mainTitle = '';
		transformed.subtitle = null;
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

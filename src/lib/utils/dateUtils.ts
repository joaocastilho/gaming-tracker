export function parseDate(dateStr: string | null): number | null {
	if (!dateStr) return null;

	// Normalize separators to spaces for easier parsing
	const normalized = dateStr.replace(/[/\-.,]/g, ' ').trim();

	// 1. Try parsing DD MM YYYY (numeric)
	// Matches: 12 05 2023, 12/05/2023, 12-05-2023
	const numericParts = normalized.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/);
	if (numericParts) {
		const day = parseInt(numericParts[1], 10);
		const month = parseInt(numericParts[2], 10) - 1; // Months are 0-indexed
		const year = parseInt(numericParts[3], 10);
		const date = new Date(year, month, day);
		// Validate date (e.g. ensure 31/02/2023 doesn't wrap to March)
		if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
			return date.getTime();
		}
	}

	// 2. Try parsing DD Month YYYY (textual)
	// Matches: 12 Jan 2023, 12 January 2023
	const textParts = normalized.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
	if (textParts) {
		const day = parseInt(textParts[1], 10);
		const monthStr = textParts[2].toLowerCase();
		const year = parseInt(textParts[3], 10);

		const months = [
			'jan',
			'feb',
			'mar',
			'apr',
			'may',
			'jun',
			'jul',
			'aug',
			'sep',
			'oct',
			'nov',
			'dec'
		];
		// Check against first 3 chars of month name
		const monthIndex = months.findIndex((m) => monthStr.startsWith(m));

		if (monthIndex !== -1) {
			const date = new Date(year, monthIndex, day);
			if (date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day) {
				return date.getTime();
			}
		}
	}

	// 3. Fallback to ISO parsing (YYYY-MM-DD) or other browser-supported formats
	// We only trust this if it looks like ISO to avoid the US/UK format ambiguity of "01/02/2023"
	if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
		const timestamp = new Date(dateStr).getTime();
		if (!isNaN(timestamp)) return timestamp;
	}

	return null;
}

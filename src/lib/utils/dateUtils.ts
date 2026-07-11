export function parseDate(dateStr: string | null): number | null {
	if (!dateStr) return null;

	const normalized = dateStr.replace(/[/\-.,]/g, ' ').trim();
	const numericParts = normalized.match(/^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/);
	if (numericParts) {
		const day = parseInt(numericParts[1], 10);
		const month = parseInt(numericParts[2], 10) - 1;
		const year = parseInt(numericParts[3], 10);
		const date = new Date(year, month, day);
		if (date.getFullYear() === year && date.getMonth() === month && date.getDate() === day) {
			return date.getTime();
		}
	}

	const textParts = normalized.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
	if (textParts) {
		const day = parseInt(textParts[1], 10);
		const monthStr = textParts[2].toLowerCase();
		const year = parseInt(textParts[3], 10);

		const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
		const monthIndex = months.findIndex((m) => monthStr.startsWith(m));

		if (monthIndex !== -1) {
			const date = new Date(year, monthIndex, day);
			if (date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day) {
				return date.getTime();
			}
		}
	}

	if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
		const timestamp = new Date(dateStr).getTime();
		if (!Number.isNaN(timestamp)) return timestamp;
	}

	return null;
}

export function parseToDate(dateStr: string | null): Date | null {
	const timestamp = parseDate(dateStr);
	if (timestamp === null) return null;
	return new Date(timestamp);
}

const DEFAULT_LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'en-US';

export function formatDate(dateStr: string | null): string {
	const date = parseToDate(dateStr);
	if (!date) return 'Unknown';
	return date.toLocaleDateString(DEFAULT_LOCALE, {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export function formatShortDate(dateStr: string | null): string {
	const date = parseToDate(dateStr);
	if (!date) return 'Unknown';
	return date.toLocaleDateString(DEFAULT_LOCALE, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function formatMobileDate(dateStr: string | null): string {
	const date = parseToDate(dateStr);
	if (!date) return 'Unknown';
	const month = (date.getMonth() + 1).toString().padStart(2, '0');
	const day = date.getDate().toString().padStart(2, '0');
	const year = date.getFullYear().toString().slice(-2);
	return `${day}/${month}/${year}`;
}

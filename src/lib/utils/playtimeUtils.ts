export function parsePlaytimeToMinutes(playtime: string | null | undefined): number {
	if (!playtime) return 0;
	const match = playtime.match(/^(\d+)h\s*(\d+)m$/);
	if (!match) return 0;
	return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

export function formatMinutes(minutes: number): string {
	if (minutes === 0) return '0h';
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	if (hours === 0) return `${mins}m`;
	if (mins === 0) return `${hours}h`;
	return `${hours}h ${mins}m`;
}

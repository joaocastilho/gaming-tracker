import type { Game } from '#lib/types/game.js';

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

export function computeTotalPlaytimeMinutes(games: Game[]): number {
	return games.reduce((sum, game) => sum + parsePlaytimeToMinutes(game.playtime), 0);
}

function playtimesWithMinutes(games: Game[]): number[] {
	return games.map((game) => parsePlaytimeToMinutes(game.playtime)).filter((minutes) => minutes > 0);
}

export function computeAveragePlaytimeMinutes(games: Game[]): number {
	const playtimes = playtimesWithMinutes(games);
	if (playtimes.length === 0) return 0;
	const total = playtimes.reduce((sum, minutes) => sum + minutes, 0);
	return Math.round(total / playtimes.length);
}

export function computeMedianPlaytimeMinutes(games: Game[]): number {
	const sorted = playtimesWithMinutes(games).toSorted((a, b) => a - b);
	if (sorted.length === 0) return 0;
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 === 0 ? Math.round((sorted[mid - 1] + sorted[mid]) / 2) : sorted[mid];
}

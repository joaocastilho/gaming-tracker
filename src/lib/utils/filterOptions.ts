import type { Game } from '$lib/types/game';
import { COOP_COLORS, GENRE_COLORS, PLATFORM_COLORS, TIER_COLORS } from './colorConstants.js';
import { getTierDisplayName } from './tierUtils';

export function getPlatformColor(platform: string): string {
	return PLATFORM_COLORS[platform] || 'bg-gray-600 text-white';
}

export function getGenreColor(genre: string): string {
	return GENRE_COLORS[genre] || 'bg-gray-600 text-white';
}

export function getTierColor(tier: string): string {
	const fullTierName = getTierDisplayName(tier);
	return TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
}

export function getCoOpColor(coOp: string): string {
	return COOP_COLORS[coOp] || 'bg-gray-600 text-white';
}

const TIER_ORDER = [
	'S - Masterpiece',
	'A - Amazing',
	'B - Great',
	'C - Good',
	'D - Decent',
	'E - Bad'
];

export function extractFilterOptions(games: Game[]): {
	platforms: string[];
	genres: string[];
	tiers: string[];
	coOp: string[];
} {
	// Return empty arrays if no games to avoid blocking
	if (!games || games.length === 0) {
		return {
			platforms: [],
			genres: [],
			tiers: [],
			coOp: []
		};
	}

	const platforms = new Set<string>();
	const genres = new Set<string>();
	const tiers = new Set<string>();
	const coOp = new Set<string>();

	// Use for...of loop instead of forEach for better performance with large arrays
	for (const game of games) {
		if (game.platform) platforms.add(game.platform);
		if (game.genre) genres.add(game.genre);
		if (game.tier) tiers.add(getTierDisplayName(game.tier));
		if (game.coOp) coOp.add(game.coOp);
	}

	return {
		platforms: Array.from(platforms).toSorted(),
		genres: Array.from(genres).toSorted(),
		tiers: Array.from(tiers).toSorted((a, b) => {
			return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
		}),
		coOp: Array.from(coOp).toSorted().toReversed() // 'Yes' before 'No'
	};
}

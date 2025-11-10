import type { Game } from '$lib/types/game';
import {
	PLATFORM_COLORS,
	GENRE_COLORS,
	TIER_COLORS,
	getTierDisplayName
} from './colorConstants.js';

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
} {
	// Return empty arrays if no games to avoid blocking
	if (!games || games.length === 0) {
		return {
			platforms: [],
			genres: [],
			tiers: []
		};
	}

	const platforms = new Set<string>();
	const genres = new Set<string>();
	const tiers = new Set<string>();

	// Use for...of loop instead of forEach for better performance with large arrays
	for (const game of games) {
		if (game.platform) platforms.add(game.platform);
		if (game.genre) genres.add(game.genre);
		if (game.tier) tiers.add(getTierDisplayName(game.tier));
	}

	return {
		platforms: Array.from(platforms).sort(),
		genres: Array.from(genres).sort(),
		tiers: Array.from(tiers).sort((a, b) => {
			return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
		})
	};
}

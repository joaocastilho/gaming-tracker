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
	// Convert tier letter to full display name before looking up color
	const fullTierName = getTierDisplayName(tier);
	return TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
}

// Define the correct tier order
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
	const platforms = new Set<string>();
	const genres = new Set<string>();
	const tiers = new Set<string>();

	games.forEach((game) => {
		if (game.platform) platforms.add(game.platform);
		if (game.genre) genres.add(game.genre);
		if (game.tier) tiers.add(getTierDisplayName(game.tier)); // Convert to full name for filtering
	});

	return {
		platforms: Array.from(platforms).sort(),
		genres: Array.from(genres).sort(),
		tiers: Array.from(tiers).sort((a, b) => {
			// Sort tiers by the predefined order instead of alphabetically
			return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
		})
	};
}

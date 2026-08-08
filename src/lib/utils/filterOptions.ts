import type { Game } from '$lib/types/game';
import { COOP_COLORS, GENRE_COLORS, PLATFORM_COLORS } from './colorConstants.js';
import { getTierClass, getTierDisplayName, TIER_ORDER } from './tierUtils';

export function getPlatformColor(platform: string): string {
	const colorClass = PLATFORM_COLORS[platform] || 'bg-gray-600 text-white';
	if (colorClass.startsWith('platform-')) {
		return `${colorClass}-badge`;
	}
	return colorClass;
}

export function getGenreColor(genre: string): string {
	const colorClass = GENRE_COLORS[genre] || 'bg-gray-600 text-white';
	if (colorClass.startsWith('genre-')) {
		return `${colorClass}-badge`;
	}
	return colorClass;
}

export function getTierColor(tier: string): string {
	const baseClass = getTierClass(tier);
	if (baseClass.startsWith('tier-')) {
		return `tier-badge ${baseClass}`;
	}
	return baseClass;
}

export function getCoOpColor(coOp: string): string {
	return COOP_COLORS[coOp] || 'bg-gray-600 text-white';
}

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
			coOp: [],
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
			const order = TIER_ORDER as readonly string[];
			return order.indexOf(a) - order.indexOf(b);
		}),
		coOp: Array.from(coOp).toSorted().toReversed(), // 'Yes' before 'No'
	};
}

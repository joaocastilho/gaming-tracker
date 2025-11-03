// Filter utilities for color coding and options

import type { Game } from '../types/game.js';
import { PLATFORM_COLORS, GENRE_COLORS, TIER_COLORS } from './colorConstants.js';

// Platform color mapping - uses centralized color constants
export const getPlatformColor = (platform: string): string => {
	return PLATFORM_COLORS[platform] || 'bg-[#6b7280] text-[#f9fafb]'; // Fallback with a colorful grey
};

// Genre color mapping - uses centralized color constants
export const getGenreColor = (genre: string): string => {
	return GENRE_COLORS[genre] || 'bg-[#6b7280] text-[#f9fafb]'; // Fallback with a colorful grey
};

// Tier color mapping - uses centralized color constants
export const getTierColor = (tier: string): string => {
	return TIER_COLORS[tier] || 'bg-gray-600 text-white';
};

// Get all unique platforms from games data
export const getAllPlatforms = (games: Game[]): string[] => {
	const platforms = new Set<string>();
	games.forEach((game) => {
		if (game.platform) {
			platforms.add(game.platform);
		}
	});
	return Array.from(platforms).sort();
};

// Get all unique genres from games data
export const getAllGenres = (games: Game[]): string[] => {
	const genres = new Set<string>();
	games.forEach((game) => {
		if (game.genre) {
			genres.add(game.genre);
		}
	});
	return Array.from(genres).sort();
};

// Get all unique tiers from games data (only completed games)
export const getAllTiers = (games: Game[]): string[] => {
	const tiers = new Set<string>();

	games.forEach((game) => {
		if (game.status === 'Completed' && game.tier) {
			tiers.add(game.tier);
		}
	});

	// Map single letter tiers to full names and return in correct order
	const tierMapping: Record<string, string> = {
		'S': 'S - Masterpiece',
		'A': 'A - Amazing',
		'B': 'B - Great',
		'C': 'C - Good',
		'D': 'D - Decent',
		'E': 'E - Bad'
	};

	const result = Array.from(tiers)
		.map(tier => tierMapping[tier])
		.filter(Boolean)
		.sort((a, b) => {
			// Sort by tier order: S, A, B, C, D, E
			const order = ['S - Masterpiece', 'A - Amazing', 'B - Great', 'C - Good', 'D - Decent', 'E - Bad'];
			return order.indexOf(a) - order.indexOf(b);
		});

	return result;
};

// Validation helpers
export const isValidPlatform = (platform: string, games: Game[]): boolean => {
	const validPlatforms = getAllPlatforms(games);
	return validPlatforms.includes(platform);
};

export const isValidGenre = (genre: string, games: Game[]): boolean => {
	const validGenres = getAllGenres(games);
	return validGenres.includes(genre);
};

export const isValidTier = (tier: string, games: Game[]): boolean => {
	const validTiers = getAllTiers(games);
	return validTiers.includes(tier);
};

// Extract filter options from games data
export const extractFilterOptions = (games: Game[]) => {
	return {
		platforms: getAllPlatforms(games),
		genres: getAllGenres(games),
		tiers: getAllTiers(games)
	};
};

// Filter statistics
export const getFilterStats = (games: Game[]) => {
	return {
		totalGames: games.length,
		completedGames: games.filter((g) => g.status === 'Completed').length,
		plannedGames: games.filter((g) => g.status === 'Planned').length,
		uniquePlatforms: getAllPlatforms(games).length,
		uniqueGenres: getAllGenres(games).length,
		uniqueTiers: getAllTiers(games).length
	};
};

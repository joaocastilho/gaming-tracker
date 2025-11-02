// Filter utilities for color coding and options

import type { Game } from '../types/game.js';

// Platform color mapping
export const getPlatformColor = (platform: string): string => {
	const platformColors: Record<string, string> = {
		// Console platforms
		'PlayStation 5': 'bg-blue-600 text-white',
		'PlayStation 4': 'bg-blue-500 text-white',
		'PlayStation 3': 'bg-blue-400 text-white',
		'PlayStation 2': 'bg-blue-300 text-black',
		'PlayStation Vita': 'bg-purple-500 text-white',
		'PSP': 'bg-purple-400 text-white',

		'Xbox Series X/S': 'bg-green-600 text-white',
		'Xbox One': 'bg-green-500 text-white',
		'Xbox 360': 'bg-green-400 text-white',
		'Xbox': 'bg-green-300 text-black',

		'Nintendo Switch': 'bg-red-600 text-white',
		'Nintendo 3DS': 'bg-red-500 text-white',
		'Nintendo DS': 'bg-red-400 text-white',
		'Wii U': 'bg-red-300 text-black',
		'Wii': 'bg-red-300 text-black',
		'GameCube': 'bg-red-200 text-black',
		'N64': 'bg-red-100 text-black',

		// PC platforms
		'PC': 'bg-gray-700 text-white',
		'Steam Deck': 'bg-teal-600 text-white',

		// Mobile platforms
		'iOS': 'bg-gray-500 text-white',
		'Android': 'bg-green-500 text-white',

		// Retro/Classic
		'Sega Genesis': 'bg-indigo-500 text-white',
		'Sega Saturn': 'bg-indigo-400 text-white',
		'Sega Dreamcast': 'bg-indigo-300 text-black',
		'Atari 2600': 'bg-orange-500 text-white',
		'Arcade': 'bg-yellow-500 text-black',

		// Fallback
		'Web': 'bg-purple-600 text-white'
	};

	return platformColors[platform] || 'bg-gray-600 text-white';
};

// Genre color mapping
export const getGenreColor = (genre: string): string => {
	const genreColors: Record<string, string> = {
		// Action genres
		'Action': 'bg-red-600 text-white',
		'Action-Adventure': 'bg-red-500 text-white',
		'Adventure': 'bg-orange-500 text-white',
		'Platformer': 'bg-orange-400 text-white',
		'Shooter': 'bg-red-700 text-white',
		'Fighting': 'bg-red-800 text-white',

		// RPG genres
		'RPG': 'bg-purple-600 text-white',
		'JRPG': 'bg-purple-500 text-white',
		'Action RPG': 'bg-purple-400 text-white',
		'MMORPG': 'bg-purple-700 text-white',
		'Strategy RPG': 'bg-purple-300 text-black',

		// Strategy genres
		'Strategy': 'bg-blue-600 text-white',
		'RTS': 'bg-blue-500 text-white',
		'TBS': 'bg-blue-400 text-white',
		'4X': 'bg-blue-300 text-black',

		// Simulation genres
		'Simulation': 'bg-green-600 text-white',
		'Life Sim': 'bg-green-500 text-white',
		'Builder': 'bg-green-400 text-white',
		'Tycoon': 'bg-green-300 text-black',

		// Sports genres
		'Sports': 'bg-emerald-600 text-white',
		'Racing': 'bg-emerald-500 text-white',
		'Football': 'bg-emerald-400 text-white',
		'Basketball': 'bg-emerald-300 text-black',

		// Puzzle genres
		'Puzzle': 'bg-yellow-600 text-white',
		'Match-3': 'bg-yellow-500 text-black',
		'Logic': 'bg-yellow-400 text-black',
		'Brain Training': 'bg-yellow-300 text-black',

		// Indie/Other
		'Indie': 'bg-pink-500 text-white',
		'Metroidvania': 'bg-pink-400 text-white',
		'Horror': 'bg-gray-800 text-white',
		'Educational': 'bg-cyan-500 text-white',
		'Casual': 'bg-cyan-400 text-white',
		'Music': 'bg-cyan-300 text-black',

		// Fallback
		'Unknown': 'bg-gray-600 text-white'
	};

	return genreColors[genre] || 'bg-gray-600 text-white';
};

// Tier color mapping
export const getTierColor = (tier: string): string => {
	const tierColors: Record<string, string> = {
		'S': 'bg-emerald-600 text-white',     // S - Exceptional
		'A': 'bg-green-600 text-white',       // A - Excellent  
		'B': 'bg-blue-600 text-white',        // B - Good
		'C': 'bg-yellow-600 text-black',      // C - Average
		'D': 'bg-orange-600 text-white',      // D - Below Average
		'E': 'bg-red-600 text-white'          // E - Poor
	};

	return tierColors[tier] || 'bg-gray-600 text-white';
};

// Get all unique platforms from games data
export const getAllPlatforms = (games: Game[]): string[] => {
	const platforms = new Set<string>();
	games.forEach(game => {
		if (game.platform) {
			platforms.add(game.platform);
		}
	});
	return Array.from(platforms).sort();
};

// Get all unique genres from games data
export const getAllGenres = (games: Game[]): string[] => {
	const genres = new Set<string>();
	games.forEach(game => {
		if (game.genre) {
			genres.add(game.genre);
		}
	});
	return Array.from(genres).sort();
};

// Get all unique tiers from games data (only completed games)
export const getAllTiers = (games: Game[]): string[] => {
	const tiers = new Set<string>();
	games.forEach(game => {
		if (game.status === 'Completed' && game.tier) {
			tiers.add(game.tier);
		}
	});
	// Return tiers in correct order (S, A, B, C, D, E)
	const tierOrder = ['S', 'A', 'B', 'C', 'D', 'E'];
	return tierOrder.filter(tier => tiers.has(tier));
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

// Filter statistics
export const getFilterStats = (games: Game[]) => {
	return {
		totalGames: games.length,
		completedGames: games.filter(g => g.status === 'Completed').length,
		plannedGames: games.filter(g => g.status === 'Planned').length,
		uniquePlatforms: getAllPlatforms(games).length,
		uniqueGenres: getAllGenres(games).length,
		uniqueTiers: getAllTiers(games).length
	};
};

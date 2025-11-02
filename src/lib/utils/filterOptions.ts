import type { Game } from '../types/game.js';

/**
 * Extracts unique filter options from games data
 */
export function extractFilterOptions(games: Game[]) {
	const platforms = new Set<string>();
	const genres = new Set<string>();
	const tiers = new Set<string>();

	games.forEach((game) => {
		// Add platform
		if (game.platform) {
			platforms.add(game.platform);
		}

		// Add genre
		if (game.genre) {
			genres.add(game.genre);
		}

		// Add tier (only for completed games)
		if (game.status === 'Completed' && game.tier) {
			tiers.add(game.tier);
		}
	});

	return {
		platforms: Array.from(platforms).sort(),
		genres: Array.from(genres).sort(),
		tiers: Array.from(tiers).sort((a, b) => {
			// Sort tiers in reverse alphabetical order (S, A, B, C, D, E)
			return b.localeCompare(a);
		})
	};
}

/**
 * Color schemes for filter badges (extracted from GameCard component)
 */
export const filterColors = {
	platforms: {
		PC: 'bg-[#1e3a5f] text-[#60a5fa]',
		PS5: 'bg-[#1e293b] text-[#38bdf8]',
		Xbox: 'bg-[#14532d] text-[#4ade80]',
		Switch: 'bg-[#7c2d12] text-[#fb923c]',
		PS4: 'bg-[#374151] text-[#9ca3af]',
		PS3: 'bg-[#1f2937] text-[#d1d5db]',
		'Xbox 360': 'bg-[#064e3b] text-[#6ee7b7]',
		'Xbox One': 'bg-[#047857] text-[#34d399]',
		'Steam Deck': 'bg-[#7c2d12] text-[#fb923c]',
		Mobile: 'bg-[#be185d] text-[#f9a8d4]',
		Default: 'bg-gray-600 text-white'
	},
	genres: {
		'Action RPG': 'bg-[#2d1f3f] text-[#c084fc]',
		'Story Adventure': 'bg-[#422006] text-[#fbbf24]',
		'Action Adventure': 'bg-[#164e63] text-[#22d3ee]',
		Puzzle: 'bg-[#3f1f4d] text-[#e879f9]',
		Metroidvania: 'bg-[#4c1d95] text-[#a78bfa]',
		RPG: 'bg-[#7c2d12] text-[#fb923c]',
		Action: 'bg-[#dc2626] text-[#fca5a5]',
		Adventure: 'bg-[#16a34a] text-[#86efac]',
		Indie: 'bg-[#ca8a04] text-[#fde047]',
		Strategy: 'bg-[#7c3aed] text-[#c4b5fd]',
		Simulation: 'bg-[#0891b2] text-[#67e8f9]',
		Sports: 'bg-[#be123c] text-[#f9a8d4]',
		Racing: 'bg-[#b91c1c] text-[#fecaca]',
		Shooter: 'bg-[#991b1b] text-[#fca5a5]',
		Platformer: 'bg-[#c2410c] text-[#fdba74]',
		Horror: 'bg-[#581c87] text-[#d8b4fe]',
		'Visual Novel': 'bg-[#be185d] text-[#f9a8d4]',
		JRPG: 'bg-[#7c2d12] text-[#fb923c]',
		'Western RPG': 'bg-[#92400e] text-[#fed7aa]',
		Roguelike: 'bg-[#7f1d1d] text-[#fecaca]',
		'Survival Horror': 'bg-[#581c87] text-[#d8b4fe]',
		'Classic RPG': 'bg-[#7c2d12] text-[#fb923c]',
		Default: 'bg-gray-600 text-white'
	},
	tiers: {
		S: 'bg-[#dc2626] text-white',
		A: 'bg-[#f97316] text-white',
		B: 'bg-[#eab308] text-black',
		C: 'bg-[#22c55e] text-white',
		D: 'bg-[#06b6d4] text-white',
		E: 'bg-[#6b7280] text-white'
	}
};

/**
 * Get color class for a specific platform
 */
export function getPlatformColor(platform: string): string {
	return (
		filterColors.platforms[platform as keyof typeof filterColors.platforms] ||
		filterColors.platforms.Default
	);
}

/**
 * Get color class for a specific genre
 */
export function getGenreColor(genre: string): string {
	return (
		filterColors.genres[genre as keyof typeof filterColors.genres] || filterColors.genres.Default
	);
}

/**
 * Get color class for a specific tier
 */
export function getTierColor(tier: string): string {
	return filterColors.tiers[tier as keyof typeof filterColors.tiers] || 'bg-gray-500 text-white';
}

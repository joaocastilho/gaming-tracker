import gamesData from '../../../static/games.json';

export type Game = (typeof gamesData.games)[number];

export const getAllPlatforms = (): string[] => {
	const platforms = new Set<string>();
	gamesData.games.forEach((game) => {
		if (game.platform) {
			platforms.add(game.platform);
		}
	});
	return Array.from(platforms).sort();
};

export const getAllGenres = (): string[] => {
	const genres = new Set<string>();
	gamesData.games.forEach((game) => {
		if (game.genre) {
			genres.add(game.genre);
		}
	});
	return Array.from(genres).sort();
};

export const getAllTiers = (): string[] => {
	const tiers = new Set<string>();
	const tierMapping: Record<string, string> = {
		S: 'S - Masterpiece',
		A: 'A - Amazing',
		B: 'B - Great',
		C: 'C - Good',
		D: 'D - Decent',
		E: 'E - Bad'
	};

	gamesData.games.forEach((game) => {
		if (game.status === 'Completed' && game.tier) {
			tiers.add(tierMapping[game.tier]);
		}
	});

	return Array.from(tiers).sort((a, b) => {
		const order = [
			'S - Masterpiece',
			'A - Amazing',
			'B - Great',
			'C - Good',
			'D - Decent',
			'E - Bad'
		];
		return order.indexOf(a) - order.indexOf(b);
	});
};

export const isValidPlatform = (platform: string): boolean => getAllPlatforms().includes(platform);

export const isValidGenre = (genre: string): boolean => getAllGenres().includes(genre);

export const isValidTier = (tier: string): boolean => getAllTiers().includes(tier);

export const platforms = getAllPlatforms();
export const genres = getAllGenres();
export const tiers = getAllTiers();

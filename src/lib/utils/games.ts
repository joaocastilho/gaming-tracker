import gamesData from '../../../static/games.json';

export type Game = (typeof gamesData)[number];

export function extractUniquePlatforms(): string[] {
	const platforms = new Set<string>();
	gamesData.forEach((game) => {
		if (game.platform) {
			platforms.add(game.platform);
		}
	});
	return Array.from(platforms).sort();
}

export function extractUniqueGenres(): string[] {
	const genres = new Set<string>();
	gamesData.forEach((game) => {
		if (game.genre) {
			genres.add(game.genre);
		}
	});
	return Array.from(genres).sort();
}

export function extractTierCounts(): Record<string, number> {
	const tierCounts: Record<string, number> = {
		S: 0,
		A: 0,
		B: 0,
		C: 0,
		D: 0,
		E: 0
	};

	gamesData.forEach((game) => {
		if (game.status === 'Completed' && game.tier && tierCounts[game.tier] !== undefined) {
			tierCounts[game.tier] += 1;
		}
	});

	return tierCounts;
}

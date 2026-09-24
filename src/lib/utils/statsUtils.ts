import type { Game } from '$lib/types/game';

export interface GenreStat {
	name: string;
	count: number;
	ratedCount: number;
	totalScore: number;
	averageScore: number;
	percentage: number;
}

export interface ScoreBandStat {
	label: string;
	min: number;
	max: number;
	count: number;
	percentage: number;
}

const SCORE_BANDS = [
	{ label: '0–4', min: 0, max: 4 },
	{ label: '5–8', min: 5, max: 8 },
	{ label: '9–12', min: 9, max: 12 },
	{ label: '13–16', min: 13, max: 16 },
	{ label: '17–20', min: 17, max: 20 },
] as const;

export function computeGenreStats(games: Game[]): GenreStat[] {
	const completedGames = games.filter((game) => game.status === 'Completed');
	const genreTotals = new Map<string, { count: number; ratedCount: number; totalScore: number }>();

	for (const game of completedGames) {
		const totals = genreTotals.get(game.genre) ?? { count: 0, ratedCount: 0, totalScore: 0 };
		totals.count += 1;
		if (game.score != null) {
			totals.ratedCount += 1;
			totals.totalScore += game.score;
		}
		genreTotals.set(game.genre, totals);
	}

	const totalCompleted = completedGames.length;
	return [...genreTotals.entries()]
		.map(([name, totals]) => ({
			name,
			count: totals.count,
			ratedCount: totals.ratedCount,
			totalScore: totals.totalScore,
			averageScore: totals.ratedCount === 0 ? 0 : Math.round((totals.totalScore / totals.ratedCount) * 10) / 10,
			percentage: totalCompleted === 0 ? 0 : Math.round((totals.count / totalCompleted) * 1000) / 10,
		}))
		.toSorted((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function computeScoreDistribution(games: Game[]): ScoreBandStat[] {
	const scores = games
		.filter((game) => game.status === 'Completed' && game.score != null && game.score >= 0 && game.score <= 20)
		.map((game) => game.score ?? 0);
	const totalScores = scores.length;

	return SCORE_BANDS.map((band) => {
		const count = scores.filter((score) => score >= band.min && score <= band.max).length;
		return {
			...band,
			count,
			percentage: totalScores === 0 ? 0 : Math.round((count / totalScores) * 1000) / 10,
		};
	});
}

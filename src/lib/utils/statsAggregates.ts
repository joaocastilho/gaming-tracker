import type { Game } from '#lib/types/game.js';
import { parsePlaytimeToMinutes } from '#lib/utils/playtimeUtils.js';

// Single-pass replacements for the stats page's per-derivation date work.
//
// The page used to derive gamesThisYear, yearAllStats, backlogEta, and
// yearlyMonthData separately, each re-filtering completedGames and
// re-parsing every finishedDate. One aggregation over the array serves all
// of them. Year/month use the same local-time getFullYear()/getMonth() the
// previous derivations used, so results are unchanged.

export interface YearAggregate {
	year: number;
	count: number;
	/** Completion counts indexed by month (0 = January). */
	months: number[];
	/** Total playtime minutes of games finished in this year. */
	minutes: number;
}

export interface YearMonthAggregates {
	/** One entry per year with completions, ordered by first appearance then year. */
	years: YearAggregate[];
	totalYears: number;
	/** Completions per year, rounded to one decimal. */
	avgPerYear: number;
	bestYear: number;
	bestCount: number;
	firstYear?: number;
	lastYear?: number;
}

export function computeYearMonthAggregates(games: Game[]): YearMonthAggregates {
	// Insertion order matters: bestYear picks the first year (in map order)
	// holding the maximum count, matching the previous Map-based derivation.
	const byYear = new Map<number, YearAggregate>();

	for (const game of games) {
		if (!game.finishedDate) continue;
		const date = new Date(game.finishedDate);
		const year = date.getFullYear();
		const month = date.getMonth();

		let entry = byYear.get(year);
		if (!entry) {
			entry = { year, count: 0, months: Array.from({ length: 12 }, () => 0), minutes: 0 };
			byYear.set(year, entry);
		}
		entry.count += 1;
		entry.months[month] += 1;
		entry.minutes += parsePlaytimeToMinutes(game.playtime);
	}

	const years = [...byYear.values()].toSorted((a, b) => a.year - b.year);
	const totalYears = years.length;

	let bestYear = 0;
	let bestCount = 0;
	for (const entry of byYear.values()) {
		if (entry.count > bestCount) {
			bestYear = entry.year;
			bestCount = entry.count;
		}
	}

	const completedCount = games.length;

	return {
		years,
		totalYears,
		avgPerYear: totalYears ? Math.round((completedCount / totalYears) * 10) / 10 : 0,
		bestYear,
		bestCount,
		firstYear: years[0]?.year,
		lastYear: years[years.length - 1]?.year,
	};
}

export function countInYear(aggregates: YearMonthAggregates, year: number): number {
	for (const entry of aggregates.years) {
		if (entry.year === year) return entry.count;
	}
	return 0;
}

export function minutesInYear(aggregates: YearMonthAggregates, year: number): number {
	for (const entry of aggregates.years) {
		if (entry.year === year) return entry.minutes;
	}
	return 0;
}

export interface TopRatedGames {
	presentation: Game[];
	story: Game[];
	gameplay: Game[];
	score: Game[];
}

type RatingKey = 'ratingPresentation' | 'ratingStory' | 'ratingGameplay' | 'score';

const RATING_KEYS: RatingKey[] = ['ratingPresentation', 'ratingStory', 'ratingGameplay', 'score'];

/**
 * Top-rated games per category. Equivalent to sorting each category
 * descending, slicing, and dropping nulls — but with four bounded lists
 * filled in a single pass instead of four full sorts and four array clones.
 * Insertion before the first strictly-smaller entry keeps the stable-sort
 * ordering for ties.
 */
export function computeTopRated(games: Game[], limit = 10): TopRatedGames {
	const lists: Record<RatingKey, Game[]> = {
		ratingPresentation: [],
		ratingStory: [],
		ratingGameplay: [],
		score: [],
	};

	for (const game of games) {
		for (const key of RATING_KEYS) {
			const value = game[key];
			if (value == null) continue;

			const list = lists[key];
			let index = list.length;
			while (index > 0 && (list[index - 1][key] ?? 0) < value) {
				index -= 1;
			}
			if (index < limit) {
				list.splice(index, 0, game);
				if (list.length > limit) list.pop();
			}
		}
	}

	return {
		presentation: lists.ratingPresentation,
		story: lists.ratingStory,
		gameplay: lists.ratingGameplay,
		score: lists.score,
	};
}

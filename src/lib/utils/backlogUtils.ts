import type { Game } from '$lib/types/game';
import { parsePlaytimeToMinutes } from '$lib/utils/playtimeUtils';

export interface BacklogSlice {
	/** Number of games in this slice */
	count: number;
	/** Total playtime in minutes */
	minutes: number;
	/** Percentage of total (0-100) for hours */
	pctHours: number;
	/** Percentage of total (0-100) for counts */
	pctCount: number;
}

export interface BacklogStats {
	completed: BacklogSlice;
	playing: BacklogSlice;
	planned: BacklogSlice;
	/** Combined playing + planned (the remaining backlog) */
	backlog: BacklogSlice;
	total: BacklogSlice;
}

function pct(part: number, total: number): number {
	if (total === 0) return 0;
	return (part / total) * 100;
}

export function computeBacklogStats(games: Game[]): BacklogStats {
	const completedGames = games.filter((g) => g.status === 'Completed');
	const playingGames = games.filter((g) => g.status === 'Playing');
	const plannedGames = games.filter((g) => g.status === 'Planned');

	const completedMinutes = completedGames.reduce((s, g) => s + parsePlaytimeToMinutes(g.playtime), 0);
	const playingMinutes = playingGames.reduce((s, g) => s + parsePlaytimeToMinutes(g.playtime), 0);
	const plannedMinutes = plannedGames.reduce((s, g) => s + parsePlaytimeToMinutes(g.playtime), 0);

	const totalMinutes = completedMinutes + playingMinutes + plannedMinutes;
	const backlogMinutes = playingMinutes + plannedMinutes;

	const completedCount = completedGames.length;
	const playingCount = playingGames.length;
	const plannedCount = plannedGames.length;
	const totalCount = games.length;
	const backlogCount = playingCount + plannedCount;

	const completedPctHours = pct(completedMinutes, totalMinutes);
	const playingPctHours = pct(playingMinutes, totalMinutes);
	const plannedPctHours = pct(plannedMinutes, totalMinutes);

	const completedPctCount = pct(completedCount, totalCount);
	const playingPctCount = pct(playingCount, totalCount);
	const plannedPctCount = pct(plannedCount, totalCount);

	const backlogPctHours = pct(backlogMinutes, totalMinutes);
	const backlogPctCount = pct(backlogCount, totalCount);
	const totalPctHours = totalMinutes === 0 ? 0 : 100;
	const totalPctCount = totalCount === 0 ? 0 : 100;

	return {
		completed: {
			count: completedCount,
			minutes: completedMinutes,
			pctHours: completedPctHours,
			pctCount: completedPctCount,
		},
		playing: {
			count: playingCount,
			minutes: playingMinutes,
			pctHours: playingPctHours,
			pctCount: playingPctCount,
		},
		planned: {
			count: plannedCount,
			minutes: plannedMinutes,
			pctHours: plannedPctHours,
			pctCount: plannedPctCount,
		},
		backlog: {
			count: backlogCount,
			minutes: backlogMinutes,
			pctHours: backlogPctHours,
			pctCount: backlogPctCount,
		},
		total: {
			count: totalCount,
			minutes: totalMinutes,
			pctHours: totalPctHours,
			pctCount: totalPctCount,
		},
	};
}

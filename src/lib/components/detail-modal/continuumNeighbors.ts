import type { Game } from '#lib/types/game.js';

export interface ContinuumNeighbors {
	/** Nearest game first. */
	previous: Game[];
	/** Nearest game first. */
	next: Game[];
}

const NO_NEIGHBORS: ContinuumNeighbors = { previous: [], next: [] };

/**
 * The continuum only has room for preview cards once the 1056px-wide active
 * card leaves a meaningful gap on both sides. At 1920 there is room for a
 * second, partially clipped card.
 */
export function getContinuumPreviewCount(viewportWidth: number): number {
	if (viewportWidth >= 1920) return 2;
	if (viewportWidth >= 1280) return 1;
	return 0;
}

export function getContinuumNeighbors(games: Game[], activeIndex: number, perSide: number): ContinuumNeighbors {
	if (activeIndex < 0 || activeIndex >= games.length || perSide <= 0) return NO_NEIGHBORS;

	const previous: Game[] = [];
	for (let step = 1; step <= perSide; step++) {
		const index = activeIndex - step;
		if (index < 0) break;
		previous.push(games[index]);
	}

	const next: Game[] = [];
	for (let step = 1; step <= perSide; step++) {
		const index = activeIndex + step;
		if (index >= games.length) break;
		next.push(games[index]);
	}

	return { previous, next };
}

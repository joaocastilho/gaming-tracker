/**
 * Client-side utilities for game data transformation
 * Note: This file should only be used on the client side
 */

import { transformGameData } from './dataTransformer';

/**
 * Transform array of games (client-side only)
 */
export function transformGamesData(games: Record<string, unknown>[]): Record<string, unknown>[] {
	return games.map(transformGameData);
}

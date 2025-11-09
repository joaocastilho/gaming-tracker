/**
 * Memoization utility for expensive computations
 * Caches results based on input parameters to avoid redundant calculations
 */

export interface MemoizeOptions {
	maxSize?: number;
	ttl?: number;
}

/**
 * Simple memoization function that caches based on stringified arguments
 */
export function memoize<TArgs extends unknown[], TReturn>(
	fn: (...args: TArgs) => TReturn,
	options: MemoizeOptions = {}
): (...args: TArgs) => TReturn {
	const { maxSize = 10, ttl } = options;
	const cache = new Map<string, { value: TReturn; timestamp: number }>();

	return (...args: TArgs): TReturn => {
		const key = JSON.stringify(args);

		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (!ttl || now - cached.timestamp < ttl) {
				return cached.value;
			}

			cache.delete(key);
		}

		const result = fn(...args);

		cache.set(key, { value: result, timestamp: Date.now() });

		if (cache.size > maxSize) {
			const firstKey = cache.keys().next().value;
			if (firstKey) {
				cache.delete(firstKey);
			}
		}

		return result;
	};
}

/**
 * Memoization specifically for game filtering operations
 * Uses a more efficient cache key generation for game arrays and filter objects
 */
export function memoizeGameFilter<TGames extends { id: string | number }[], TFilters, TReturn>(
	fn: (games: TGames, filters: TFilters) => TReturn,
	options: MemoizeOptions = {}
): (games: TGames, filters: TFilters) => TReturn {
	const { maxSize = 5, ttl = 5000 } = options;
	const cache = new Map<string, { value: TReturn; timestamp: number }>();

	return (games: TGames, filters: TFilters): TReturn => {
		const gameIds = games
			.map((g) => g.id)
			.sort()
			.join(',');
		const filterKey = JSON.stringify(filters);
		const key = `${gameIds}|${filterKey}`;

		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (now - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		const result = fn(games, filters);

		cache.set(key, { value: result, timestamp: Date.now() });

		if (cache.size > maxSize) {
			const firstKey = cache.keys().next().value;
			if (firstKey) {
				cache.delete(firstKey);
			}
		}

		return result;
	};
}

/**
 * Memoization for sorting operations
 */
export function memoizeGameSort<TGames extends { id: string | number }[], TReturn>(
	fn: (games: TGames, sortBy: string, sortDirection: string) => TReturn,
	options: MemoizeOptions = {}
): (games: TGames, sortBy: string, sortDirection: string) => TReturn {
	const { maxSize = 5, ttl = 3000 } = options;
	const cache = new Map<string, { value: TReturn; timestamp: number }>();

	return (games: TGames, sortBy: string, sortDirection: string): TReturn => {
		const gameIds = games
			.map((g) => g.id)
			.sort()
			.join(',');
		const key = `${gameIds}|${sortBy}|${sortDirection}`;

		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (now - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		const result = fn(games, sortBy, sortDirection);

		cache.set(key, { value: result, timestamp: Date.now() });

		if (cache.size > maxSize) {
			const firstKey = cache.keys().next().value;
			if (firstKey) {
				cache.delete(firstKey);
			}
		}

		return result;
	};
}

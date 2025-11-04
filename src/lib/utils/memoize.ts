/**
 * Memoization utility for expensive computations
 * Caches results based on input parameters to avoid redundant calculations
 */

export interface MemoizeOptions {
	maxSize?: number;
	ttl?: number; // Time to live in milliseconds
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
		// Create cache key from arguments
		const key = JSON.stringify(args);

		// Check if result is cached and still valid
		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (!ttl || now - cached.timestamp < ttl) {
				return cached.value;
			}
			// Remove expired entry
			cache.delete(key);
		}

		// Compute new result
		const result = fn(...args);

		// Cache the result
		cache.set(key, { value: result, timestamp: Date.now() });

		// Maintain cache size limit
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
	const { maxSize = 5, ttl = 5000 } = options; // 5 second TTL for game filters
	const cache = new Map<string, { value: TReturn; timestamp: number }>();

	return (games: TGames, filters: TFilters): TReturn => {
		// Create a more efficient cache key
		// Use game IDs and filter state for uniqueness
		const gameIds = games
			.map((g) => g.id)
			.sort()
			.join(',');
		const filterKey = JSON.stringify(filters);
		const key = `${gameIds}|${filterKey}`;

		// Check cache
		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (now - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		// Compute result
		const result = fn(games, filters);

		// Cache result
		cache.set(key, { value: result, timestamp: Date.now() });

		// Maintain cache size
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
	const { maxSize = 5, ttl = 3000 } = options; // 3 second TTL for sorting
	const cache = new Map<string, { value: TReturn; timestamp: number }>();

	return (games: TGames, sortBy: string, sortDirection: string): TReturn => {
		// Create cache key from game IDs and sort parameters
		const gameIds = games
			.map((g) => g.id)
			.sort()
			.join(',');
		const key = `${gameIds}|${sortBy}|${sortDirection}`;

		// Check cache
		const cached = cache.get(key);
		if (cached) {
			const now = Date.now();
			if (now - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		// Compute result
		const result = fn(games, sortBy, sortDirection);

		// Cache result
		cache.set(key, { value: result, timestamp: Date.now() });

		// Maintain cache size
		if (cache.size > maxSize) {
			const firstKey = cache.keys().next().value;
			if (firstKey) {
				cache.delete(firstKey);
			}
		}

		return result;
	};
}

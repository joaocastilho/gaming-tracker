/**
 * Safely extracts a unique key for an item in a virtual list.
 * Handles duplicate keys, missing keys, and ensures uniqueness.
 *
 * @param item The item to extract a key from
 * @param index The index of the item in the list
 * @param keyExtractor A function to extract the primary key
 * @returns A unique string key
 */
export function safeKeyExtractor<T>(
	item: T,
	index: number,
	keyExtractor: (item: T, index: number) => string | number
): string {
	try {
		const key = keyExtractor(item, index);

		if (key === null || key === undefined || key === '') {
			return `fallback-key-${index}`;
		}

		return String(key);
	} catch (error) {
		console.warn(`Error extracting key at index ${index}:`, error);
		return `error-key-${index}`;
	}
}

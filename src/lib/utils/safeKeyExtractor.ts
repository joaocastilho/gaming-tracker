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
	} catch {
		return `error-key-${index}`;
	}
}

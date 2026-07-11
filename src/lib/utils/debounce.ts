export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number,
	immediate = false,
	maxWait?: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	let maxTimeout: ReturnType<typeof setTimeout> | null = null;
	let latestArgs: Parameters<T> | null = null;

	const later = () => {
		timeout = null;
		if (maxTimeout) {
			clearTimeout(maxTimeout);
			maxTimeout = null;
		}
		if (!immediate) {
			func(...(latestArgs as Parameters<T>));
		}
	};

	const maxLater = () => {
		maxTimeout = null;
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		func(...(latestArgs as Parameters<T>));
	};

	return (...args: Parameters<T>) => {
		latestArgs = args;
		const callNow = immediate && !timeout;

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);

		if (callNow) {
			func(...args);
		}

		if (maxWait !== undefined && !maxTimeout) {
			maxTimeout = setTimeout(maxLater, maxWait);
		}
	};
}

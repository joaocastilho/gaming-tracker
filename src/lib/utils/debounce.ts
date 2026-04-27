export function debounce<T extends (...args: never[]) => unknown>(
	func: T,
	wait: number,
	immediate = false
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};

		const callNow = immediate && !timeout;

		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(later, wait);

		if (callNow) {
			func(...args);
		}
	};
}

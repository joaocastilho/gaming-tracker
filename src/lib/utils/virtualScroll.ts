export function binarySearchStart(offsets: number[] | null, target: number): number {
	if (!offsets || offsets.length === 0) return 0;
	let low = 0;
	let high = offsets.length - 1;
	while (low < high) {
		const mid = Math.floor((low + high) / 2);
		if (offsets[mid] < target) {
			low = mid + 1;
		} else {
			high = mid;
		}
	}
	return Math.max(0, low - 1);
}

export function binarySearchEnd(offsets: number[] | null, target: number, itemCount: number): number {
	if (!offsets || offsets.length === 0) return itemCount;
	let low = 0;
	let high = offsets.length - 1;
	while (low < high) {
		const mid = Math.ceil((low + high) / 2);
		if (offsets[mid] <= target) {
			low = mid;
		} else {
			high = mid - 1;
		}
	}
	return Math.min(itemCount, low + 1);
}

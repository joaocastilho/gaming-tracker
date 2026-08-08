import { describe, expect, it } from 'vitest';
import { binarySearchStart, binarySearchEnd } from '$lib/utils/virtualScroll';

describe('binarySearchStart', () => {
	it('returns 0 for null or empty offsets', () => {
		expect(binarySearchStart(null, 100)).toBe(0);
		expect(binarySearchStart([], 100)).toBe(0);
	});

	it('returns 0 for a target before the first offset', () => {
		expect(binarySearchStart([10, 20, 30], 5)).toBe(0);
	});

	it('returns the index of the item before the target', () => {
		expect(binarySearchStart([10, 20, 30], 15)).toBe(0);
		expect(binarySearchStart([10, 20, 30], 25)).toBe(1);
	});

	it('returns the last index for a target past the end', () => {
		expect(binarySearchStart([10, 20, 30], 500)).toBe(2);
	});

	it('handles exact-offset hits', () => {
		expect(binarySearchStart([10, 20, 30], 20)).toBe(1);
		expect(binarySearchStart([10, 20, 30], 30)).toBe(2);
	});

	it('handles offsets arrays with a leading zero (as built by VirtualList)', () => {
		expect(binarySearchStart([0, 10, 20, 30], 0)).toBe(0);
		expect(binarySearchStart([0, 10, 20, 30], 25)).toBe(2);
		expect(binarySearchStart([0, 10, 20, 30], 500)).toBe(3);
	});
});

describe('binarySearchEnd', () => {
	it('returns itemCount for null or empty offsets', () => {
		expect(binarySearchEnd(null, 100, 5)).toBe(5);
		expect(binarySearchEnd([], 100, 5)).toBe(5);
	});

	it('returns the exclusive index of the last item within the target', () => {
		expect(binarySearchEnd([10, 20, 30], 25, 3)).toBe(2);
		expect(binarySearchEnd([10, 20, 30], 30, 3)).toBe(3);
	});

	it('returns 1 for a target below the first offset', () => {
		expect(binarySearchEnd([10, 20, 30], 5, 3)).toBe(1);
	});

	it('clamps to itemCount', () => {
		expect(binarySearchEnd([10, 20, 30], 500, 3)).toBe(3);
	});
});

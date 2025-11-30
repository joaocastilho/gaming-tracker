import { describe, test, expect, beforeEach } from 'bun:test';
import { getUrlParams } from '$lib/utils/clientUtils';

describe('Client Utils URL Params', () => {
	beforeEach(() => {
		// Reset window location if needed, though getUrlParams is pure
		if (typeof window !== 'undefined') {
			window.location.search = '';
		}
	});

	test('getUrlParams reads coOp and tiers', () => {
		const params = new URLSearchParams('coOp=Yes&tiers=S%20-%20Masterpiece');
		const result = getUrlParams(params);

		expect(result.coOp).toEqual(['Yes']);
		expect(result.tiers).toEqual(['S - Masterpiece']);
	});

	test('getUrlParams handles multiple values', () => {
		// Let's just verify getUrlParams handles multiple values
		const params = new URLSearchParams('coOp=Yes&coOp=No');
		const result = getUrlParams(params);
		expect(result.coOp).toEqual(['Yes', 'No']);
	});
});

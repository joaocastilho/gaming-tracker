import { describe, expect, test } from 'vitest';
import type { PageState } from '#lib/types/pageState.js';

describe('Page state type safety', () => {
	test('page state properties should be properly typed', () => {
		const pageState: PageState = {
			showMobileSearch: true,
			fromTierlist: false,
		};

		expect(pageState.showMobileSearch).toBe(true);
		expect(pageState.fromTierlist).toBe(false);
	});

	test('page state should accept partial properties', () => {
		const partialState: PageState = {
			showMobileSearch: true,
		};

		expect(partialState.showMobileSearch).toBe(true);
		expect(partialState.fromTierlist).toBeUndefined();
	});
});

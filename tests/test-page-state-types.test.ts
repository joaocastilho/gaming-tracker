import { describe, test, expect } from 'vitest';

describe('Page state type safety', () => {
	test('page state properties should be properly typed', () => {
		// This test verifies that App.PageState interface is properly defined
		// and accessible throughout the application

		// Arrange: Define a typed page state
		const pageState: App.PageState = {
			showMobileSearch: true,
			fromTierlist: false,
			noscroll: true
		};

		// Act & Assert: Properties should be accessible with proper types
		expect(pageState.showMobileSearch).toBe(true);
		expect(pageState.fromTierlist).toBe(false);
		expect(pageState.noscroll).toBe(true);
	});

	test('page state should accept partial properties', () => {
		// Arrange: Define a partial page state
		const partialState: App.PageState = {
			showMobileSearch: true
		};

		// Act & Assert: Optional properties should work
		expect(partialState.showMobileSearch).toBe(true);
		expect(partialState.fromTierlist).toBeUndefined();
	});
});

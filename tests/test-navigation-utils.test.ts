import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { navigateTo } from '$lib/utils/navigationUtils';
import { filtersStore } from '$lib/stores/filters';
import { appStore } from '$lib/stores/app';

// Mock goto
const mockGoto = mock(() => Promise.resolve());
mock.module('$app/navigation', () => ({
	goto: mockGoto
}));

describe('Navigation Utils', () => {
	beforeEach(() => {
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
		mockGoto.mockClear();
	});

	test('navigateTo resets coOp filter', async () => {
		// Set up initial state
		filtersStore.toggleCoOp('Yes');

		// Navigate to 'completed' tab
		await navigateTo('completed');

		// Check if goto was called with the correct URL (no params)
		const lastCall = mockGoto.mock.calls[0] as unknown as [string];
		const url = new URL(lastCall[0]);

		expect(url.pathname).toBe('/completed');
		expect(url.searchParams.has('coOp')).toBe(false);
	});

	test('navigateTo resets multiple filters', async () => {
		// Set up initial state
		filtersStore.toggleCoOp('No');
		filtersStore.togglePlatform('PC');

		// Navigate to 'planned' tab
		await navigateTo('planned');

		// Check if goto was called with the correct URL (no params)
		const lastCall = mockGoto.mock.calls[0] as unknown as [string];
		const url = new URL(lastCall[0]);

		expect(url.pathname).toBe('/planned');
		expect(url.searchParams.has('coOp')).toBe(false);
		expect(url.searchParams.has('platforms')).toBe(false);
	});
});

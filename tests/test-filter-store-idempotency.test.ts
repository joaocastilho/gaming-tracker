/**
 * Filter Store Idempotency Tests
 * Ensures filter store methods don't trigger unnecessary state updates
 * which could cause infinite effect loops in Svelte components
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('Filter Store Idempotency', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	describe('setSearchTerm', () => {
		it('should not update state when setting same search term', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Set initial search term
			filtersStore.setSearchTerm('test');
			const stateAfterFirstSet = filtersStore.state;

			// Set same search term again - should be a no-op
			filtersStore.setSearchTerm('test');
			const stateAfterSecondSet = filtersStore.state;

			// State reference should be the same (no new object created)
			expect(stateAfterFirstSet).toBe(stateAfterSecondSet);
		});

		it('should update state when setting different search term', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			filtersStore.setSearchTerm('first');
			const stateAfterFirst = filtersStore.state;

			filtersStore.setSearchTerm('second');
			const stateAfterSecond = filtersStore.state;

			// State should be different
			expect(stateAfterFirst).not.toBe(stateAfterSecond);
			expect(filtersStore.state?.searchTerm).toBe('second');
		});

		it('should not update state when setting empty string on already empty', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Initial state has empty searchTerm
			const initialState = filtersStore.state;

			filtersStore.setSearchTerm('');
			const stateAfterSet = filtersStore.state;

			// State reference should be the same
			expect(initialState).toBe(stateAfterSet);
		});
	});

	describe('setSort', () => {
		it('should not update state when setting null on already null', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Initial state has null sortOption
			const initialState = filtersStore.state;
			expect(initialState?.sortOption).toBeNull();

			filtersStore.setSort(null);
			const stateAfterSet = filtersStore.state;

			// State reference should be the same
			expect(initialState).toBe(stateAfterSet);
		});

		it('should not update state when setting same sort option', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			const sortOption = { key: 'score' as const, direction: 'desc' as const };

			filtersStore.setSort(sortOption);
			const stateAfterFirst = filtersStore.state;

			// Set equivalent sort option
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			const stateAfterSecond = filtersStore.state;

			// State reference should be the same (no update for equivalent value)
			expect(stateAfterFirst).toBe(stateAfterSecond);
		});

		it('should update state when setting different sort option', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			filtersStore.setSort({ key: 'score', direction: 'asc' });
			const stateAfterFirst = filtersStore.state;

			filtersStore.setSort({ key: 'alphabetical', direction: 'asc' });
			const stateAfterSecond = filtersStore.state;

			// State should be different
			expect(stateAfterFirst).not.toBe(stateAfterSecond);
			expect(filtersStore.state?.sortOption?.key).toBe('alphabetical');
		});

		it('should update state when changing sort direction', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			filtersStore.setSort({ key: 'score', direction: 'asc' });
			const stateAfterFirst = filtersStore.state;

			filtersStore.setSort({ key: 'score', direction: 'desc' });
			const stateAfterSecond = filtersStore.state;

			// State should be different
			expect(stateAfterFirst).not.toBe(stateAfterSecond);
			expect(filtersStore.state?.sortOption?.direction).toBe('desc');
		});
	});

	describe('resetFilters / resetAllFilters', () => {
		it('should not update state when already in initial state', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Initial state
			const initialState = filtersStore.state;
			expect(filtersStore.isAnyFilterApplied()).toBe(false);

			filtersStore.resetFilters();
			const stateAfterReset = filtersStore.state;

			// State reference should be the same
			expect(initialState).toBe(stateAfterReset);
		});

		it('should update state when filters are applied', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Apply some filters
			filtersStore.togglePlatform('PC');
			filtersStore.setSearchTerm('test');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);

			const stateWithFilters = filtersStore.state;

			filtersStore.resetFilters();
			const stateAfterReset = filtersStore.state;

			// State should be different
			expect(stateWithFilters).not.toBe(stateAfterReset);
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
		});

		it('should update state when sort is applied but no filters', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			// Apply only sort (not a "filter" per se)
			filtersStore.setSort({ key: 'score', direction: 'desc' });
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
			expect(filtersStore.state?.sortOption).not.toBeNull();

			const stateWithSort = filtersStore.state;

			filtersStore.resetFilters();
			const stateAfterReset = filtersStore.state;

			// State should be different because sort was set
			expect(stateWithSort).not.toBe(stateAfterReset);
			expect(filtersStore.state?.sortOption).toBeNull();
		});
	});

	describe('isAnyFilterApplied', () => {
		it('should return false for initial state', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
		});

		it('should return true when search term is set', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			filtersStore.setSearchTerm('test');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('should return true when platform filter is set', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			filtersStore.togglePlatform('PC');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('should return true when genre filter is set', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			filtersStore.toggleGenre('Action');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('should return true when tier filter is set', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');
			filtersStore.toggleTier('S');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);
		});

		it('should return false after all filters are removed', async () => {
			const { filtersStore } = await import('$lib/stores/filters.svelte');

			filtersStore.setSearchTerm('test');
			filtersStore.togglePlatform('PC');
			expect(filtersStore.isAnyFilterApplied()).toBe(true);

			filtersStore.setSearchTerm('');
			filtersStore.togglePlatform('PC'); // Toggle off
			expect(filtersStore.isAnyFilterApplied()).toBe(false);
		});
	});
});

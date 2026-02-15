import { describe, it, expect, beforeEach } from 'vitest';
import { appStore } from '../src/lib/stores/app.svelte';
import { filtersStore } from '../src/lib/stores/filters.svelte';

describe('AppStore Tab Filter Behavior', () => {
	beforeEach(() => {
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
	});

	it('should NOT reset filters when switching to tierlist tab', async () => {
		filtersStore.togglePlatform('PC');
		expect(filtersStore.isAnyFilterApplied()).toBe(true);

		appStore.setActiveTab('tierlist');

		// Wait for potential effects
		await new Promise((resolve) => setTimeout(resolve, 0));

		expect(filtersStore.isAnyFilterApplied()).toBe(true);
	});

	it('should NOT reset filters when switching between All and Completed', () => {
		filtersStore.togglePlatform('PC');
		expect(filtersStore.isAnyFilterApplied()).toBe(true);

		appStore.setActiveTab('completed');

		expect(filtersStore.isAnyFilterApplied()).toBe(true);
	});
});

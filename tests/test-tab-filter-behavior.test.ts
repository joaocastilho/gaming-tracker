import { beforeEach, describe, expect, it } from 'vitest';
import { appStore } from '#lib/stores/app.js';
import { filtersStore } from '#lib/stores/filters.js';

describe('AppStore Tab Filter Behavior', () => {
	beforeEach(() => {
		filtersStore.resetFilters();
		appStore.setActiveTab('all');
	});

	it('should NOT reset filters when switching to tierlist tab', async () => {
		filtersStore.togglePlatform('PC');
		expect(filtersStore.isAnyFilterApplied()).toBe(true);

		appStore.setActiveTab('tierlist');

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

import { describe, it, expect, beforeEach } from 'bun:test';
import { get } from 'svelte/store';
import { filtersStore } from '$lib/stores/filters';
import { appStore } from '$lib/stores/app';

/**
 * Comprehensive tests for filtersStore API
 * These tests ensure behavior is preserved during any store refactoring
 */
describe('FiltersStore API', () => {
    beforeEach(() => {
        filtersStore.resetFilters();
    });

    describe('Initial State', () => {
        it('has empty initial state after reset', () => {
            const state = get(filtersStore);
            expect(state?.searchTerm).toBe('');
            expect(state?.platforms).toEqual([]);
            expect(state?.genres).toEqual([]);
            expect(state?.tiers).toEqual([]);
            expect(state?.coOp).toEqual([]);
            expect(state?.sortOption).toBeNull();
        });

        it('isAnyFilterApplied returns false when no filters set', () => {
            expect(filtersStore.isAnyFilterApplied()).toBe(false);
        });
    });

    describe('Search Term', () => {
        it('setSearchTerm updates searchTerm', () => {
            filtersStore.setSearchTerm('zelda');
            const state = get(filtersStore);
            expect(state?.searchTerm).toBe('zelda');
        });

        it('isAnyFilterApplied returns true when search term set', () => {
            filtersStore.setSearchTerm('test');
            expect(filtersStore.isAnyFilterApplied()).toBe(true);
        });

        it('searchQuery derived store reflects searchTerm', () => {
            filtersStore.setSearchTerm('mario');
            const searchQuery = get(filtersStore.searchQuery);
            expect(searchQuery).toBe('mario');
        });
    });

    describe('Platform Toggle', () => {
        it('togglePlatform adds platform when not present', () => {
            filtersStore.togglePlatform('PC');
            const state = get(filtersStore);
            expect(state?.platforms).toContain('PC');
        });

        it('togglePlatform removes platform when present', () => {
            filtersStore.togglePlatform('PC');
            filtersStore.togglePlatform('PC');
            const state = get(filtersStore);
            expect(state?.platforms).not.toContain('PC');
        });

        it('togglePlatform handles multiple platforms', () => {
            filtersStore.togglePlatform('PC');
            filtersStore.togglePlatform('PlayStation 5');
            const state = get(filtersStore);
            expect(state?.platforms).toContain('PC');
            expect(state?.platforms).toContain('PlayStation 5');
            expect(state?.platforms.length).toBe(2);
        });

        it('removePlatform removes specific platform', () => {
            filtersStore.togglePlatform('PC');
            filtersStore.togglePlatform('PlayStation 5');
            filtersStore.removePlatform('PC');
            const state = get(filtersStore);
            expect(state?.platforms).not.toContain('PC');
            expect(state?.platforms).toContain('PlayStation 5');
        });

        it('selectedPlatforms derived store reflects platforms', () => {
            filtersStore.togglePlatform('Nintendo Switch');
            const platforms = get(filtersStore.selectedPlatforms);
            expect(platforms).toContain('Nintendo Switch');
        });
    });

    describe('Genre Toggle', () => {
        it('toggleGenre adds genre when not present', () => {
            filtersStore.toggleGenre('RPG');
            const state = get(filtersStore);
            expect(state?.genres).toContain('RPG');
        });

        it('toggleGenre removes genre when present', () => {
            filtersStore.toggleGenre('RPG');
            filtersStore.toggleGenre('RPG');
            const state = get(filtersStore);
            expect(state?.genres).not.toContain('RPG');
        });

        it('removeGenre removes specific genre', () => {
            filtersStore.toggleGenre('RPG');
            filtersStore.toggleGenre('Action');
            filtersStore.removeGenre('RPG');
            const state = get(filtersStore);
            expect(state?.genres).not.toContain('RPG');
            expect(state?.genres).toContain('Action');
        });

        it('selectedGenres derived store reflects genres', () => {
            filtersStore.toggleGenre('Adventure');
            const genres = get(filtersStore.selectedGenres);
            expect(genres).toContain('Adventure');
        });
    });

    describe('Tier Toggle', () => {
        it('toggleTier adds tier when not present', () => {
            filtersStore.toggleTier('S - Masterpiece');
            const state = get(filtersStore);
            expect(state?.tiers).toContain('S - Masterpiece');
        });

        it('toggleTier removes tier when present', () => {
            filtersStore.toggleTier('S - Masterpiece');
            filtersStore.toggleTier('S - Masterpiece');
            const state = get(filtersStore);
            expect(state?.tiers).not.toContain('S - Masterpiece');
        });

        it('removeTier removes specific tier', () => {
            filtersStore.toggleTier('S - Masterpiece');
            filtersStore.toggleTier('A - Amazing');
            filtersStore.removeTier('S - Masterpiece');
            const state = get(filtersStore);
            expect(state?.tiers).not.toContain('S - Masterpiece');
            expect(state?.tiers).toContain('A - Amazing');
        });

        it('selectedTiers derived store reflects tiers', () => {
            filtersStore.toggleTier('B - Great');
            const tiers = get(filtersStore.selectedTiers);
            expect(tiers).toContain('B - Great');
        });
    });

    describe('Co-Op Toggle', () => {
        it('toggleCoOp adds value when not present', () => {
            filtersStore.toggleCoOp('Yes');
            const state = get(filtersStore);
            expect(state?.coOp).toContain('Yes');
        });

        it('toggleCoOp removes value when present', () => {
            filtersStore.toggleCoOp('Yes');
            filtersStore.toggleCoOp('Yes');
            const state = get(filtersStore);
            expect(state?.coOp).not.toContain('Yes');
        });

        it('removeCoOp removes specific value', () => {
            filtersStore.toggleCoOp('Yes');
            filtersStore.toggleCoOp('No');
            filtersStore.removeCoOp('Yes');
            const state = get(filtersStore);
            expect(state?.coOp).not.toContain('Yes');
            expect(state?.coOp).toContain('No');
        });

        it('selectedCoOp derived store reflects coOp', () => {
            filtersStore.toggleCoOp('Yes');
            const coOp = get(filtersStore.selectedCoOp);
            expect(coOp).toContain('Yes');
        });
    });

    describe('Sort Options', () => {
        it('setSort updates sortOption', () => {
            filtersStore.setSort({ key: 'score', direction: 'desc' });
            const state = get(filtersStore);
            expect(state?.sortOption?.key).toBe('score');
            expect(state?.sortOption?.direction).toBe('desc');
        });

        it('setSort with null clears sortOption', () => {
            filtersStore.setSort({ key: 'score', direction: 'desc' });
            filtersStore.setSort(null);
            const state = get(filtersStore);
            expect(state?.sortOption).toBeNull();
        });
    });

    describe('Reset Filters', () => {
        it('resetFilters clears all filters', () => {
            filtersStore.setSearchTerm('test');
            filtersStore.togglePlatform('PC');
            filtersStore.toggleGenre('RPG');
            filtersStore.toggleTier('S - Masterpiece');
            filtersStore.toggleCoOp('Yes');
            filtersStore.setSort({ key: 'score', direction: 'desc' });

            filtersStore.resetFilters();
            const state = get(filtersStore);

            expect(state?.searchTerm).toBe('');
            expect(state?.platforms).toEqual([]);
            expect(state?.genres).toEqual([]);
            expect(state?.tiers).toEqual([]);
            expect(state?.coOp).toEqual([]);
            expect(state?.sortOption).toBeNull();
        });

        it('resetAllFilters works the same as resetFilters', () => {
            filtersStore.setSearchTerm('test');
            filtersStore.togglePlatform('PC');
            filtersStore.resetAllFilters();

            const state = get(filtersStore);
            expect(state?.searchTerm).toBe('');
            expect(state?.platforms).toEqual([]);
        });
    });

    describe('isAnyFilterApplied', () => {
        it('returns true when platform filter applied', () => {
            filtersStore.togglePlatform('PC');
            expect(filtersStore.isAnyFilterApplied()).toBe(true);
        });

        it('returns true when genre filter applied', () => {
            filtersStore.toggleGenre('RPG');
            expect(filtersStore.isAnyFilterApplied()).toBe(true);
        });

        it('returns true when tier filter applied', () => {
            filtersStore.toggleTier('S - Masterpiece');
            expect(filtersStore.isAnyFilterApplied()).toBe(true);
        });

        it('returns true when coOp filter applied', () => {
            filtersStore.toggleCoOp('Yes');
            expect(filtersStore.isAnyFilterApplied()).toBe(true);
        });

        it('returns false after all filters removed', () => {
            filtersStore.togglePlatform('PC');
            filtersStore.togglePlatform('PC');
            expect(filtersStore.isAnyFilterApplied()).toBe(false);
        });
    });
});

describe('AppStore API', () => {
    beforeEach(() => {
        appStore.setActiveTab('all');
        appStore.setTheme('dark');
    });

    describe('Theme', () => {
        it('setTheme updates theme', () => {
            appStore.setTheme('light');
            const theme = get(appStore.theme);
            expect(theme).toBe('light');
        });

        it('toggleTheme switches between themes', () => {
            appStore.setTheme('dark');
            appStore.toggleTheme();
            expect(get(appStore.theme)).toBe('light');
            appStore.toggleTheme();
            expect(get(appStore.theme)).toBe('dark');
        });
    });

    describe('Active Tab', () => {
        it('setActiveTab updates activeTab', () => {
            appStore.setActiveTab('completed');
            const tab = get(appStore.activeTab);
            expect(tab).toBe('completed');
        });

        it('setActiveTab supports all tabs', () => {
            const tabs: ('all' | 'completed' | 'planned' | 'tierlist')[] = [
                'all',
                'completed',
                'planned',
                'tierlist'
            ];
            tabs.forEach((tab) => {
                appStore.setActiveTab(tab);
                expect(get(appStore.activeTab)).toBe(tab);
            });
        });
    });

    describe('App State', () => {
        it('appState derived reflects current state', () => {
            appStore.setTheme('light');
            appStore.setActiveTab('planned');
            const state = get(appStore.appState);
            expect(state.theme).toBe('light');
            expect(state.activeTab).toBe('planned');
        });
    });
});

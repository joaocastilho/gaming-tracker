import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MobileSearch from '#lib/components/layout/MobileSearch.js';
import MobileSettingsMenu from '#lib/components/layout/MobileSettingsMenu.js';
import { appStore } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { filtersStore } from '#lib/stores/filters.js';
import * as routerBridge from '#lib/utils/routerBridge.js';

describe('MobileSearch', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
	});

	afterEach(() => {
		cleanup();
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
	});

	it('updates store on input, navigates on Enter from home, clears, and closes on Escape', () => {
		const onClose = vi.fn();
		const gotoSpy = vi.spyOn(routerBridge, 'goto').mockResolvedValue(undefined);
		vi.spyOn(routerBridge, 'getCurrentPathname').mockReturnValue('/');

		render(() => <MobileSearch isOpen={true} onClose={onClose} />);
		flush();

		const input = screen.getByRole('textbox', { name: 'Search games' });
		fireEvent.input(input, { target: { value: 'Zelda' } });
		flush();

		expect(filtersStore.searchQuery).toBe('Zelda');

		fireEvent.keyDown(input, { key: 'Enter' });
		expect(gotoSpy).toHaveBeenCalledWith('/library?s=Zelda');

		fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
		flush();
		expect(filtersStore.searchQuery).toBe('');

		fireEvent.keyDown(input, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});

describe('MobileSettingsMenu', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
		filtersStore.setSort(null);
		editorStore.setEditorModeFromSessionCheck(false);
		appStore.setTheme('dark');
	});

	afterEach(() => {
		cleanup();
		vi.useRealTimers();
		filtersStore.resetAllFilters();
		editorStore.setEditorModeFromSessionCheck(false);
	});

	it('shows reset FAB only when filters are active and resets them on click', () => {
		render(() => (
			<MobileSettingsMenu
				isOpen={false}
				isTierlistPage={false}
				onToggle={vi.fn()}
				onClose={vi.fn()}
				onFiltersToggle={vi.fn()}
				onAddGame={vi.fn()}
				onOpenLogin={vi.fn()}
			/>
		));
		flush();

		expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull();

		filtersStore.togglePlatform('PC');
		flush();
		const resetBtn = screen.getByRole('button', { name: 'Reset filters' });
		fireEvent.click(resetBtn);
		flush();

		expect(filtersStore.isAnyFilterApplied()).toBe(false);
		expect(screen.queryByRole('button', { name: 'Reset filters' })).toBeNull();
	});

	it('copies link with inline feedback instead of alert and toggles theme', async () => {
		vi.useFakeTimers();
		const onClose = vi.fn();
		const writeText = vi.fn().mockResolvedValue(undefined);
		Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
		Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

		render(() => (
			<MobileSettingsMenu
				isOpen={true}
				isTierlistPage={false}
				onToggle={vi.fn()}
				onClose={onClose}
				onFiltersToggle={vi.fn()}
				onAddGame={vi.fn()}
				onOpenLogin={vi.fn()}
			/>
		));
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Share' }));
		await Promise.resolve();
		flush();

		expect(writeText).toHaveBeenCalledTimes(1);
		expect(screen.getByText('Link copied!')).toBeTruthy();

		vi.advanceTimersByTime(1200);
		flush();
		expect(onClose).toHaveBeenCalledTimes(1);

		fireEvent.click(screen.getByRole('button', { name: 'Light Mode' }));
		flush();
		expect(appStore.theme).toBe('light');
		expect(onClose).toHaveBeenCalledTimes(2);
	});
});

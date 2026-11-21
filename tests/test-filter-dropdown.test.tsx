import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import FilterDropdown from '#lib/components/FilterDropdown.js';
import FilterToggle from '#lib/components/FilterToggle.js';
import { filtersStore } from '#lib/stores/filters.js';

describe('FilterDropdown', () => {
	beforeEach(() => {
		filtersStore.resetAllFilters();
	});

	afterEach(() => {
		cleanup();
		filtersStore.resetAllFilters();
	});

	it('opens and closes listbox, updates aria-expanded, and closes on Escape and outside click', () => {
		render(() => (
			<FilterDropdown
				type="platforms"
				label="Platforms"
				options={['PC', 'PS5', 'Switch']}
				selectedOptions={filtersStore.selectedPlatforms}
			/>
		));
		flush();

		const trigger = screen.getByRole('button', { name: 'Filter by platforms' });
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('listbox')).toBeNull();

		fireEvent.click(trigger);
		flush();
		expect(trigger.getAttribute('aria-expanded')).toBe('true');
		expect(screen.getByRole('listbox', { name: 'platforms' })).toBeTruthy();

		fireEvent.keyDown(trigger, { key: 'Escape' });
		flush();
		expect(trigger.getAttribute('aria-expanded')).toBe('false');
		expect(screen.queryByRole('listbox')).toBeNull();

		fireEvent.click(trigger);
		flush();
		expect(screen.getByRole('listbox')).toBeTruthy();

		fireEvent.click(document.body);
		flush();
		expect(screen.queryByRole('listbox')).toBeNull();
	});

	it('toggles multi-select options, displays selected count badge, and clears all selections', () => {
		render(() => (
			<FilterDropdown
				type="genres"
				label="Genres"
				options={['RPG', 'Action', 'Indie']}
				selectedOptions={filtersStore.selectedGenres}
			/>
		));
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Filter by genres' }));
		flush();

		const rpgOption = screen.getByRole('option', { name: 'RPG' });
		const indieOption = screen.getByRole('option', { name: 'Indie' });
		expect(rpgOption.getAttribute('aria-selected')).toBe('false');

		fireEvent.click(rpgOption);
		fireEvent.click(indieOption);
		flush();

		expect(filtersStore.selectedGenres).toEqual(['RPG', 'Indie']);
		expect(rpgOption.getAttribute('aria-selected')).toBe('true');
		expect(indieOption.getAttribute('aria-selected')).toBe('true');
		expect(document.querySelector('.selected-count')?.textContent).toBe('2');

		fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
		flush();

		expect(filtersStore.selectedGenres).toEqual([]);
		expect(document.querySelector('.selected-count')).toBeNull();
	});

	it('shows empty state when no options are provided', () => {
		render(() => <FilterDropdown type="tiers" label="Tiers" options={[]} selectedOptions={[]} />);
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Filter by tiers' }));
		flush();

		expect(screen.getByText('No tiers available')).toBeTruthy();
	});
});

describe('FilterToggle', () => {
	beforeEach(() => {
		filtersStore.resetAllFilters();
	});

	afterEach(() => {
		cleanup();
		filtersStore.resetAllFilters();
	});

	it('toggles co-op filter and updates aria-pressed on click and keyboard', () => {
		render(() => <FilterToggle label="Co-op" value="Yes" isSelected={filtersStore.selectedCoOp.includes('Yes')} />);
		flush();

		const btn = screen.getByRole('button', { name: 'Toggle Co-op filter' });
		expect(btn.getAttribute('aria-pressed')).toBe('false');

		fireEvent.click(btn);
		flush();
		expect(filtersStore.selectedCoOp).toContain('Yes');
		expect(btn.getAttribute('aria-pressed')).toBe('true');

		fireEvent.keyDown(btn, { key: 'Enter' });
		flush();
		expect(filtersStore.selectedCoOp).not.toContain('Yes');
		expect(btn.getAttribute('aria-pressed')).toBe('false');
	});
});

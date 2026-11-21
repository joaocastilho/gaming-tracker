import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import RatingsSort from '#lib/components/RatingsSort.js';
import { appStore } from '#lib/stores/app.js';
import { filtersStore } from '#lib/stores/filters.js';

describe('RatingsSort', () => {
	beforeEach(() => {
		filtersStore.resetAllFilters();
		filtersStore.setSort(null);
		appStore.setActiveTab('library');
	});

	afterEach(() => {
		cleanup();
		filtersStore.resetAllFilters();
		filtersStore.setSort(null);
		appStore.setActiveTab('library');
	});

	it('defaults to Alphabetical asc on library tab and toggles direction on repeat click', () => {
		render(() => <RatingsSort />);
		flush();

		const alphaBtn = screen.getByRole('button', { name: 'Sort Alphabetically' });
		const scoreBtn = screen.getByRole('button', { name: 'Sort by Score' });
		expect(alphaBtn.getAttribute('aria-pressed')).toBe('true');
		expect(scoreBtn.getAttribute('aria-pressed')).toBe('false');
		expect(screen.queryByRole('button', { name: /Hours Played|Time to Beat/i })).toBeNull();

		fireEvent.click(alphaBtn);
		flush();
		expect(filtersStore.state?.sortOption).toEqual({ key: 'alphabetical', direction: 'desc' });

		fireEvent.click(scoreBtn);
		flush();
		expect(filtersStore.state?.sortOption).toEqual({ key: 'score', direction: 'desc' });
		expect(scoreBtn.getAttribute('aria-pressed')).toBe('true');
		expect(alphaBtn.getAttribute('aria-pressed')).toBe('false');

		fireEvent.click(scoreBtn);
		flush();
		expect(filtersStore.state?.sortOption).toEqual({ key: 'score', direction: 'asc' });
	});

	it('shows Hours Played and defaults to Finished Date on completed tab', () => {
		appStore.setActiveTab('completed');
		render(() => <RatingsSort />);
		flush();

		expect(screen.getByRole('button', { name: 'Sort by Finishing Date' }).getAttribute('aria-pressed')).toBe('true');
		const hoursBtn = screen.getByRole('button', { name: 'Sort by Hours Played' });
		expect(hoursBtn).toBeTruthy();

		fireEvent.click(hoursBtn);
		flush();
		expect(filtersStore.state?.sortOption).toEqual({ key: 'playtime', direction: 'desc' });
	});

	it('hides ratings/finishedDate and shows Time to Beat on planned tab', () => {
		appStore.setActiveTab('planned');
		render(() => <RatingsSort />);
		flush();

		expect(screen.getByRole('button', { name: 'Sort Alphabetically' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Sort by Time to Beat' })).toBeTruthy();
		expect(screen.queryByRole('button', { name: 'Sort by Score' })).toBeNull();
		expect(screen.queryByRole('button', { name: 'Sort by Finishing Date' })).toBeNull();
	});
});

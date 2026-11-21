import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Header from '#lib/components/Header.js';
import { appStore } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { filtersStore } from '#lib/stores/filters.js';
import { gamesStore } from '#lib/stores/games.js';
import * as navigationUtils from '#lib/utils/navigationUtils.js';
import * as routerBridge from '#lib/utils/routerBridge.js';
import { createCompletedGame, createTestGame } from './helpers/factories.js';

describe('Header', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		appStore.setActiveTab('library');
		filtersStore.resetAllFilters();
		filtersStore.setDesktopSearchOpen(false);
		editorStore.setEditorModeFromSessionCheck(false);
		gamesStore.initializeGames(
			[
				createCompletedGame({ id: 'c1', title: 'Completed One' }),
				createCompletedGame({ id: 'c2', title: 'Completed Two' }),
				createTestGame({ id: 'p1', title: 'Planned One', status: 'Planned' }),
			],
			{ persist: false }
		);
	});

	afterEach(() => {
		cleanup();
		editorStore.setEditorModeFromSessionCheck(false);
		filtersStore.setDesktopSearchOpen(false);
	});

	it('renders all 6 navigation tabs with counts and marks active tab', () => {
		render(() => <Header />);
		flush();

		expect(screen.getByRole('button', { name: 'Home' })).toBeTruthy();
		const libraryBtn = screen.getByRole('button', { name: 'Library' });
		expect(libraryBtn.getAttribute('aria-current')).toBe('page');
		expect(libraryBtn.classList.contains('active')).toBe(true);

		expect(screen.getByRole('button', { name: 'Completed' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Planned' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Tier List' })).toBeTruthy();
		expect(screen.getByRole('button', { name: 'Stats' })).toBeTruthy();

		const badges = Array.from(document.querySelectorAll('.count-badge')).map((el) => el.textContent);
		expect(badges).toEqual(['3', '2', '1']);
	});

	it('navigates when tabs are clicked', async () => {
		const gotoSpy = vi.spyOn(routerBridge, 'goto').mockResolvedValue(undefined);
		const navSpy = vi.spyOn(navigationUtils, 'navigateTo').mockResolvedValue(undefined);

		render(() => <Header />);
		flush();

		fireEvent.click(screen.getByRole('button', { name: 'Home' }));
		expect(gotoSpy).toHaveBeenCalledWith('/');

		fireEvent.click(screen.getByRole('button', { name: 'Completed' }));
		expect(navSpy).toHaveBeenCalledWith('completed', expect.objectContaining({ replaceState: true }));
	});

	it('toggles desktop search and updates aria-expanded', () => {
		vi.spyOn(routerBridge, 'getCurrentPathname').mockReturnValue('/library');
		render(() => <Header />);
		flush();

		const searchBtn = screen.getByRole('button', { name: 'Show search' });
		expect(searchBtn.getAttribute('aria-expanded')).toBe('false');

		fireEvent.click(searchBtn);
		flush();

		expect(filtersStore.isDesktopSearchOpen).toBe(true);
		expect(screen.getByRole('button', { name: 'Hide search' }).getAttribute('aria-expanded')).toBe('true');
	});

	it('switches between Login button and Editor Mode controls (Add Game / Logout)', () => {
		const onOpenLogin = vi.fn();
		const onAddGame = vi.fn();
		const logoutSpy = vi.spyOn(editorStore, 'logout').mockResolvedValue(undefined);

		render(() => <Header onOpenLogin={onOpenLogin} onAddGame={onAddGame} />);
		flush();

		const loginBtn = screen.getByTitle('Login');
		expect(screen.queryByTitle('Add new game')).toBeNull();
		fireEvent.click(loginBtn);
		expect(onOpenLogin).toHaveBeenCalledTimes(1);

		editorStore.setEditorModeFromSessionCheck(true);
		flush();

		const addBtn = screen.getByTitle('Add new game');
		fireEvent.click(addBtn);
		expect(onAddGame).toHaveBeenCalledTimes(1);

		const logoutBtn = screen.getByTitle('Logout');
		fireEvent.click(logoutBtn);
		expect(logoutSpy).toHaveBeenCalledTimes(1);
	});
});

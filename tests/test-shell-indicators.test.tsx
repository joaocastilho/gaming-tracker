import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NoResults from '#lib/components/NoResults.js';
import OfflineIndicator from '#lib/components/OfflineIndicator.js';
import SkeletonGrid from '#lib/components/SkeletonGrid.js';
import ThemeToggle from '#lib/components/ThemeToggle.js';
import { appStore } from '#lib/stores/app.js';
import { editorStore } from '#lib/stores/editor.js';
import { offlineStore } from '#lib/stores/offline.js';
import * as routerBridge from '#lib/utils/routerBridge.js';
import LoginPage from '../src/pages/LoginPage.js';
import NotFoundPage from '../src/pages/NotFoundPage.js';

describe('Shell indicators & utility pages', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		appStore.setTheme('dark');
		editorStore.setEditorModeFromSessionCheck(false);
		offlineStore.isOnline = true;
		offlineStore.hasPendingSync = false;
		offlineStore.isSyncing = false;
	});

	afterEach(() => {
		cleanup();
		appStore.setTheme('dark');
		editorStore.setEditorModeFromSessionCheck(false);
		offlineStore.isOnline = true;
		offlineStore.hasPendingSync = false;
		offlineStore.isSyncing = false;
	});

	it('ThemeToggle switches theme and updates aria-label', () => {
		render(() => <ThemeToggle />);
		flush();

		const btn = screen.getByRole('button', { name: 'Switch to light mode' });
		fireEvent.click(btn);
		flush();

		expect(appStore.theme).toBe('light');
		expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
	});

	it('OfflineIndicator renders status role for offline, pending sync, and syncing states', () => {
		render(() => <OfflineIndicator />);
		flush();
		expect(screen.queryByRole('status')).toBeNull();

		offlineStore.isOnline = false;
		flush();
		expect(screen.getByRole('status').textContent).toContain('Offline');

		offlineStore.isOnline = true;
		offlineStore.hasPendingSync = true;
		flush();
		expect(screen.getByRole('status').textContent).toContain('Pending Sync');

		offlineStore.isSyncing = true;
		flush();
		expect(screen.getByRole('status').textContent).toContain('Syncing...');
	});

	it('NoResults renders custom message and invokes onReset', () => {
		const onReset = vi.fn();
		render(() => <NoResults message="Empty shelf" description="Add some games" onReset={onReset} />);
		flush();

		expect(screen.getByText('Empty shelf')).toBeTruthy();
		expect(screen.getByText('Add some games')).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: 'Clear all filters' }));
		expect(onReset).toHaveBeenCalledTimes(1);
	});

	it('SkeletonGrid renders 20 placeholder cards via Repeat', () => {
		render(() => <SkeletonGrid />);
		flush();
		expect(document.querySelectorAll('.skeleton-card').length).toBe(20);
	});

	it('NotFoundPage renders error details and navigates home via SPA goto', () => {
		const gotoSpy = vi.spyOn(routerBridge, 'goto').mockResolvedValue(undefined);
		render(() => <NotFoundPage status={404} message="Page Missing" />);
		flush();

		expect(screen.getByText('404')).toBeTruthy();
		expect(screen.getByText('Page Missing')).toBeTruthy();
		fireEvent.click(screen.getByRole('link', { name: /Back to Home/i }));
		expect(gotoSpy).toHaveBeenCalledWith('/');
	});

	it('LoginPage allows reopening LoginModal after closing it', () => {
		render(() => <LoginPage />);
		flush();

		expect(screen.getByRole('dialog')).toBeTruthy();
		fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
		flush();

		expect(screen.queryByRole('dialog')).toBeNull();
		const reopenBtn = screen.getByRole('button', { name: 'Sign in' });
		fireEvent.click(reopenBtn);
		flush();
		expect(screen.getByRole('dialog')).toBeTruthy();
	});
});

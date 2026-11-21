import { render, screen, waitFor } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitialFilters, filtersStore } from '#lib/stores/filters.js';
import KeyboardSearchHarness from './components/KeyboardSearchHarness.js';
import { setViewportWidth } from './setup';

vi.mock('#lib/utils/env.js', () => ({
	browser: true,
	dev: false,
}));

vi.mock('#lib/stores/searchClearCoordinator.js', () => ({
	markSearchCleared: vi.fn(),
	lastManualClearTime: 0,
}));

function pressCtrlSlash(): void {
	window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
	flush();
}

describe('Keyboard search toggle', () => {
	beforeEach(() => {
		setViewportWidth(1024);
		Object.defineProperty(navigator, 'platform', {
			value: 'Win32',
			configurable: true,
		});
		filtersStore.set(createInitialFilters());
		filtersStore.setDesktopSearchOpen(false);
	});

	it('renders search bar when initially open (await import)', async () => {
		filtersStore.setDesktopSearchOpen(true);
		render(() => <KeyboardSearchHarness />);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
		});
	});

	it('opens the search bar with Ctrl+/', async () => {
		render(() => <KeyboardSearchHarness />);
		expect(screen.queryByPlaceholderText('Search games...')).not.toBeInTheDocument();

		pressCtrlSlash();

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
		});
	});

	it('closes the search bar with a second Ctrl+/', async () => {
		render(() => <KeyboardSearchHarness />);
		pressCtrlSlash();

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
		});

		pressCtrlSlash();

		await waitFor(() => {
			expect(screen.queryByPlaceholderText('Search games...')).not.toBeInTheDocument();
		});
	});
});

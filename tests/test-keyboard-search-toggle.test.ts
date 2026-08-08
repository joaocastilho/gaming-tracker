import { render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import KeyboardSearchHarness from './components/KeyboardSearchHarness.svelte';
import { filtersStore, createInitialFilters } from '$lib/stores/filters.svelte';
import { setViewportWidth } from './setup';

vi.mock('$app/state', () => ({
	page: {
		state: {},
	},
}));

vi.mock('$app/navigation', () => ({
	replaceState: vi.fn(),
}));

vi.mock('$app/environment', () => ({
	browser: true,
}));

vi.mock('$lib/stores/searchClearCoordinator', () => ({
	markSearchCleared: vi.fn(),
	lastManualClearTime: 0,
}));

function pressCtrlSlash() {
	window.dispatchEvent(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
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
		render(KeyboardSearchHarness);

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
		});
	});

	it('opens the search bar with Ctrl+/', async () => {
		render(KeyboardSearchHarness);
		expect(screen.queryByPlaceholderText('Search games...')).not.toBeInTheDocument();

		pressCtrlSlash();

		await waitFor(() => {
			expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
		});
	});

	it('closes the search bar with a second Ctrl+/', async () => {
		render(KeyboardSearchHarness);
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

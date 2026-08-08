import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGlobalKeydownHandler } from '$lib/utils/keyboardShortcuts';
import { setViewportWidth, resetViewport } from './setup';

describe('createGlobalKeydownHandler (mobile path)', () => {
	let isSearchOpen = false;
	const onSearchToggle = vi.fn(() => {
		isSearchOpen = !isSearchOpen;
	});
	const onDesktopSearch = vi.fn();

	function pressCtrlSlash() {
		const handler = createGlobalKeydownHandler(() => ({
			onSearchToggle,
			onDesktopSearch,
		}));
		handler(new KeyboardEvent('keydown', { key: '/', ctrlKey: true, bubbles: true, cancelable: true }));
	}

	beforeEach(() => {
		vi.clearAllMocks();
		isSearchOpen = false;
		setViewportWidth(600);
		Object.defineProperty(navigator, 'platform', {
			value: 'Win32',
			configurable: true,
		});
	});

	afterEach(() => {
		resetViewport();
	});

	it('toggles the mobile search open and closed on repeated Ctrl+/ presses', () => {
		pressCtrlSlash();
		expect(onSearchToggle).toHaveBeenCalledTimes(1);
		expect(isSearchOpen).toBe(true);

		pressCtrlSlash();
		expect(onSearchToggle).toHaveBeenCalledTimes(2);
		expect(isSearchOpen).toBe(false);
	});

	it('never routes to the desktop path when below the 768px breakpoint', () => {
		pressCtrlSlash();

		expect(onSearchToggle).toHaveBeenCalledTimes(1);
		expect(onDesktopSearch).not.toHaveBeenCalled();
	});
});

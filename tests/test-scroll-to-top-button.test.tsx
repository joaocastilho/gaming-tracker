import { fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ScrollToTopButton from '#lib/components/ScrollToTopButton.js';

vi.mock('#lib/stores/modal.js', () => ({
	modalStore: {
		getState: () => ({ isOpen: false }),
	},
}));

describe('ScrollToTopButton Component', () => {
	let originalScrollY: number;

	beforeEach(() => {
		vi.useFakeTimers();
		originalScrollY = window.scrollY;
		Object.defineProperty(window, 'scrollY', {
			value: 0,
			writable: true,
			configurable: true,
		});

		window.scrollTo = vi.fn();
	});

	afterEach(() => {
		vi.useRealTimers();
		window.scrollY = originalScrollY;
		vi.restoreAllMocks();
	});

	it('should not be visible initially when scroll position is 0', () => {
		render(() => <ScrollToTopButton />);
		const button = screen.queryByRole('button', { name: /Scroll to top/i });
		expect(button).toBeNull();
	});

	it('should become visible when scrolling past 300px', async () => {
		render(() => <ScrollToTopButton />);

		window.scrollY = 350;
		window.dispatchEvent(new Event('scroll'));

		vi.runAllTimers();
		flush();

		const button = screen.queryByRole('button', { name: /Scroll to top/i });
		expect(button).toBeInTheDocument();
	});

	it('should trigger custom animation when clicked', async () => {
		render(() => <ScrollToTopButton />);

		window.scrollY = 500;
		window.dispatchEvent(new Event('scroll'));
		vi.runAllTimers();
		flush();

		const button = screen.getByRole('button', { name: /Scroll to top/i });
		expect(button).toBeInTheDocument();

		await fireEvent.click(button);
		vi.runAllTimers();
		flush();

		expect(window.scrollTo).toHaveBeenCalled();
	});
});

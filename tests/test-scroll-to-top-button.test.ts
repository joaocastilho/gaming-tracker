import { render, fireEvent, screen, act } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';

// Mock the modal store
vi.mock('$lib/stores/modal.svelte', () => ({
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

		// Mock scrollTo
		window.scrollTo = vi.fn();
	});

	afterEach(() => {
		vi.useRealTimers();
		window.scrollY = originalScrollY;
		vi.restoreAllMocks();
	});

	it('should not be visible initially when scroll position is 0', () => {
		render(ScrollToTopButton);
		const button = screen.queryByRole('button', { name: /Scroll to top/i });
		expect(button).toBeNull();
	});

	it('should become visible when scrolling past 300px', async () => {
		render(ScrollToTopButton);

		// Simulate scroll past 300px
		window.scrollY = 350;
		window.dispatchEvent(new Event('scroll'));

		// Run requestAnimationFrame ticking
		await act(() => {
			vi.runAllTimers();
		});

		const button = screen.queryByRole('button', { name: /Scroll to top/i });
		expect(button).toBeInTheDocument();
	});

	it('should trigger custom animation when clicked', async () => {
		render(ScrollToTopButton);

		// Make visible
		window.scrollY = 500;
		window.dispatchEvent(new Event('scroll'));
		await act(() => {
			vi.runAllTimers();
		});

		const button = screen.getByRole('button', { name: /Scroll to top/i });
		expect(button).toBeInTheDocument();

		// Trigger click
		await fireEvent.click(button);

		// Run animations (requestAnimationFrame loop)
		await act(() => {
			vi.runAllTimers();
		});

		expect(window.scrollTo).toHaveBeenCalled();
	});
});

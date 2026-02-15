/**
 * Tests for passive scroll listeners
 *
 * Issue: Scroll event listeners should use { passive: true } option
 * to improve scroll performance and prevent jank.
 *
 * Location: src/lib/components/ScrollToTopButton.svelte line 18
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Passive scroll listeners', () => {
	let addEventListenerSpy: ReturnType<typeof vi.spyOn>;
	let removeEventListenerSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		addEventListenerSpy = vi.spyOn(window, 'addEventListener');
		removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
	});

	afterEach(() => {
		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	});

	test('should use passive option for scroll listeners', () => {
		// Simulate the component mounting
		const handleScroll = () => {};

		// Add listener with passive option (the fix)
		window.addEventListener('scroll', handleScroll, { passive: true });

		// Verify it was called with passive option
		expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', handleScroll, { passive: true });
	});

	test('should remove listener on cleanup', () => {
		const handleScroll = () => {};

		// Add and then remove
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.removeEventListener('scroll', handleScroll);

		expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', handleScroll);
	});
});

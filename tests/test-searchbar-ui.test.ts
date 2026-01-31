/**
 * SearchBar UI Tests
 * Tests that verify the SearchBar component's UI interactions including:
 * - Debounced input handling
 * - Clear button functionality
 * - Focus behavior and keyboard interactions
 */
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '$lib/components/SearchBar.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';

// Mock the stores and app modules
vi.mock('$app/state', () => ({
	page: {
		state: {}
	}
}));

vi.mock('$app/navigation', () => ({
	replaceState: vi.fn()
}));

vi.mock('$app/environment', () => ({
	browser: true
}));

vi.mock('$lib/stores/searchClearCoordinator', () => ({
	markSearchCleared: vi.fn()
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => null;
	return {
		X: MockIcon
	};
});

describe('SearchBar UI', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		filtersStore.initializeForTesting();
		filtersStore.setSearchTerm('');
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe('Debounced Input', () => {
		it('should not update store immediately on input', async () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });

			await fireEvent.input(input, { target: { value: 'Zelda' } });

			// Store should not be updated immediately
			expect(filtersStore.state?.searchTerm).toBe('');
		});

		it('should update store after 300ms debounce', async () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });

			await fireEvent.input(input, { target: { value: 'Zelda' } });

			// Advance timers by 300ms (debounce time)
			vi.advanceTimersByTime(300);

			expect(filtersStore.state?.searchTerm).toBe('Zelda');
		});

		it('should only trigger one update for rapid typing', async () => {
			const setSearchTermSpy = vi.spyOn(filtersStore, 'setSearchTerm');
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });

			// Simulate rapid typing
			await fireEvent.input(input, { target: { value: 'Z' } });
			vi.advanceTimersByTime(100);
			await fireEvent.input(input, { target: { value: 'Ze' } });
			vi.advanceTimersByTime(100);
			await fireEvent.input(input, { target: { value: 'Zel' } });
			vi.advanceTimersByTime(100);
			await fireEvent.input(input, { target: { value: 'Zeld' } });
			vi.advanceTimersByTime(100);
			await fireEvent.input(input, { target: { value: 'Zelda' } });

			// Before debounce completes - no calls yet
			expect(setSearchTermSpy).not.toHaveBeenCalled();

			// Complete the debounce
			vi.advanceTimersByTime(300);

			// Should only have been called once with final value
			expect(setSearchTermSpy).toHaveBeenCalledTimes(1);
			expect(setSearchTermSpy).toHaveBeenCalledWith('Zelda');
		});

		it('should cancel pending debounce when new input arrives', async () => {
			const setSearchTermSpy = vi.spyOn(filtersStore, 'setSearchTerm');
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });

			// First input
			await fireEvent.input(input, { target: { value: 'Mario' } });
			vi.advanceTimersByTime(200); // Partial debounce

			// Second input before first completes
			await fireEvent.input(input, { target: { value: 'Luigi' } });
			vi.advanceTimersByTime(300); // Complete second debounce

			// Only the second input should have been applied
			expect(setSearchTermSpy).toHaveBeenCalledTimes(1);
			expect(setSearchTermSpy).toHaveBeenCalledWith('Luigi');
		});
	});

	describe('Clear Button', () => {
		it('should show clear button when searchTerm exists in store', async () => {
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			await waitFor(() => {
				expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
			});
		});

		it('should hide clear button when searchTerm is empty', async () => {
			filtersStore.setSearchTerm('');
			render(SearchBar);

			expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
		});

		it('should immediately clear store when clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);

			// Store should be cleared immediately (no debounce)
			expect(filtersStore.state?.searchTerm).toBe('');
		});

		it('should cancel pending debounce when clear is clicked', async () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });

			// Type something
			await fireEvent.input(input, { target: { value: 'Zelda' } });
			vi.advanceTimersByTime(300);

			// Now we have a search term
			expect(filtersStore.state?.searchTerm).toBe('Zelda');

			// Type more
			await fireEvent.input(input, { target: { value: 'Zelda 2' } });
			vi.advanceTimersByTime(100); // Partial debounce

			// Clear before debounce completes
			const clearButton = screen.getByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);

			// Complete any pending timers
			vi.advanceTimersByTime(300);

			// Store should be empty (clear overrides pending debounce)
			expect(filtersStore.state?.searchTerm).toBe('');
		});

		it('should call markSearchCleared when clear is clicked', async () => {
			const { markSearchCleared } = await import('$lib/stores/searchClearCoordinator');
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);

			expect(markSearchCleared).toHaveBeenCalled();
		});

		it('should clear URL search param when clear is clicked', async () => {
			const { replaceState } = await import('$app/navigation');
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);

			expect(replaceState).toHaveBeenCalled();
		});
	});

	describe('Focus Behavior', () => {
		it('should auto-focus input on mount', async () => {
			render(SearchBar);

			await waitFor(() => {
				const input = screen.getByRole('textbox', { name: /search games/i });
				expect(document.activeElement).toBe(input);
			});
		});

		it('should select all text when Escape is pressed while focused', async () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;

			// Set a value
			input.value = 'test search';
			await fireEvent.focus(input);

			// Spy on select method
			const selectSpy = vi.spyOn(input, 'select');

			await fireEvent.keyDown(input, { key: 'Escape' });

			expect(selectSpy).toHaveBeenCalled();
		});

		it('should refocus input after clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const input = screen.getByRole('textbox', { name: /search games/i });
			const clearButton = await screen.findByRole('button', { name: /clear search/i });

			await fireEvent.click(clearButton);

			// Allow requestAnimationFrame to execute
			vi.advanceTimersByTime(16);

			await waitFor(() => {
				expect(document.activeElement).toBe(input);
			});
		});
	});

	describe('Input Sync', () => {
		it('should initialize input value from store on mount', async () => {
			filtersStore.setSearchTerm('initial value');
			render(SearchBar);

			await waitFor(() => {
				const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;
				expect(input.value).toBe('initial value');
			});
		});

		it('should clear input value when clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;
			await waitFor(() => {
				expect(input.value).toBe('test');
			});

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);

			expect(input.value).toBe('');
		});
	});

	describe('Accessibility', () => {
		it('should have proper aria-label on input', () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('aria-label', 'Search games');
		});

		it('should have proper aria-label on clear button', async () => {
			filtersStore.setSearchTerm('test');
			render(SearchBar);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
		});

		it('should have autocomplete off for security', () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('autocomplete', 'off');
		});

		it('should have spellcheck disabled', () => {
			render(SearchBar);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('spellcheck', 'false');
		});
	});
});

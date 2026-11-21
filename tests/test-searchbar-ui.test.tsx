import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '#lib/components/SearchBar.js';
import { createInitialFilters, filtersStore } from '#lib/stores/filters.js';

vi.mock('#lib/utils/routerBridge.js', () => ({
	goto: vi.fn(),
	getCurrentPageState: () => ({}),
	getCurrentPathname: () => '/library',
}));

vi.mock('#lib/utils/env.js', () => ({
	browser: true,
	dev: false,
}));

vi.mock('#lib/stores/searchClearCoordinator.js', () => ({
	markSearchCleared: vi.fn(),
	lastManualClearTime: 0,
}));

describe('SearchBar UI', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		filtersStore.set(createInitialFilters());
		filtersStore.setSearchTerm('');
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	describe('Input Handling', () => {
		it('should update store immediately on input', async () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i });

			await fireEvent.input(input, { target: { value: 'Zelda' } });
			flush();

			expect(filtersStore.searchQuery).toBe('Zelda');
		});
	});

	describe('Clear Button', () => {
		it('should show clear button when searchTerm exists in store', async () => {
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			await waitFor(() => {
				expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
			});
		});

		it('should hide clear button when searchTerm is empty', async () => {
			filtersStore.setSearchTerm('');
			render(() => <SearchBar />);

			expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();
		});

		it('should immediately clear store when clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);
			flush();

			expect(filtersStore.state?.searchTerm).toBe('');
		});

		it('should cancel pending debounce when clear is clicked', async () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i });

			await fireEvent.input(input, { target: { value: 'Zelda' } });
			flush();
			vi.advanceTimersByTime(300);

			expect(filtersStore.state?.searchTerm).toBe('Zelda');

			await fireEvent.input(input, { target: { value: 'Zelda 2' } });
			flush();
			vi.advanceTimersByTime(100);

			const clearButton = screen.getByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);
			flush();

			vi.advanceTimersByTime(300);

			expect(filtersStore.state?.searchTerm).toBe('');
		});

		it('should call markSearchCleared when clear is clicked', async () => {
			const { markSearchCleared } = await import('#lib/stores/searchClearCoordinator.js');
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);
			flush();

			expect(markSearchCleared).toHaveBeenCalled();
		});

		it('should clear URL search param when clear is clicked', async () => {
			const { goto } = await import('#lib/utils/routerBridge.js');
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);
			flush();

			expect(goto).toHaveBeenCalled();
		});
	});

	describe('Focus Behavior', () => {
		it('should auto-focus input on mount', async () => {
			render(() => <SearchBar />);
			flush();

			await waitFor(() => {
				const input = screen.getByRole('textbox', { name: /search games/i });
				expect(document.activeElement).toBe(input);
			});
		});

		it('should select all text when Escape is pressed while focused', async () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;

			input.value = 'test search';
			await fireEvent.focus(input);

			const selectSpy = vi.spyOn(input, 'select');

			await fireEvent.keyDown(input, { key: 'Escape' });

			expect(selectSpy).toHaveBeenCalled();
		});

		it('should refocus input after clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const input = screen.getByRole('textbox', { name: /search games/i });
			const clearButton = await screen.findByRole('button', { name: /clear search/i });

			await fireEvent.click(clearButton);
			flush();

			vi.advanceTimersByTime(16);

			await waitFor(() => {
				expect(document.activeElement).toBe(input);
			});
		});
	});

	describe('Input Sync', () => {
		it('should initialize input value from store on mount', async () => {
			filtersStore.setSearchTerm('initial value');
			render(() => <SearchBar />);

			await waitFor(() => {
				const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;
				expect(input.value).toBe('initial value');
			});
		});

		it('should clear input value when clear button is clicked', async () => {
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const input = screen.getByRole('textbox', { name: /search games/i }) as HTMLInputElement;
			await waitFor(() => {
				expect(input.value).toBe('test');
			});

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			await fireEvent.click(clearButton);
			flush();

			expect(input.value).toBe('');
		});
	});

	describe('Accessibility', () => {
		it('should have proper aria-label on input', () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('aria-label', 'Search games');
		});

		it('should have proper aria-label on clear button', async () => {
			filtersStore.setSearchTerm('test');
			render(() => <SearchBar />);

			const clearButton = await screen.findByRole('button', { name: /clear search/i });
			expect(clearButton).toHaveAttribute('aria-label', 'Clear search');
		});

		it('should have autocomplete off for security', () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('autocomplete', 'off');
		});

		it('should have spellcheck disabled', () => {
			render(() => <SearchBar />);
			const input = screen.getByRole('textbox', { name: /search games/i });
			expect(input).toHaveAttribute('spellcheck', 'false');
		});
	});
});

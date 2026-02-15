import { render, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SearchBar from '$lib/components/SearchBar.svelte';

// Use hoisted state for mutable mock values
const mocks = vi.hoisted(() => ({
	searchTerm: ''
}));

// Mock stores
vi.mock('$lib/stores/filters.svelte', () => ({
	filtersStore: {
		get searchTerm() {
			return mocks.searchTerm;
		},
		setSearchTerm: vi.fn(),
		writeSearchToURL: vi.fn(),
		subscribe: vi.fn((cb: (value: unknown) => void) => {
			cb({ searchTerm: mocks.searchTerm });
			return () => {};
		})
	}
}));

vi.mock('$lib/stores/searchClearCoordinator', () => ({
	markSearchCleared: vi.fn()
}));

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

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => ({ html: '<i>Icon</i>' });
	return {
		X: MockIcon
	};
});

describe('SearchBar Component', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.clearAllMocks();
		mocks.searchTerm = '';
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Rendering', () => {
		it('renders search input with placeholder', () => {
			render(SearchBar);
			const input = screen.getByPlaceholderText('Search games... (Ctrl+K)');
			expect(input).toBeInTheDocument();
		});

		it('renders search icon', () => {
			render(SearchBar);
			expect(screen.getByText('🔍')).toBeInTheDocument();
		});

		it('has correct aria-label for accessibility', () => {
			render(SearchBar);
			const input = screen.getByLabelText('Search games');
			expect(input).toBeInTheDocument();
		});
	});

	describe('Clear Button', () => {
		it('shows clear button when searchTerm is not empty', () => {
			mocks.searchTerm = 'test';
			render(SearchBar);
			const clearButton = screen.getByLabelText('Clear search');
			expect(clearButton).toBeInTheDocument();
		});

		it('hides clear button when searchTerm is empty', () => {
			mocks.searchTerm = '';
			render(SearchBar);
			const clearButton = screen.queryByLabelText('Clear search');
			expect(clearButton).not.toBeInTheDocument();
		});
	});

	describe('Input Behavior', () => {
		it('has autocomplete disabled', () => {
			render(SearchBar);
			const input = screen.getByLabelText('Search games') as HTMLInputElement;
			expect(input.autocomplete).toBe('off');
		});

		it('has spellcheck disabled', () => {
			render(SearchBar);
			const input = screen.getByLabelText('Search games') as HTMLInputElement;
			expect(input.getAttribute('spellcheck')).toBe('false');
		});
	});
});

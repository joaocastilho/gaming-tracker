import { render, screen } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '#lib/components/SearchBar.js';

const mocks = vi.hoisted(() => ({
	searchTerm: '',
}));

vi.mock('#lib/stores/filters.js', () => ({
	filtersStore: {
		get searchTerm() {
			return mocks.searchTerm;
		},
		get searchQuery() {
			return mocks.searchTerm;
		},
		set searchQuery(val: string) {
			mocks.searchTerm = val;
		},
		setSearchTerm: vi.fn((val: string) => {
			mocks.searchTerm = val;
		}),
		writeSearchToURL: vi.fn(),
		subscribe: vi.fn((cb: (value: unknown) => void) => {
			cb({ searchTerm: mocks.searchTerm });
			return () => {};
		}),
	},
}));

vi.mock('#lib/stores/searchClearCoordinator.js', () => ({
	markSearchCleared: vi.fn(),
	lastManualClearTime: 0,
}));

vi.mock('#lib/utils/env.js', () => ({
	browser: true,
	dev: false,
}));

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
			render(() => <SearchBar />);
			const input = screen.getByPlaceholderText('Search games...');
			expect(input).toBeInTheDocument();
		});

		it('renders search icon', () => {
			render(() => <SearchBar />);
			expect(screen.getByText('🔍')).toBeInTheDocument();
		});

		it('has correct aria-label for accessibility', () => {
			render(() => <SearchBar />);
			const input = screen.getByLabelText('Search games');
			expect(input).toBeInTheDocument();
		});
	});

	describe('Clear Button', () => {
		it('shows clear button when searchTerm is not empty', () => {
			mocks.searchTerm = 'test';
			render(() => <SearchBar />);
			const clearButton = screen.getByLabelText('Clear search');
			expect(clearButton).toBeInTheDocument();
		});

		it('hides clear button when searchTerm is empty', () => {
			mocks.searchTerm = '';
			render(() => <SearchBar />);
			const clearButton = screen.queryByLabelText('Clear search');
			expect(clearButton).not.toBeInTheDocument();
		});
	});

	describe('Input Behavior', () => {
		it('has autocomplete disabled', () => {
			render(() => <SearchBar />);
			const input = screen.getByLabelText('Search games') as HTMLInputElement;
			expect(input.autocomplete).toBe('off');
		});

		it('has spellcheck disabled', () => {
			render(() => <SearchBar />);
			const input = screen.getByLabelText('Search games') as HTMLInputElement;
			expect(input.getAttribute('spellcheck')).toBe('false');
		});
	});
});

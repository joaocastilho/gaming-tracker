import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MobileFilters from '#lib/components/MobileFilters.js';

vi.mock('#lib/stores/filters.js', () => {
	const mockStore = {
		togglePlatform: vi.fn(),
		toggleGenre: vi.fn(),
		toggleTier: vi.fn(),
		toggleCoOp: vi.fn(),
		setFilters: vi.fn(),
		resetAllFilters: vi.fn(),
		setSearchTerm: vi.fn(),
		setSort: vi.fn(),
		isAnyFilterApplied: vi.fn(() => false),
		isSortModified: vi.fn(() => false),
		platforms: [],
		genres: [],
		tiers: [],
		coOp: [],
		subscribe: vi.fn((run) => {
			run({
				searchTerm: '',
				platforms: [],
				genres: [],
				statuses: [],
				tiers: [],
				coOp: [],
				sortOption: null,
			});
			return () => {};
		}),
	};
	return {
		filtersStore: mockStore,
	};
});

vi.mock('#lib/components/RatingsSort.js', () => ({
	default: () => null,
}));

describe('MobileFilters UI', () => {
	const mockFilterOptions = {
		platforms: ['PC', 'PlayStation', 'Nintendo Switch', 'Xbox'],
		genres: ['RPG', 'Action', 'Adventure', 'Platformer'],
		tiers: ['S - Masterpiece', 'A - Amazing', 'B - Good', 'C - Okay'],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		document.body.style.overflow = '';
	});

	describe('Modal Opening and Closing', () => {
		it('should render when isOpen is true', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('should not render when isOpen is false', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={false} />);
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('should call onClose when backdrop is clicked', async () => {
			const onClose = vi.fn();
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} onClose={onClose} />);
			const backdrop = screen.getByLabelText('Apply filters and close');
			await fireEvent.click(backdrop);
			flush();
			expect(onClose).toHaveBeenCalled();
		});

		it('should call onClose when Escape is pressed', async () => {
			const onClose = vi.fn();
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} onClose={onClose} />);
			const dialog = screen.getByRole('dialog');
			await fireEvent.keyDown(dialog, { key: 'Escape' });
			flush();
			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('Filter Selection', () => {
		it('should open platforms popup when Platforms button is clicked', async () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);

			const popupCountBefore = document.querySelectorAll('.filter-popup-overlay').length;

			const platformsButton = screen.getAllByText('Platforms')[0].closest('button');
			await fireEvent.click(platformsButton as HTMLElement);
			flush();

			await waitFor(() => {
				const popupCountAfter = document.querySelectorAll('.filter-popup-overlay').length;
				expect(popupCountAfter).toBeGreaterThan(popupCountBefore);
			});
		});

		it('should show count badge when items are selected', async () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);

			const platformsButton = screen.getByText('Platforms').closest('button');
			await fireEvent.click(platformsButton as HTMLElement);
			flush();

			await fireEvent.click(screen.getByText('PC'));
			flush();

			await waitFor(() => {
				const countBadge = screen.getByText('1');
				expect(countBadge).toBeInTheDocument();
			});
		});
	});

	describe('Reset Functionality', () => {
		it('should have reset button in header', async () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);

			const resetButton = screen.getByRole('button', { name: /Reset all filters/i });
			expect(resetButton).toBeInTheDocument();
		});
	});

	describe('Scroll Lock', () => {
		it('should lock body scroll when modal is open', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
			flush();

			expect(document.body.style.overflow).toBe('hidden');
		});

		it('should unlock body scroll when component is unmounted', async () => {
			const { unmount } = render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
			flush();

			expect(document.body.style.overflow).toBe('hidden');

			unmount();
			flush();

			await waitFor(() => {
				expect(document.body.style.overflow).toBe('');
			});
		});
	});

	describe('Accessibility', () => {
		it('should have dialog role', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});

		it('should have proper aria-labels on action buttons', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
			expect(screen.getByRole('button', { name: /Reset all filters/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Collapse filters pane/i })).toBeInTheDocument();
		});

		it('should show correct title', () => {
			render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} title="Custom Title" />);
			expect(screen.getByText('Custom Title')).toBeInTheDocument();
		});
	});
});

import { fireEvent, render, screen } from '@solidjs/testing-library';
import { flush } from 'solid-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MobileFilters from '#lib/components/MobileFilters.js';
import { filtersStore } from '#lib/stores/filters.js';

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
	default: () => <div data-testid="ratings-sort">RatingsSort</div>,
}));

describe('MobileFilters Component', () => {
	const mockFilterOptions = {
		platforms: ['PC', 'Switch', 'PS5'],
		genres: ['RPG', 'Action'],
		tiers: ['S', 'A'],
		coOp: ['Yes'],
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should not render when isOpen is false', () => {
		render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={false} />);
		const modal = screen.queryByRole('dialog');
		expect(modal).not.toBeInTheDocument();
	});

	it('should render when isOpen is true', () => {
		render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);
		const modal = screen.getByRole('dialog');
		expect(modal).toBeInTheDocument();
		expect(screen.getByText('Filters and Sorting')).toBeInTheDocument();
	});

	it('should display filter categories', () => {
		render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);

		expect(screen.getByText('Platforms')).toBeInTheDocument();
		expect(screen.getByText('Genres')).toBeInTheDocument();
		expect(screen.getByText('Tiers')).toBeInTheDocument();
		expect(screen.getByText('Co-op')).toBeInTheDocument();
	});

	it('should apply filter immediately when platform is selected', async () => {
		const onClose = vi.fn();
		render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} onClose={onClose} />);

		const platformsBtn = screen.getByText('Platforms').closest('button');
		expect(platformsBtn).not.toBeNull();
		await fireEvent.click(platformsBtn as HTMLElement);
		flush();

		const switchOption = screen.getByText('Switch');
		await fireEvent.click(switchOption);
		flush();

		expect(filtersStore.setFilters).toHaveBeenCalledWith(
			expect.objectContaining({
				platforms: ['Switch'],
			})
		);
	});

	it('should apply filter immediately when co-op toggle is clicked', async () => {
		render(() => <MobileFilters filterOptions={mockFilterOptions} isOpen={true} />);

		expect(filtersStore.setFilters).not.toHaveBeenCalled();

		const coopBtn = screen.getByText('Co-op').closest('button');
		await fireEvent.click(coopBtn as HTMLElement);
		flush();

		expect(filtersStore.setFilters).toHaveBeenCalledWith(
			expect.objectContaining({
				coOp: ['Yes'],
			})
		);
	});
});

import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileFilters from '$lib/components/MobileFilters.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';

vi.mock('$lib/stores/filters.svelte', () => {
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

vi.mock('$lib/components/RatingsSort.svelte', () => ({
	default: () => ({ html: '<div data-testid="ratings-sort">RatingsSort</div>' }),
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
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: false,
			},
		});
		const modal = screen.queryByRole('dialog');
		expect(modal).not.toBeInTheDocument();
	});

	it('should render when isOpen is true', () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
			},
		});
		const modal = screen.getByRole('dialog');
		expect(modal).toBeInTheDocument();
		expect(screen.getByText('Filters and Sorting')).toBeInTheDocument();
	});

	it('should display filter categories', () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
			},
		});

		expect(screen.getByText('Platforms')).toBeInTheDocument();
		expect(screen.getByText('Genres')).toBeInTheDocument();
		expect(screen.getByText('Tiers')).toBeInTheDocument();
		expect(screen.getByText('Co-op')).toBeInTheDocument();
	});

	it('should apply filter immediately when platform is selected', async () => {
		const onClose = vi.fn();
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
				onClose,
			},
		});

		const platformsBtn = screen.getByText('Platforms').closest('button');
		expect(platformsBtn).not.toBeNull();
		await fireEvent.click(platformsBtn as HTMLElement);

		const switchOption = screen.getByText('Switch');
		await fireEvent.click(switchOption);

		expect(filtersStore.setFilters).toHaveBeenCalledWith(
			expect.objectContaining({
				platforms: ['Switch'],
			})
		);
	});

	it('should apply filter immediately when co-op toggle is clicked', async () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
			},
		});

		expect(filtersStore.setFilters).not.toHaveBeenCalled();

		const coopBtn = screen.getByText('Co-op').closest('button');
		await fireEvent.click(coopBtn as HTMLElement);

		expect(filtersStore.setFilters).toHaveBeenCalledWith(
			expect.objectContaining({
				coOp: ['Yes'],
			})
		);
	});
});

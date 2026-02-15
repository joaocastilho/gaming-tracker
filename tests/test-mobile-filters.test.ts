import { render, fireEvent, screen } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileFilters from '$lib/components/MobileFilters.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { tick } from 'svelte';

// Mock dependencies
vi.mock('$lib/stores/filters.svelte', () => {
	const mockStore = {
		togglePlatform: vi.fn(),
		toggleGenre: vi.fn(),
		toggleTier: vi.fn(),
		toggleCoOp: vi.fn(),
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
			run({ searchTerm: '' });
			return () => {};
		})
	};
	return {
		filtersStore: mockStore
	};
});

vi.mock('lucide-svelte', () => {
	const MockIcon = () => ({});
	return {
		RotateCcw: MockIcon,
		Check: MockIcon,
		X: MockIcon,
		ArrowUpDown: MockIcon,
		SlidersHorizontal: MockIcon,
		Monitor: MockIcon,
		Tag: MockIcon,
		Trophy: MockIcon,
		Users: MockIcon
	};
});

// Mock RatingsSort component since it's used inside
vi.mock('$lib/components/RatingsSort.svelte', () => ({
	default: () => ({ html: '<div data-testid="ratings-sort">RatingsSort</div>' })
}));

describe('MobileFilters Component', () => {
	const mockFilterOptions = {
		platforms: ['PC', 'Switch', 'PS5'],
		genres: ['RPG', 'Action'],
		tiers: ['S', 'A'],
		coOp: ['Yes']
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should not render when isOpen is false', () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: false
			}
		});
		const modal = screen.queryByRole('dialog');
		expect(modal).not.toBeInTheDocument();
	});

	it('should render when isOpen is true', () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true
			}
		});
		const modal = screen.getByRole('dialog');
		expect(modal).toBeInTheDocument();
		expect(screen.getByText('Filters and Sorting')).toBeInTheDocument();
	});

	it('should display filter categories', () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true
			}
		});

		expect(screen.getByText('Platforms')).toBeInTheDocument();
		expect(screen.getByText('Genres')).toBeInTheDocument();
		expect(screen.getByText('Tiers')).toBeInTheDocument();
		expect(screen.getByText('Co-op')).toBeInTheDocument();
	});

	it('should call onClose when close button is clicked', async () => {
		const onClose = vi.fn();
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
				onClose
			}
		});

		// Assuming there's a close button (X icon usually)
		// We'll look for a button with proper aria-label or just the button itself if simpler
		const closeBtn = screen.getByLabelText('Close without applying') || screen.getByTitle('Close');
		await fireEvent.click(closeBtn);

		expect(onClose).toHaveBeenCalled();
	});

	it('should manage pending state for platforms without applying immediately', async () => {
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true
			}
		});

		// Open Platforms sub-menu (assuming logic stays: click category -> open popup)
		const platformsBtn = screen.getByText('Platforms').closest('button');
		expect(platformsBtn).not.toBeNull();
		await fireEvent.click(platformsBtn as HTMLElement);
		await tick();

		// Should see platform options now
		const switchOption = screen.getByText('Switch');
		await fireEvent.click(switchOption);

		// Verify filtersStore was NOT called yet
		expect(filtersStore.togglePlatform).not.toHaveBeenCalled();

		// Close sub-menu (accept)
		const acceptBtn = screen.getByLabelText('Accept selection');
		await fireEvent.click(acceptBtn);
		await tick();

		// Verify visual indication of count (e.g. "1" badge on Platforms)
		// This depends on implementation details, but let's assume valid text content
		expect(platformsBtn).toHaveTextContent('1');
	});

	it('should apply filters only when Apply button is clicked', async () => {
		const onClose = vi.fn();
		render(MobileFilters, {
			props: {
				filterOptions: mockFilterOptions,
				isOpen: true,
				onClose
			}
		});

		// Simulating selection: Open Platforms -> Select 'PC' -> Accept
		const platformsBtn = screen.getByText('Platforms').closest('button');
		expect(platformsBtn).not.toBeNull();
		await fireEvent.click(platformsBtn as HTMLElement);
		await tick();
		await fireEvent.click(screen.getByText('PC'));
		await fireEvent.click(screen.getByLabelText('Accept selection'));
		await tick();

		// Click Apply
		const applyBtn = screen.getByLabelText('Apply filters');
		await fireEvent.click(applyBtn);

		// Verify store calls
		expect(filtersStore.resetAllFilters).toHaveBeenCalled();
		expect(filtersStore.togglePlatform).toHaveBeenCalledWith('PC');
		expect(onClose).toHaveBeenCalled(); // Should close also
	});
});

/**
 * MobileFilters UI Tests
 * Tests that verify the MobileFilters component's UI interactions including:
 * - Pending state management (changes don't apply until confirmed)
 * - Apply and cancel workflows
 * - Sub-popup filter selection
 * - Reset functionality
 */
import { render, fireEvent, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import MobileFilters from '$lib/components/MobileFilters.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => null;
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

// Mock the RatingsSort component
vi.mock('$lib/components/RatingsSort.svelte', () => ({
	default: () => null
}));

describe('MobileFilters UI', () => {
	const mockFilterOptions = {
		platforms: ['PC', 'PlayStation', 'Nintendo Switch', 'Xbox'],
		genres: ['RPG', 'Action', 'Adventure', 'Platformer'],
		tiers: ['S - Masterpiece', 'A - Amazing', 'B - Good', 'C - Okay']
	};

	beforeEach(() => {
		vi.clearAllMocks();
		filtersStore.initializeForTesting();
		filtersStore.resetAllFilters();
	});

	afterEach(() => {
		// Clean up body overflow style
		document.body.style.overflow = '';
	});

	describe('Modal Opening and Closing', () => {
		it('should render when isOpen is true', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});

		it('should not render when isOpen is false', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: false }
			});
			expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
		});

		it('should call onClose when X button is clicked', async () => {
			const onClose = vi.fn();
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, onClose }
			});
			const closeButton = screen.getByRole('button', { name: /close without applying/i });
			await fireEvent.click(closeButton);
			expect(onClose).toHaveBeenCalled();
		});

		it('should call onClose when backdrop is clicked', async () => {
			const onClose = vi.fn();
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, onClose }
			});
			const dialog = screen.getByRole('dialog');
			await fireEvent.click(dialog);
			expect(onClose).toHaveBeenCalled();
		});

		it('should call onClose when Escape is pressed', async () => {
			const onClose = vi.fn();
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, onClose }
			});
			const dialog = screen.getByRole('dialog');
			await fireEvent.keyDown(dialog, { key: 'Escape' });
			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('Pending State Management', () => {
		it('should initialize pending state from current store state on open', async () => {
			// Pre-set a filter
			filtersStore.togglePlatform('PC');

			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// PC should be selected in pending state
			await waitFor(() => {
				const pcButton = screen.getByRole('button', { name: /^PC$/i });
				expect(pcButton.classList.contains('selected')).toBe(true);
			});
		});

		it('should show count badge when pending items are selected', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// Select PC
			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			// Accept and close popup
			const acceptButton = screen.getByRole('button', { name: /Accept selection/i });
			await fireEvent.click(acceptButton);

			// Check that the count badge shows
			await waitFor(() => {
				const countBadge = screen.getByText('1'); // Count badge
				expect(countBadge).toBeInTheDocument();
			});
		});

		it('should not modify store when pending selections change', async () => {
			const togglePlatformSpy = vi.spyOn(filtersStore, 'togglePlatform');

			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// Select PC
			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			// Store should NOT have been modified (pending only)
			expect(togglePlatformSpy).not.toHaveBeenCalled();
		});
	});

	describe('Apply and Cancel Workflows', () => {
		it('should apply pending filters to store when Apply is clicked', async () => {
			const onClose = vi.fn();
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, onClose }
			});

			// Open platforms popup and select
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			// Accept popup
			const acceptButton = screen.getByRole('button', { name: /Accept selection/i });
			await fireEvent.click(acceptButton);

			// Apply filters
			const applyButton = screen.getByRole('button', { name: /Apply filters/i });
			await fireEvent.click(applyButton);

			// Store should now have PC as a platform filter
			expect(filtersStore.state?.platforms).toContain('PC');
			expect(onClose).toHaveBeenCalled();
		});

		it('should NOT apply pending filters when close without apply is clicked', async () => {
			const onClose = vi.fn();
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, onClose }
			});

			// Open platforms popup and select
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			// Accept popup
			const acceptButton = screen.getByRole('button', { name: /Accept selection/i });
			await fireEvent.click(acceptButton);

			// Close without applying
			const closeButton = screen.getByRole('button', { name: /close without applying/i });
			await fireEvent.click(closeButton);

			// Store should NOT have PC
			expect(filtersStore.state?.platforms).not.toContain('PC');
			expect(onClose).toHaveBeenCalled();
		});
	});

	describe('Sub-popup Interactions', () => {
		it('should open platforms popup when Platforms button is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// Should show popup with platforms - look for the popup header
			// The popup title has the Platform icon and "Platforms" text
			await waitFor(() => {
				const popup = screen.getAllByRole('dialog');
				expect(popup.length).toBeGreaterThanOrEqual(1);
			});
		});

		it('should open genres popup when Genres button is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			const genresButton = screen.getByRole('button', { name: /Genres/i });
			await fireEvent.click(genresButton);

			await waitFor(() => {
				// Genre options should be visible
				expect(screen.getByText('RPG')).toBeInTheDocument();
				expect(screen.getByText('Action')).toBeInTheDocument();
			});
		});

		it('should open tiers popup when Tiers button is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			const tiersButton = screen.getByRole('button', { name: /Tiers/i });
			await fireEvent.click(tiersButton);

			await waitFor(() => {
				expect(screen.getByText('S - Masterpiece')).toBeInTheDocument();
				expect(screen.getByText('A - Amazing')).toBeInTheDocument();
			});
		});

		it('should toggle co-op directly without popup', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			const coOpButton = screen.getByRole('button', { name: /Co-op/i });
			await fireEvent.click(coOpButton);

			// Should have has-selection class after click
			expect(coOpButton.classList.contains('has-selection')).toBe(true);
		});

		it('should close popup when backdrop is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// Find and click popup backdrop
			const popupBackdrop = screen.getByRole('button', { name: /close popup/i });
			await fireEvent.click(popupBackdrop);

			// Popup should be closed - RPG shouldn't be visible anymore (genres popup)
			await waitFor(() => {
				// The filter options should not be visible
				expect(screen.queryByText('PlayStation')).not.toBeInTheDocument();
			});
		});

		it('should close popup on Escape key', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			// Press Escape
			const popupOverlay = document.querySelector('.filter-popup-overlay');
			if (popupOverlay) {
				await fireEvent.keyDown(popupOverlay, { key: 'Escape' });
			}

			// Popup should be closed
			await waitFor(() => {
				expect(screen.queryByText('PlayStation')).not.toBeInTheDocument();
			});
		});
	});

	describe('Reset Functionality', () => {
		it('should clear all pending filters when Reset is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Select some filters
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			const acceptButton = screen.getByRole('button', { name: /Accept selection/i });
			await fireEvent.click(acceptButton);

			// Click Reset
			const resetButton = screen.getByRole('button', { name: /Reset all filters/i });
			await fireEvent.click(resetButton);

			// Pending platforms should be cleared - count badge should not be present
			await waitFor(() => {
				const platformsBtn = screen.getByRole('button', { name: /Platforms/i });
				expect(platformsBtn.classList.contains('has-selection')).toBe(false);
			});
		});

		it('should reset current category pending when Reset in popup is clicked', async () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			// Open platforms popup and select
			const platformsButton = screen.getByRole('button', { name: /Platforms/i });
			await fireEvent.click(platformsButton);

			const pcButton = screen.getByRole('button', { name: /^PC$/i });
			await fireEvent.click(pcButton);

			// Click reset in popup
			const popupResetButton = screen.getByRole('button', { name: /Reset this filter/i });
			await fireEvent.click(popupResetButton);

			// Popup should close and pending platforms should be cleared
			await waitFor(() => {
				const platformsBtn = screen.getByRole('button', { name: /Platforms/i });
				expect(platformsBtn.classList.contains('has-selection')).toBe(false);
			});
		});

		it('should also clear search term and sort when Reset all is clicked', async () => {
			const setSearchTermSpy = vi.spyOn(filtersStore, 'setSearchTerm');
			const setSortSpy = vi.spyOn(filtersStore, 'setSort');

			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			const resetButton = screen.getByRole('button', { name: /Reset all filters/i });
			await fireEvent.click(resetButton);

			expect(setSearchTermSpy).toHaveBeenCalledWith('');
			expect(setSortSpy).toHaveBeenCalledWith(null);
		});
	});

	describe('Scroll Lock', () => {
		it('should lock body scroll when modal is open', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			expect(document.body.style.overflow).toBe('hidden');
		});

		it('should unlock body scroll when component is unmounted', async () => {
			const { unmount } = render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});

			expect(document.body.style.overflow).toBe('hidden');

			// Unmount the component (simulates closing)
			unmount();

			// Scroll should be unlocked after cleanup
			await waitFor(() => {
				expect(document.body.style.overflow).toBe('');
			});
		});
	});

	describe('Accessibility', () => {
		it('should have dialog role', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});
			expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
		});

		it('should have proper aria-labels on action buttons', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true }
			});
			expect(screen.getByRole('button', { name: /Apply filters/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Reset all filters/i })).toBeInTheDocument();
			expect(screen.getByRole('button', { name: /Close without applying/i })).toBeInTheDocument();
		});

		it('should show correct title', () => {
			render(MobileFilters, {
				props: { filterOptions: mockFilterOptions, isOpen: true, title: 'Custom Title' }
			});
			expect(screen.getByText('Custom Title')).toBeInTheDocument();
		});
	});
});

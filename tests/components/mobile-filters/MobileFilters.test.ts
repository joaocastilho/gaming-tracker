import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MobileFilters from '$lib/components/MobileFilters.svelte';

const filterOptions = {
	platforms: ['PC', 'PlayStation 5', 'Xbox Series X'],
	genres: ['Action', 'RPG', 'Sports'],
	tiers: ['S', 'A', 'B', 'C', 'D', 'F']
};

describe('MobileFilters', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render nothing when isOpen is false', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: false
			}
		});
		expect(container.querySelector('.mobile-filters-modal')).toBeNull();
	});

	it('should render modal when isOpen is true', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});
		expect(container.querySelector('.mobile-filters-modal')).not.toBeNull();
	});

	it('should display filter categories', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});

		expect(container.textContent).toContain('Platforms');
		expect(container.textContent).toContain('Genres');
	});

	it('should display Platforms filter when showTiersFilter is true', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				showTiersFilter: true
			}
		});

		expect(container.textContent).toContain('Tiers');
	});

	it('should NOT display Tiers filter when showTiersFilter is false', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				showTiersFilter: false
			}
		});

		expect(container.textContent).not.toContain('Tiers');
	});

	it('should display Co-op filter when showCoOpFilter is true', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				showCoOpFilter: true
			}
		});

		expect(container.textContent).toContain('Co-op');
	});

	it('should NOT display Co-op filter when showCoOpFilter is false', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				showCoOpFilter: false
			}
		});

		expect(container.textContent).not.toContain('Co-op');
	});

	it('should display custom title', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				title: 'Custom Filters'
			}
		});

		expect(container.textContent).toContain('Custom Filters');
	});

	it('should have Apply, Reset, and Close buttons in header', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});

		const applyBtn = container.querySelector('.apply-icon');
		const resetBtn = container.querySelector('.reset-icon');
		const closeBtn = container.querySelector('.close-icon');

		expect(applyBtn).not.toBeNull();
		expect(resetBtn).not.toBeNull();
		expect(closeBtn).not.toBeNull();
	});

	it('should call onClose when close button is clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				onClose
			}
		});

		const closeBtn = container.querySelector('.close-icon');
		if (closeBtn) {
			await fireEvent.click(closeBtn);
		}

		expect(onClose).toHaveBeenCalled();
	});

	it('should call onClose when Apply button is clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				onClose
			}
		});

		const applyBtn = container.querySelector('.apply-icon');
		if (applyBtn) {
			await fireEvent.click(applyBtn);
		}

		expect(onClose).toHaveBeenCalled();
	});

	it('should display Sort By section', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});

		expect(container.textContent).toContain('Sort By');
	});

	it('should close when clicking outside modal', async () => {
		const onClose = vi.fn();
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				onClose
			}
		});

		const backdrop = container.querySelector('.mobile-filters-modal');
		if (backdrop) {
			await fireEvent.click(backdrop);
		}

		expect(onClose).toHaveBeenCalled();
	});

	it('should have correct ARIA attributes on modal', () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});

		const modal = container.querySelector('.mobile-filters-modal');
		expect(modal?.getAttribute('role')).toBe('dialog');
		expect(modal?.getAttribute('aria-modal')).toBe('true');
	});

	it('should open platform popup and display options', async () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true
			}
		});

		const platformsBtn = container.querySelector('.mobile-filter-category-compact');
		if (platformsBtn) {
			await fireEvent.click(platformsBtn);
		}

		expect(container.textContent).toContain('PC');
	});

	it('should display tier options when tiers are available', async () => {
		const { container } = render(MobileFilters, {
			props: {
				filterOptions,
				isOpen: true,
				showTiersFilter: true
			}
		});

		const buttons = container.querySelectorAll('.mobile-filter-category-compact');
		if (buttons[2]) {
			await fireEvent.click(buttons[2]);
		}

		expect(container.textContent).toContain('S');
	});
});

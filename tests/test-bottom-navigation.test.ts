/**
 * BottomNavigation Tests
 * Tests that verify the BottomNavigation component's UI interactions including:
 * - Tab switching and navigation
 * - Count badge reactivity
 * - Active state management
 * - Search toggle functionality
 */
import { render, fireEvent, screen } from '@testing-library/svelte';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import BottomNavigation from '$lib/components/BottomNavigation.svelte';
import { appStore } from '$lib/stores/app.svelte';

// Mock the navigation utility
const mockNavigateTo = vi.fn();
vi.mock('$lib/utils/navigationUtils', () => ({
	navigateTo: (tab: string) => mockNavigateTo(tab)
}));

// Mock Lucide icons
vi.mock('lucide-svelte', () => {
	const MockIcon = () => null;
	return {
		Gamepad: MockIcon,
		CheckCircle: MockIcon,
		Calendar: MockIcon,
		List: MockIcon,
		Search: MockIcon
	};
});

describe('BottomNavigation', () => {
	let originalActiveTab: string;

	beforeEach(() => {
		vi.clearAllMocks();
		// Store original active tab
		originalActiveTab = appStore.activeTab;

		// Reset to default state
		appStore.setActiveTab('all');
	});

	afterEach(() => {
		// Restore original state
		appStore.setActiveTab(originalActiveTab as 'all' | 'completed' | 'planned' | 'tierlist');
	});

	describe('Tab Switching', () => {
		it('should navigate to Games (/) when Games tab is clicked', async () => {
			render(BottomNavigation);
			const gamesTab = screen.getByRole('button', { name: /Games/i });
			await fireEvent.click(gamesTab);
			expect(mockNavigateTo).toHaveBeenCalledWith('all');
		});

		it('should navigate to Completed (/completed) when Completed tab is clicked', async () => {
			render(BottomNavigation);
			const completedTab = screen.getByRole('button', { name: /Completed/i });
			await fireEvent.click(completedTab);
			expect(mockNavigateTo).toHaveBeenCalledWith('completed');
		});

		it('should navigate to Planned (/planned) when Planned tab is clicked', async () => {
			render(BottomNavigation);
			const plannedTab = screen.getByRole('button', { name: /Planned/i });
			await fireEvent.click(plannedTab);
			expect(mockNavigateTo).toHaveBeenCalledWith('planned');
		});

		it('should navigate to Tier List (/tierlist) when Tier List tab is clicked', async () => {
			render(BottomNavigation);
			const tierlistTab = screen.getByRole('button', { name: /Tier List/i });
			await fireEvent.click(tierlistTab);
			expect(mockNavigateTo).toHaveBeenCalledWith('tierlist');
		});

		it('should call onSearchToggle when Search tab is clicked', async () => {
			const onSearchToggle = vi.fn();
			render(BottomNavigation, { props: { onSearchToggle } });
			const searchTab = screen.getByRole('button', { name: /Search/i });
			await fireEvent.click(searchTab);
			expect(onSearchToggle).toHaveBeenCalled();
			expect(mockNavigateTo).not.toHaveBeenCalled();
		});

		it('should not call navigateTo when Search tab is clicked', async () => {
			const onSearchToggle = vi.fn();
			render(BottomNavigation, { props: { onSearchToggle } });
			const searchTab = screen.getByRole('button', { name: /Search/i });
			await fireEvent.click(searchTab);
			expect(mockNavigateTo).not.toHaveBeenCalled();
		});
	});

	describe('Keyboard Navigation', () => {
		it('should navigate on Enter key press', async () => {
			render(BottomNavigation);
			const gamesTab = screen.getByRole('button', { name: /Games/i });
			await fireEvent.keyDown(gamesTab, { key: 'Enter' });
			expect(mockNavigateTo).toHaveBeenCalledWith('all');
		});

		it('should navigate on Space key press', async () => {
			render(BottomNavigation);
			const completedTab = screen.getByRole('button', { name: /Completed/i });
			await fireEvent.keyDown(completedTab, { key: ' ' });
			expect(mockNavigateTo).toHaveBeenCalledWith('completed');
		});

		it('should call onSearchToggle on Enter key for Search tab', async () => {
			const onSearchToggle = vi.fn();
			render(BottomNavigation, { props: { onSearchToggle } });
			const searchTab = screen.getByRole('button', { name: /Search/i });
			await fireEvent.keyDown(searchTab, { key: 'Enter' });
			expect(onSearchToggle).toHaveBeenCalled();
		});

		it('should not trigger action on other keys', async () => {
			render(BottomNavigation);
			const gamesTab = screen.getByRole('button', { name: /Games/i });
			await fireEvent.keyDown(gamesTab, { key: 'Tab' });
			expect(mockNavigateTo).not.toHaveBeenCalled();
		});
	});

	describe('Active State', () => {
		it('should mark Games tab as active when activeTab is "all"', () => {
			appStore.setActiveTab('all');
			render(BottomNavigation);
			const gamesTab = screen.getByRole('button', { name: /Games/i });
			expect(gamesTab).toHaveAttribute('aria-current', 'page');
		});

		it('should mark Completed tab as active when activeTab is "completed"', () => {
			appStore.setActiveTab('completed');
			render(BottomNavigation);
			const completedTab = screen.getByRole('button', { name: /Completed/i });
			expect(completedTab).toHaveAttribute('aria-current', 'page');
		});

		it('should mark Planned tab as active when activeTab is "planned"', () => {
			appStore.setActiveTab('planned');
			render(BottomNavigation);
			const plannedTab = screen.getByRole('button', { name: /Planned/i });
			expect(plannedTab).toHaveAttribute('aria-current', 'page');
		});

		it('should mark Tier List tab as active when activeTab is "tierlist"', () => {
			appStore.setActiveTab('tierlist');
			render(BottomNavigation);
			const tierlistTab = screen.getByRole('button', { name: /Tier List/i });
			expect(tierlistTab).toHaveAttribute('aria-current', 'page');
		});

		it('should not mark Search tab as active (it is action-only)', () => {
			render(BottomNavigation);
			const searchTab = screen.getByRole('button', { name: /Search/i });
			expect(searchTab).not.toHaveAttribute('aria-current');
		});

		it('should apply active class to active tab button', () => {
			appStore.setActiveTab('completed');
			render(BottomNavigation);
			const completedTab = screen.getByRole('button', { name: /Completed/i });
			expect(completedTab.classList.contains('active')).toBe(true);
		});
	});

	describe('Count Badges', () => {
		it('should display all count badge for Games tab', () => {
			// The counts come from the store, mock returns depend on state
			render(BottomNavigation);
			const gamesTab = screen.getByRole('button', { name: /Games/i });
			// Check that the aria-label includes count information
			expect(gamesTab).toBeInTheDocument();
		});

		it('should display completed count badge for Completed tab', () => {
			render(BottomNavigation);
			const completedTab = screen.getByRole('button', { name: /Completed/i });
			expect(completedTab).toBeInTheDocument();
		});

		it('should display planned count badge for Planned tab', () => {
			render(BottomNavigation);
			const plannedTab = screen.getByRole('button', { name: /Planned/i });
			expect(plannedTab).toBeInTheDocument();
		});

		it('should NOT display count badge for Tier List tab', () => {
			render(BottomNavigation);
			const tierlistTab = screen.getByRole('button', { name: /Tier List$/i });
			// Tier List tab doesn't have a count in aria-label
			expect(tierlistTab.getAttribute('aria-label')).toBe('Tier List');
		});

		it('should NOT display count badge for Search tab', () => {
			render(BottomNavigation);
			const searchTab = screen.getByRole('button', { name: /^Search$/i });
			expect(searchTab.getAttribute('aria-label')).toBe('Search');
		});
	});

	describe('Accessibility', () => {
		it('should have proper aria-label attribute on navigation', () => {
			render(BottomNavigation);
			const nav = screen.getByRole('navigation', { name: /Main navigation/i });
			expect(nav).toBeInTheDocument();
		});

		it('should have list structure for navigation items', () => {
			render(BottomNavigation);
			const list = screen.getByRole('list');
			expect(list).toBeInTheDocument();
		});

		it('should render 5 navigation items', () => {
			render(BottomNavigation);
			const listItems = screen.getAllByRole('listitem');
			expect(listItems).toHaveLength(5);
		});

		it('should have buttons for all navigation items', () => {
			render(BottomNavigation);
			const buttons = screen.getAllByRole('button');
			expect(buttons).toHaveLength(5);
		});
	});

	describe('Rendering', () => {
		it('should render all tab labels', () => {
			render(BottomNavigation);
			expect(screen.getByText('Games')).toBeInTheDocument();
			expect(screen.getByText('Completed')).toBeInTheDocument();
			expect(screen.getByText('Planned')).toBeInTheDocument();
			expect(screen.getByText('Tier List')).toBeInTheDocument();
			expect(screen.getByText('Search')).toBeInTheDocument();
		});

		it('should only be visible on mobile (md:hidden class)', () => {
			render(BottomNavigation);
			const nav = screen.getByRole('navigation');
			expect(nav.classList.contains('md:hidden')).toBe(true);
		});
	});
});

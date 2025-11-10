import { goto } from '$app/navigation';
import { appStore } from '$lib/stores/app';
import { filtersStore } from '$lib/stores/filters';

export type NavTarget = 'all' | 'completed' | 'planned' | 'tierlist';

export interface NavigationOptions {
	scrollToTop?: boolean;
	preserveFilters?: boolean;
	replaceState?: boolean;
	noScroll?: boolean;
}

const DEFAULT_OPTIONS: NavigationOptions = {
	scrollToTop: true,
	preserveFilters: true,
	replaceState: false,
	noScroll: false
};

/**
 * Navigate to a target page with optional filter preservation and scroll behavior
 * Note: This function does NOT write filters to URL to avoid synchronization issues
 */
export function navigateTo(target: NavTarget, options: NavigationOptions = {}) {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Update active tab state
	appStore.setActiveTab(target);

	// Clear filters for routes that require it (currently only tierlist)
	if (requiresFilterReset(target)) {
		filtersStore.resetAllFilters();
		filtersStore.setSearchTerm('');
	}

	// Navigate to route
	const route = target === 'all' ? '/' : `/${target}`;
	goto(route, {
		replaceState: opts.replaceState,
		noScroll: opts.noScroll,
		keepFocus: true
	});

	// Scroll to top if requested
	if (opts.scrollToTop) {
		scrollToTop();
	}
}

/**
 * Simple navigation without filter preservation (for cases where filters should be reset)
 * This function also bypasses URL writing to avoid synchronization issues
 */
export function navigateToAndReset(
	target: NavTarget,
	options: Omit<NavigationOptions, 'preserveFilters'> = {}
) {
	const opts = { ...DEFAULT_OPTIONS, ...options, preserveFilters: false };

	// Reset filters immediately without URL sync
	filtersStore.resetAllFilters();
	filtersStore.setSearchTerm('');

	// Update active tab state
	appStore.setActiveTab(target);

	// Navigate to route
	const route = target === 'all' ? '/' : `/${target}`;
	goto(route, {
		replaceState: opts.replaceState,
		noScroll: opts.noScroll,
		keepFocus: true
	});

	// Scroll to top if requested
	if (opts.scrollToTop) {
		scrollToTop();
	}
}

/**
 * Navigate to 'all' tab while preserving filters (for logo click)
 */
export function navigateToAllWithFilters() {
	navigateTo('all');
}

/**
 * Navigate to 'all' tab and clear all filters (for logo click)
 * This should immediately reset filters without URL synchronization
 */
export function navigateToAllAndClearFilters() {
	// Reset filters immediately
	filtersStore.resetAllFilters();
	filtersStore.setSearchTerm('');

	// Update active tab
	appStore.setActiveTab('all');

	// Navigate without filter preservation
	const route = '/';
	goto(route, {
		replaceState: false,
		noScroll: false,
		keepFocus: true
	});

	// Scroll to top
	scrollToTop();
}

/**
 * Smooth scroll to top utility
 */
export function scrollToTop() {
	if (typeof window !== 'undefined') {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
}

/**
 * Instant scroll to top (for immediate navigation)
 */
export function scrollToTopInstant() {
	if (typeof window !== 'undefined') {
		window.scrollTo({
			top: 0,
			behavior: 'auto'
		});
	}
}

/**
 * Get the route path for a navigation target
 */
export function getRoutePath(target: NavTarget): string {
	return target === 'all' ? '/' : `/${target}`;
}

/**
 * Check if a target route requires filter reset
 * Currently only tierlist view requires filter reset
 */
export function requiresFilterReset(target: NavTarget): boolean {
	return target === 'tierlist';
}

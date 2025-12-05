import { appStore } from '$lib/stores/app.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';

import { goto } from '$app/navigation';

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
 * Navigate to tab with proper URL update and filter preservation
 */
export async function navigateTo(target: NavTarget, options: NavigationOptions = {}) {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	// Build target URL with current filters
	const route = getRoutePath(target);
	const url = new URL(
		route,
		typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
	);

	appStore.setActiveTab(target, true);

	await goto(url.toString(), {
		replaceState: opts.replaceState ?? false,
		noScroll: opts.noScroll ?? false,
		keepFocus: true
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

/**
 * Navigate to tab and reset filters (e.g. tierlist)
 */
export async function navigateToAndReset(
	target: NavTarget,
	options: Omit<NavigationOptions, 'preserveFilters'> = {}
) {
	const opts = { ...DEFAULT_OPTIONS, ...options, preserveFilters: false };

	filtersStore.resetAllFilters();
	filtersStore.setSearchTerm('');

	appStore.setActiveTab(target, true);

	const route = getRoutePath(target);
	await goto(route, {
		replaceState: opts.replaceState ?? false,
		noScroll: opts.noScroll ?? false,
		keepFocus: true
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

/**
 * Navigate to 'all' tab while preserving filters (for logo click)
 */
export async function navigateToAllWithFilters() {
	await navigateTo('all');
}

/**
 * Navigate to 'all' tab and clear all filters (for logo click)
 */
export async function navigateToAllAndClearFilters() {
	await navigateToAndReset('all', { scrollToTop: true });
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

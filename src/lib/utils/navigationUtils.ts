import { goto } from '$app/navigation';
import { appStore } from '$lib/stores/app.svelte';
import { filtersStore } from '$lib/stores/filters.svelte';
import { toSlug } from './slugUtils';

export type NavTarget = 'all' | 'completed' | 'planned' | 'tierlist';

export interface NavigationOptions {
	scrollToTop?: boolean;
	preserveFilters?: boolean;
	replaceState?: boolean;
	noScroll?: boolean;
	state?: App.PageState;
}

const DEFAULT_OPTIONS: NavigationOptions = {
	scrollToTop: true,
	preserveFilters: true,
	replaceState: false,
	noScroll: false,
};

export async function navigateTo(target: NavTarget, options: NavigationOptions = {}) {
	const opts = { ...DEFAULT_OPTIONS, ...options };

	const route = getRoutePath(target);
	const url = new URL(route, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

	if (opts.preserveFilters) {
		const state = filtersStore.state;
		if (state) {
			if (state.searchTerm) url.searchParams.set('s', state.searchTerm);

			state.platforms.forEach((p) => url.searchParams.append('platform', toSlug(p)));
			state.genres.forEach((g) => url.searchParams.append('genre', toSlug(g)));
			state.statuses.forEach((s) => url.searchParams.append('status', toSlug(s)));
			state.tiers.forEach((t) => url.searchParams.append('tier', toSlug(t)));
			state.coOp.forEach((c) => url.searchParams.append('coop', toSlug(c)));

			if (state.sortOption) {
				url.searchParams.set('sort', state.sortOption.key);
				url.searchParams.set('dir', state.sortOption.direction);
			}
		}
	}

	appStore.setActiveTab(target, true);

	await goto(url.toString(), {
		replaceState: opts.replaceState ?? false,
		noScroll: opts.noScroll ?? false,
		keepFocus: true,
		state: opts.state ?? {},
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

export async function navigateToAndReset(target: NavTarget, options: Omit<NavigationOptions, 'preserveFilters'> = {}) {
	const opts = { ...DEFAULT_OPTIONS, ...options, preserveFilters: false };

	appStore.setActiveTab(target, true);

	const route = getRoutePath(target);
	await goto(route, {
		replaceState: opts.replaceState ?? false,
		noScroll: opts.noScroll ?? false,
		keepFocus: true,
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

export async function navigateToAllWithFilters() {
	await navigateTo('all');
}

export async function navigateToAllAndClearFilters() {
	await navigateToAndReset('all', { scrollToTop: true });
}

export function scrollToTop() {
	if (typeof window !== 'undefined') {
		window.scrollTo({
			top: 0,
			behavior: 'smooth',
		});
	}
}

export function scrollToTopInstant() {
	if (typeof window !== 'undefined') {
		window.scrollTo({
			top: 0,
			behavior: 'auto',
		});
	}
}

export function getRoutePath(target: NavTarget): string {
	return target === 'all' ? '/' : `/${target}`;
}

export function requiresFilterReset(_target: NavTarget): boolean {
	return false;
}

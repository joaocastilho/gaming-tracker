import { appStore } from '#lib/stores/app.js';
import { filtersStore } from '#lib/stores/filters.js';
import type { PageState } from '#lib/types/pageState.js';
import { goto } from './routerBridge.js';
import { toSlug } from './slugUtils.js';

export type NavTarget = 'all' | 'completed' | 'planned' | 'tierlist' | 'stats' | 'library';

export interface NavigationOptions {
	scrollToTop?: boolean;
	preserveFilters?: boolean;
	replaceState?: boolean;
	noScroll?: boolean;
	state?: PageState;
}

const DEFAULT_OPTIONS: NavigationOptions = {
	scrollToTop: true,
	preserveFilters: true,
	replaceState: false,
	noScroll: false,
};

export async function navigateTo(target: NavTarget, options: NavigationOptions = {}): Promise<void> {
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
		replace: opts.replaceState ?? false,
		reset: !opts.noScroll,
		state: opts.state ?? {},
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

export async function navigateToAndReset(
	target: NavTarget,
	options: Omit<NavigationOptions, 'preserveFilters'> = {}
): Promise<void> {
	const opts = { ...DEFAULT_OPTIONS, ...options, preserveFilters: false };

	appStore.setActiveTab(target, true);

	const route = getRoutePath(target);
	await goto(route, {
		replace: opts.replaceState ?? false,
		reset: !opts.noScroll,
	});

	if (opts.scrollToTop) {
		scrollToTop();
	}
}

export function scrollToTop(): void {
	if (typeof window !== 'undefined') {
		window.scrollTo({
			top: 0,
			behavior: 'auto',
		});
	}
}

export function getRoutePath(target: NavTarget): string {
	if (target === 'all') return '/library';
	if (target === 'library') return '/library';
	return `/${target}`;
}

export type RouteKey = 'home' | 'stats' | 'all' | 'completed' | 'planned' | 'tierlist' | 'other';

const GAMES_ROUTES: ReadonlySet<RouteKey> = new Set(['all', 'completed', 'planned']);

// A route SvelteKit knows about but this map doesn't must never look like the
// library: the layout would render the game grid instead of the page (login,
// error pages, or future routes). Unknown paths get their own key so
// `{@render children()}` still runs.
export function routeKeyFromPath(pathname: string): RouteKey {
	if (pathname === '/') return 'home';
	if (pathname === '/library') return 'all';
	if (pathname === '/completed') return 'completed';
	if (pathname === '/planned') return 'planned';
	if (pathname === '/tierlist') return 'tierlist';
	if (pathname === '/stats') return 'stats';
	return 'other';
}

export function isGamesRoute(key: RouteKey): boolean {
	return GAMES_ROUTES.has(key);
}

// Policy for the background games.json refresh.
//
// The payload's `meta.lastUpdated` is a reliable data-version marker: every
// write path (the Cloudflare Function) stamps it with the save time. Comparing
// it against the marker stored in IndexedDB lets the layout skip the full
// clear + bulkPut rewrite on page loads where nothing changed.

export type GamesRefreshDecision = 'apply' | 'skip' | 'ignore';

export function readPayloadLastUpdated(payload: unknown): string | null {
	if (typeof payload !== 'object' || payload === null) return null;
	const meta = (payload as { meta?: unknown }).meta;
	if (typeof meta !== 'object' || meta === null) return null;
	const lastUpdated = (meta as { lastUpdated?: unknown }).lastUpdated;
	return typeof lastUpdated === 'string' && lastUpdated.length > 0 ? lastUpdated : null;
}

function hasUsableGames(payload: unknown): boolean {
	if (typeof payload !== 'object' || payload === null) return false;
	const games = (payload as { games?: unknown }).games;
	return Array.isArray(games) && games.length > 0;
}

export function decideGamesRefresh(payload: unknown, cachedLastUpdated: string | null): GamesRefreshDecision {
	if (!hasUsableGames(payload)) return 'ignore';

	const payloadMarker = readPayloadLastUpdated(payload);
	if (payloadMarker === null || cachedLastUpdated === null) return 'apply';

	return payloadMarker === cachedLastUpdated ? 'skip' : 'apply';
}

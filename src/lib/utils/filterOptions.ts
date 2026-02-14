import type { Game } from '$lib/types/game';
import { COOP_COLORS, GENRE_COLORS, PLATFORM_COLORS, TIER_COLORS } from './colorConstants.js';
import { getTierDisplayName } from './tierUtils';

export function getPlatformColor(platform: string): string {
	const colorClass = PLATFORM_COLORS[platform] || 'bg-gray-600 text-white';
	// If it's a specific platform class (starts with platform-), append -badge if not present
	// The PLATFORM_COLORS map in colorConstants.ts returns 'platform-xyz', so we need 'platform-xyz-badge'
	// However, looking at colorConstants.ts again:
	// export const PLATFORM_COLORS: Record<string, string> = { PC: 'platform-pc', ... }
	// So it returns 'platform-pc'. In app.css we have '.platform-pc-badge'.
	// So we need to append '-badge'.
	if (colorClass.startsWith('platform-')) {
		return `${colorClass}-badge`;
	}
	return colorClass;
}

export function getGenreColor(genre: string): string {
	const colorClass = GENRE_COLORS[genre] || 'bg-gray-600 text-white';
	// Similar logic for genres
	if (colorClass.startsWith('genre-')) {
		return `${colorClass}-badge`;
	}
	return colorClass;
}

export function getTierColor(tier: string): string {
	const fullTierName = getTierDisplayName(tier);
	const colorClass = TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
	// For tiers, app.css has .tier-badge.tier-s
	// TIER_COLORS returns 'tier-s'
	// So we need to return 'tier-badge tier-s'
	if (colorClass.startsWith('tier-')) {
		return `tier-badge ${colorClass}`;
	}
	return colorClass;
}

export function getCoOpColor(coOp: string): string {
	// Co-op might be different, let's check app.css
	// .coop-badge exists. COOP_COLORS returns 'coop-yes' or 'coop-no' (though 'coop-no' might not exist in css?)
	// app.css only has .coop-badge, not .coop-yes-badge.
	// But let's check colorConstants.ts: export const COOP_COLORS = { Yes: 'coop-yes', No: 'coop-no' };
	// And app.css has .coop-badge styles but not specific colors unless I missed them.
	// Actually the GameCard uses: <button class="coop-badge" ...><Users ... class="text-blue-500" /></button>
	// It doesn't seem to use background badges for co-op in the card, just an icon.
	// But the filter dropdown might want a badge.
	// If I look at FilterDropdown.svelte: class="filter-option-item {getOptionColor(option)} ..."
	// If I return 'coop-yes', is there a class for that?
	// I didn't see .coop-yes in app.css.
	// Let's leave it as is for now or just return the default if not found.
	// Actually, looking at previous file view of app.css, I saw:
	/*
	.coop-badge {
		background: none;
		...
	}
	*/
	// It seems co-op doesn't have a specific colored badge style in app.css for the *filter dropdown* specifically defined like platforms.
	// However, if I want it to look like other badges, I might need to add it or just use default.
	// For now I will keep the original logic for co-op or just strictly return what's in the map.
	// usage in FilterDropdown: class="filter-option-item {getOptionColor(option)} ..."
	// If I return 'bg-gray-600 text-white', that works.
	return COOP_COLORS[coOp] || 'bg-gray-600 text-white';
}

const TIER_ORDER = [
	'S - Masterpiece',
	'A - Amazing',
	'B - Great',
	'C - Good',
	'D - Decent',
	'E - Bad'
];

export function extractFilterOptions(games: Game[]): {
	platforms: string[];
	genres: string[];
	tiers: string[];
	coOp: string[];
} {
	// Return empty arrays if no games to avoid blocking
	if (!games || games.length === 0) {
		return {
			platforms: [],
			genres: [],
			tiers: [],
			coOp: []
		};
	}

	const platforms = new Set<string>();
	const genres = new Set<string>();
	const tiers = new Set<string>();
	const coOp = new Set<string>();

	// Use for...of loop instead of forEach for better performance with large arrays
	for (const game of games) {
		if (game.platform) platforms.add(game.platform);
		if (game.genre) genres.add(game.genre);
		if (game.tier) tiers.add(getTierDisplayName(game.tier));
		if (game.coOp) coOp.add(game.coOp);
	}

	return {
		platforms: Array.from(platforms).toSorted(),
		genres: Array.from(genres).toSorted(),
		tiers: Array.from(tiers).toSorted((a, b) => {
			return TIER_ORDER.indexOf(a) - TIER_ORDER.indexOf(b);
		}),
		coOp: Array.from(coOp).toSorted().toReversed() // 'Yes' before 'No'
	};
}

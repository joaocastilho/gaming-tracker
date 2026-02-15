import { TIER_COLORS, TIER_LABELS } from './colorConstants';

/**
 * Get the CSS class string for a tier badge based on the tier letter
 * @param tier - The tier letter (S, A, B, C, D, E)
 * @returns CSS class string for styling the tier badge
 */
export function getTierClass(tier: string): string {
	const fullTierName = TIER_LABELS[tier] || tier;
	return TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
}

/**
 * Get the full display name for a tier (e.g., "S - Masterpiece")
 * @param tier - The tier letter (S, A, B, C, D, E)
 * @returns Full tier display name
 */
export function getTierDisplayName(tier: string): string {
	return TIER_LABELS[tier] || tier;
}

/**
 * Get a numeric weight for a tier for sorting purposes
 * S = 6, A = 5, B = 4, C = 3, D = 2, E = 1
 * @param tier - The tier string
 * @returns Numeric weight
 */
export function getTierWeight(tier: string): number {
	if (!tier) return 0;
	if (tier.startsWith('S')) return 6;
	if (tier.startsWith('A')) return 5;
	if (tier.startsWith('B')) return 4;
	if (tier.startsWith('C')) return 3;
	if (tier.startsWith('D')) return 2;
	if (tier.startsWith('E')) return 1;
	return 0;
}

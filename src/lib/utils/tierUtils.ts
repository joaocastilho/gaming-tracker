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

import { TIER_COLORS, TIER_LABELS } from './colorConstants.js';

/**
 * Get the CSS class string for a tier badge based on the tier letter
 * @param tier - The tier letter (S, A, B, C, D, E)
 * @returns CSS class string for styling the tier badge
 */
export function getTierClass(tier: string): string {
	const fullTierName = TIER_LABELS[tier] || tier;
	return TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
}

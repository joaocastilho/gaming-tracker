import { TIER_COLORS, TIER_LABELS } from './colorConstants';

export function getTierClass(tier: string): string {
	const fullTierName = TIER_LABELS[tier] || tier;
	return TIER_COLORS[fullTierName] || 'bg-gray-600 text-white';
}

export function getTierDisplayName(tier: string): string {
	return TIER_LABELS[tier] || tier;
}

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

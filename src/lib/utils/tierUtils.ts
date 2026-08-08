import type { TierValue } from '$lib/types/game';

export const TIER_ORDER = [
	'S - Masterpiece',
	'A - Amazing',
	'B - Great',
	'C - Good',
	'D - Decent',
	'E - Bad',
] as const satisfies readonly TierValue[];

export const TIER_VALUES = TIER_ORDER;

export const TIER_LETTERS = ['S', 'A', 'B', 'C', 'D', 'E'] as const;

export const TIER_LABELS: Record<string, string> = {
	S: 'S - Masterpiece',
	A: 'A - Amazing',
	B: 'B - Great',
	C: 'C - Good',
	D: 'D - Decent',
	E: 'E - Bad',
};

export const TIER_COLORS: Record<string, string> = {
	'S - Masterpiece': 'tier-s',
	'A - Amazing': 'tier-a',
	'B - Great': 'tier-b',
	'C - Good': 'tier-c',
	'D - Decent': 'tier-d',
	'E - Bad': 'tier-e',
};

export const TIER_BAR_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6b7280'] as const;

export const TIER_BG_COLORS = [
	'rgba(239,68,68,0.25)',
	'rgba(249,115,22,0.25)',
	'rgba(234,179,8,0.25)',
	'rgba(34,197,94,0.25)',
	'rgba(6,182,212,0.25)',
	'rgba(107,114,128,0.25)',
] as const;

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

export function getTierFromScore(score: number): TierValue {
	if (score >= 18) return 'S - Masterpiece';
	if (score >= 15) return 'A - Amazing';
	if (score >= 12) return 'B - Great';
	if (score >= 9) return 'C - Good';
	if (score >= 6) return 'D - Decent';
	return 'E - Bad';
}

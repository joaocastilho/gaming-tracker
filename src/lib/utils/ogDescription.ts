import type { Game } from '$lib/types/game';
import { getTierDisplayName } from '$lib/utils/tierUtils';

export interface OgDescriptionInput {
	status: Game['status'];
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: string | null;
}

export function buildOgDescription(game: OgDescriptionInput): string {
	const lines: string[] = [];

	if (game.status === 'Completed') {
		const p = game.ratingPresentation ?? '-';
		const s = game.ratingStory ?? '-';
		const gp = game.ratingGameplay ?? '-';
		lines.push(`Presentation: ${p}/10 · Story: ${s}/10 · Gameplay: ${gp}/10`);
	}

	if (game.status === 'Completed' || game.tier) {
		let secondLine = '';
		if (game.status === 'Completed') {
			secondLine += `Score: ${game.score ?? '-'}/20`;
		}
		if (game.tier) {
			if (secondLine) secondLine += ' · ';
			secondLine += `Tier: ${getTierDisplayName(game.tier)}`;
		}
		lines.push(secondLine);
	}

	return lines.join('\n');
}

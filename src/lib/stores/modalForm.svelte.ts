import type { Game, TierValue } from '$lib/types/game';

export function getTierFromScore(score: number): TierValue {
	if (score >= 18) return 'S - Masterpiece';
	if (score >= 15) return 'A - Amazing';
	if (score >= 12) return 'B - Great';
	if (score >= 9) return 'C - Good';
	if (score >= 6) return 'D - Decent';
	return 'E - Bad';
}

export function validateFormData(formData: Partial<Game>): Record<string, string> {
	const errors: Record<string, string> = {};

	if (!formData.title?.trim()) {
		errors.title = 'Title is required';
	}
	if (!formData.platform?.trim()) {
		errors.platform = 'Platform is required';
	}
	if (!formData.genre?.trim()) {
		errors.genre = 'Genre is required';
	}
	if (!formData.playtime?.trim()) {
		errors.playtime = 'Playtime is required';
	}

	if (formData.coOp !== undefined && formData.coOp !== 'Yes' && formData.coOp !== 'No') {
		errors.coOp = 'Co-op must be Yes or No';
	}

	if (formData.status !== undefined && !['Planned', 'Completed', 'Playing'].includes(formData.status)) {
		errors.status = 'Status must be Planned, Completed, or Playing';
	}

	if (formData.year !== undefined) {
		if (Number.isNaN(Number(formData.year))) {
			errors.year = 'Year must be a valid number';
		} else if (formData.year < 1970 || formData.year > 2099) {
			errors.year = 'Year must be between 1970 and 2099';
		}
	} else {
		errors.year = 'Year is required';
	}

	if (formData.status === 'Completed') {
		if (!formData.finishedDate) {
			errors.finishedDate = 'Finished date is required for completed games';
		}
		if (formData.ratingPresentation === null || formData.ratingPresentation === undefined) {
			errors.ratingPresentation = 'Presentation rating is required for completed games';
		}
		if (formData.ratingStory === null || formData.ratingStory === undefined) {
			errors.ratingStory = 'Story rating is required for completed games';
		}
		if (formData.ratingGameplay === null || formData.ratingGameplay === undefined) {
			errors.ratingGameplay = 'Gameplay rating is required for completed games';
		}

		if (
			formData.ratingPresentation !== null &&
			formData.ratingPresentation !== undefined &&
			(formData.ratingPresentation < 0 || formData.ratingPresentation > 10)
		) {
			errors.ratingPresentation = 'Presentation rating must be between 0 and 10';
		}
		if (
			formData.ratingStory !== null &&
			formData.ratingStory !== undefined &&
			(formData.ratingStory < 0 || formData.ratingStory > 10)
		) {
			errors.ratingStory = 'Story rating must be between 0 and 10';
		}
		if (
			formData.ratingGameplay !== null &&
			formData.ratingGameplay !== undefined &&
			(formData.ratingGameplay < 0 || formData.ratingGameplay > 10)
		) {
			errors.ratingGameplay = 'Gameplay rating must be between 0 and 10';
		}
	}

	return errors;
}

export function buildNewGame(formData: Partial<Game>): Game {
	const ratingPresentation = formData.ratingPresentation ?? null;
	const ratingStory = formData.ratingStory ?? null;
	const ratingGameplay = formData.ratingGameplay ?? null;
	const score =
		ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
			? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
			: null;

	const coverImage = `covers/${formData.title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'game'}.webp`;

	return {
		id: crypto.randomUUID(),
		title: formData.title ?? '',
		mainTitle: formData.mainTitle ?? formData.title ?? '',
		subtitle: formData.subtitle ?? null,
		platform: formData.platform ?? '',
		year: formData.year ?? new Date().getFullYear(),
		genre: formData.genre ?? '',
		coOp: formData.coOp ?? 'No',
		status: formData.status ?? 'Planned',
		coverImage,
		playtime: formData.playtime ?? '',
		finishedDate: formData.finishedDate ?? null,
		ratingPresentation,
		ratingStory,
		ratingGameplay,
		score,
		tier: formData.status === 'Completed' && score !== null ? getTierFromScore(score) : null,
		completionOrder: null,
		sortPriority: null,
	};
}

export function buildUpdatedGame(activeGame: Game, formData: Partial<Game>): Game {
	const ratingPresentation = formData.ratingPresentation ?? null;
	const ratingStory = formData.ratingStory ?? null;
	const ratingGameplay = formData.ratingGameplay ?? null;
	const score =
		ratingPresentation !== null && ratingStory !== null && ratingGameplay !== null
			? Math.round(((ratingPresentation + ratingStory + ratingGameplay) / 3) * 2)
			: activeGame.score;

	return {
		...activeGame,
		...formData,
		score,
		tier:
			formData.status === 'Completed' && score !== null
				? getTierFromScore(score)
				: formData.status === 'Planned' || formData.status === 'Playing'
					? null
					: activeGame.tier,
	};
}

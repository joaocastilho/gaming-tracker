import { z } from 'zod';
import type { CoOpStatus, GameStatus, TierValue } from '../types/game';

/**
 * Shared constants
 */

export const GAME_STATUS_VALUES = ['Planned', 'Completed'] as const satisfies GameStatus[];
export const TIER_VALUES = [
	'S - Masterpiece',
	'A - Amazing',
	'B - Great',
	'C - Good',
	'D - Decent',
	'E - Bad'
] as const satisfies TierValue[];
export const COOP_VALUES = ['Yes', 'No'] as const satisfies CoOpStatus[];

/**
 * Base field-level schema matching src/lib/types/game.ts.
 * Does NOT encode Planned/Completed cross-field rules yet.
 */
export const BaseGameSchema = z.object({
	id: z.string().regex(/^[\w-]+$/),
	title: z.string().min(1).max(200),
	mainTitle: z.string().min(1).max(200),
	subtitle: z.string().nullable(),
	platform: z.string().min(1),
	year: z.number().int().min(1970).max(2099),
	genre: z.string().min(1),
	coOp: z.enum(COOP_VALUES),
	status: z.enum(GAME_STATUS_VALUES),
	coverImage: z.string().regex(/^covers\/[\w-]+\.webp$/),
	playtime: z.string().regex(/^\d+h \d+m$/),

	finishedDate: z
		.string()
		.regex(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/,
			'finishedDate must be an ISO 8601 UTC datetime string'
		)
		.nullable(),
	ratingPresentation: z.number().min(0).max(10).nullable(),
	ratingStory: z.number().min(0).max(10).nullable(),
	ratingGameplay: z.number().min(0).max(10).nullable(),
	score: z.number().min(0).max(20).nullable(),
	tier: z.enum(TIER_VALUES).nullable()
});

/**
 * Compute canonical score from ratings.
 * Formula: (P + S + G) / 3 * 2
 */
export function computeScore({
	ratingPresentation,
	ratingStory,
	ratingGameplay
}: {
	ratingPresentation: number;
	ratingStory: number;
	ratingGameplay: number;
}): number {
	const avg = (ratingPresentation + ratingStory + ratingGameplay) / 3;
	const score = avg * 2;

	const clamped = Math.max(0, Math.min(20, score));
	return Math.round(clamped * 10) / 10;
}

/**
 * Cross-field integrity rules:
 *
 * - Planned:
 *   - status === 'Planned'
 *   - finishedDate, rating* , score, tier MUST be null.
 *
 * - Completed:
 *   - status === 'Completed'
 *   - playtime MUST be non-null and match "XXh XXm" (always required anyway).
 *   - finishedDate MUST be non-null.
 *   - ratingPresentation, ratingStory, ratingGameplay MUST be non-null (0-10).
 *   - score MUST equal computeScore(rating*).
 *   - tier MUST be non-null.
 */

export const GameSchema = BaseGameSchema.superRefine((game, ctx) => {
	if (game.status === 'Planned') {
		if (game.finishedDate !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['finishedDate'],
				message: 'Planned games must have finishedDate = null'
			});
		}
		if (game.ratingPresentation !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingPresentation'],
				message: 'Planned games must have ratingPresentation = null'
			});
		}
		if (game.ratingStory !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingStory'],
				message: 'Planned games must have ratingStory = null'
			});
		}
		if (game.ratingGameplay !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingGameplay'],
				message: 'Planned games must have ratingGameplay = null'
			});
		}
		if (game.score !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['score'],
				message: 'Planned games must have score = null'
			});
		}
		if (game.tier !== null) {
			ctx.addIssue({
				code: 'custom',
				path: ['tier'],
				message: 'Planned games must have tier = null'
			});
		}
		return;
	}

	if (game.status === 'Completed') {
		if (game.finishedDate === null) {
			ctx.addIssue({
				code: 'custom',
				path: ['finishedDate'],
				message: 'Completed games must have finishedDate set'
			});
		}

		if (game.ratingPresentation === null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingPresentation'],
				message: 'Completed games must have ratingPresentation set'
			});
		}
		if (game.ratingStory === null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingStory'],
				message: 'Completed games must have ratingStory set'
			});
		}
		if (game.ratingGameplay === null) {
			ctx.addIssue({
				code: 'custom',
				path: ['ratingGameplay'],
				message: 'Completed games must have ratingGameplay set'
			});
		}

		if (
			game.ratingPresentation != null &&
			game.ratingStory != null &&
			game.ratingGameplay != null
		) {
			const expectedScore = computeScore({
				ratingPresentation: game.ratingPresentation,
				ratingStory: game.ratingStory,
				ratingGameplay: game.ratingGameplay
			});

			if (game.score == null) {
				ctx.addIssue({
					code: 'custom',
					path: ['score'],
					message: 'Completed games must have score set'
				});
			} else if (Math.abs(game.score - expectedScore) > 0.05) {
				ctx.addIssue({
					code: 'custom',
					path: ['score'],
					message: `Score must equal computed value (${expectedScore})`
				});
			}
		}

		if (game.tier === null) {
			ctx.addIssue({
				code: 'custom',
				path: ['tier'],
				message: 'Completed games must have tier set'
			});
		}
	}
});

/**
 * Schema for the full payload used by /api/games.
 */
export const GamesPayloadSchema = z.object({
	games: z.array(GameSchema),
	meta: z
		.object({
			lastUpdated: z
				.string()
				.regex(
					/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/,
					'lastUpdated must be an ISO 8601 UTC datetime string'
				)
				.optional()
		})
		.catchall(z.unknown())
		.optional()
});

export type GameValidationSchema = z.infer<typeof GameSchema>;
export type GamesPayloadValidationSchema = z.infer<typeof GamesPayloadSchema>;

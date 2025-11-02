import { z } from 'zod';
import type { GameStatus, TierValue, CoOpStatus } from '../types/game';

export const GameSchema = z.object({
	id: z.string().uuid(),
	title: z.string().min(1).max(200),
	platform: z.string().min(1),
	year: z.number().int().min(1970).max(2099),
	genre: z.string().min(1),
	coOp: z.enum(['Yes', 'No'] as const satisfies CoOpStatus[]),
	status: z.enum(['Planned', 'Completed'] as const satisfies GameStatus[]),
	coverImage: z.string().regex(/^covers\/[\w-]+\.webp$/),
	timeToBeat: z.string().regex(/^\d+h \d+m$/),
	hoursPlayed: z
		.string()
		.regex(/^\d+h \d+m$/)
		.nullable(),
	finishedDate: z.string().datetime().nullable(),
	ratingPresentation: z.number().min(0).max(10).nullable(),
	ratingStory: z.number().min(0).max(10).nullable(),
	ratingGameplay: z.number().min(0).max(10).nullable(),
	score: z.number().min(0).max(20).nullable(),
	tier: z.enum(['S', 'A', 'B', 'C', 'D', 'E'] as const satisfies TierValue[]).nullable()
});

// Type inference for TypeScript
export type GameValidationSchema = z.infer<typeof GameSchema>;

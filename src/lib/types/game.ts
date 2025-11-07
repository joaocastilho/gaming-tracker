export type GameStatus = 'Planned' | 'Completed';

export type TierValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

export type CoOpStatus = 'Yes' | 'No';

export interface Game {
	id: string; // UUID v4
	title: string; // Required, 1-200 chars
	mainTitle: string; // Pre-computed from title
	subtitle: string | null; // Pre-computed from title
	platform: string; // Required (PC, PS5, Xbox, Switch, etc.)
	year: number; // Required, 1970-2099
	genre: string; // Required (RPG, Action, etc.)
	coOp: CoOpStatus; // Required
	status: GameStatus; // Required, default: "Planned"
	coverImage: string; // Path: covers/{id}.webp
	timeToBeat: string; // Format: "XXh XXm"
	hoursPlayed: string | null; // Format: "XXh XXm", null if Planned
	finishedDate: string | null; // ISO date string, null if Planned
	ratingPresentation: number | null; // 0-10, null if Planned
	ratingStory: number | null; // 0-10, null if Planned
	ratingGameplay: number | null; // 0-10, null if Planned
	score: number | null; // 0-20 (calculated), null if Planned
	tier: TierValue | null; // null if Planned
}

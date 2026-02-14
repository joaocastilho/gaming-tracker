export type GameStatus = 'Planned' | 'Completed';

export type TierValue =
	| 'S - Masterpiece'
	| 'A - Amazing'
	| 'B - Great'
	| 'C - Good'
	| 'D - Decent'
	| 'E - Bad';

export type CoOpStatus = 'Yes' | 'No';

export interface Game {
	id: string;
	title: string;
	mainTitle: string;
	subtitle: string | null;
	platform: string;
	year: number;
	genre: string;
	coOp: CoOpStatus;
	status: GameStatus;
	coverImage: string;
	playtime: string;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: TierValue | null;
	completionOrder?: number | null;
	sortPriority?: number | null;
}

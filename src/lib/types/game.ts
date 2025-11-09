export type GameStatus = 'Planned' | 'Completed';

export type TierValue = 'S' | 'A' | 'B' | 'C' | 'D' | 'E';

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
	timeToBeat: string;
	hoursPlayed: string | null;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: TierValue | null;
}

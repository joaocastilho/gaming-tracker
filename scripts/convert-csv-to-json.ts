import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface GameData {
	Title: string;
	Co_op: string;
	Finished: string;
	Gameplay: string;
	Genre: string;
	Hours_to_beat: string;
	Platform: string;
	Presentation: string;
	Score: string;
	Story: string;
	Tier: string;
	Time_to_beat: string;
	Year: string;
}

interface GameJson {
	id: string;
	title: string;
	platform: string;
	year: number;
	genre: string;
	coOp: string;
	status: 'Planned' | 'Completed';
	coverImage: string;
	timeToBeat: string;
	hoursPlayed: number | null;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: string | null;
}

function parseCSV(csvContent: string): GameData[] {
	const lines = csvContent.split('\n').filter((line) => line.trim());
	const headers = lines[0].split(',').map((h) => h.trim());

	const games: GameData[] = [];

	for (let i = 1; i < lines.length; i++) {
		const values: string[] = [];
		let current = '';
		let inQuotes = false;

		for (const char of lines[i]) {
			if (char === '"') {
				inQuotes = !inQuotes;
			} else if (char === ',' && !inQuotes) {
				values.push(current.trim());
				current = '';
			} else {
				current += char;
			}
		}
		values.push(current.trim());

		if (values.length === headers.length) {
			const game: Partial<GameData> = {};
	headers.forEach((header, index) => {
		const key = header.replace(/\s+/g, '_').replace(/-/g, '_');
		(game as any)[key] = values[index];
	});
			games.push(game as GameData);
		}
	}

	return games;
}

function generateId(title: string): string {
	// Remove accents and normalize
	const normalized = title.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	// Remove parentheses and their content
	const withoutParens = normalized.replace(/\([^)]*\)/g, '').trim();
	// Convert to lowercase, replace spaces with dashes, remove special chars
	const id = withoutParens
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '') // keep letters, numbers, spaces
		.replace(/\s+/g, '-') // spaces to dashes
		.replace(/--+/g, '-') // multiple dashes to single
		.replace(/^-|-$/g, ''); // remove leading/trailing dashes

	return id;
}

function convertToGameJson(game: GameData): GameJson {
	const id = generateId(game.Title);
	const hasFinishedDate = game.Finished && game.Finished.trim() !== '';

	return {
		id: id,
		title: game.Title,
		platform: game.Platform,
		year: parseInt(game.Year) || 0,
		genre: game.Genre,
		coOp: game.Co_op,
		status: hasFinishedDate ? 'Completed' : 'Planned',
		coverImage: `covers/${id}.webp`,
		timeToBeat: game.Time_to_beat,
		hoursPlayed: hasFinishedDate && game.Hours_to_beat ? parseFloat(game.Hours_to_beat) : null,
		finishedDate: hasFinishedDate ? game.Finished : null,
		ratingPresentation: game.Presentation ? parseInt(game.Presentation) : null,
		ratingStory: game.Story ? parseInt(game.Story) : null,
		ratingGameplay: game.Gameplay ? parseInt(game.Gameplay) : null,
		score: game.Score ? parseInt(game.Score) : null,
		tier: game.Tier || null
	};
}

function main() {
	try {
		const csvPath = join('static', 'games.csv');
		const jsonPath = join('static', 'games.json');

		if (!existsSync(csvPath)) {
			console.error('games.csv file not found');
			process.exit(1);
		}

		const csvContent = readFileSync(csvPath, 'utf-8');
		const gamesData = parseCSV(csvContent);
		const gamesJson = gamesData.map(convertToGameJson);

		writeFileSync(jsonPath, JSON.stringify(gamesJson, null, 2), 'utf-8');

		console.log(`Successfully converted ${gamesJson.length} games to JSON format`);
		console.log(`Output saved to: ${jsonPath}`);
	} catch (error) {
		console.error('Error converting CSV to JSON:', error);
		process.exit(1);
	}
}

main();

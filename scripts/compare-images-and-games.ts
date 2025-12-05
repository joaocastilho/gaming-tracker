import { readFileSync, readdirSync } from 'fs';
import { join, parse } from 'path';

interface Game {
	id: string;
	title: string;
	platform: string;
	year: number;
	genre: string;
	coOp: string;
	status: string;
	coverImage: string;
	timeToBeat: string;
	hoursPlayed: string | null;
	finishedDate: string | null;
	ratingPresentation: number | null;
	ratingStory: number | null;
	ratingGameplay: number | null;
	score: number | null;
	tier: string | null;
}

interface GamesData {
	games: Game[];
}

interface ComparisonResult {
	totalGamesInJson: number;
	totalImagesInCoversRaw: number;
	orphanedImages: string[];
	missingCovers: string[];
}

function main(): ComparisonResult {
	// Read the games.json file
	const rawData = JSON.parse(readFileSync(join(process.cwd(), 'static', 'games.json'), 'utf8')) as
		| Game[]
		| GamesData;

	// Handle both array format and object with games property
	const games: Game[] = Array.isArray(rawData) ? rawData : rawData.games;

	// Extract all game IDs from the JSON data
	const gameIds = new Set(games.map((game: Game) => game.id));
	console.log(`Found ${gameIds.size} game entries in JSON`);

	// Get all PNG files from the covers_raw directory
	const coversRawPath = join(process.cwd(), 'static', 'covers_raw');
	const imageFiles = readdirSync(coversRawPath).filter((file) => file.endsWith('.png'));
	console.log(`Found ${imageFiles.length} PNG files in covers_raw`);

	// Extract just the filename (without extension) for comparison
	const imageBasenames = new Set(imageFiles.map((file) => parse(file).name));
	console.log(`Extracted ${imageBasenames.size} image basenames`);

	// Find orphaned images (images without corresponding game IDs)
	const orphanedImages = [...imageBasenames].filter((image) => !gameIds.has(image));

	console.log('\n=== ORPHANED IMAGES ===');
	console.log(`Images without corresponding game ID: ${orphanedImages.length}`);
	if (orphanedImages.length > 0) {
		console.log('\nList of orphaned images:');
		orphanedImages.toSorted().forEach((image) => {
			console.log(`- ${image}.png`);
		});
	} else {
		console.log('No orphaned images found!');
	}

	// Also check for missing covers (game IDs without corresponding images)
	const missingCovers = [...gameIds].filter((gameId: string) => !imageBasenames.has(gameId));
	console.log('\n=== MISSING COVERS ===');
	console.log(`Game IDs without corresponding images: ${missingCovers.length}`);
	if (missingCovers.length > 0) {
		console.log('List of games missing cover images:');
		missingCovers.toSorted().forEach((gameId) => {
			console.log(`- ${gameId}`);
		});
	} else {
		console.log('All games have corresponding cover images!');
	}

	// Summary
	console.log('\n=== SUMMARY ===');
	console.log(`Total games in JSON: ${gameIds.size}`);
	console.log(`Total images in covers_raw: ${imageBasenames.size}`);
	console.log(`Orphaned images: ${orphanedImages.length}`);
	console.log(`Missing covers: ${missingCovers.length}`);

	// Return data for potential programmatic use
	const result: ComparisonResult = {
		totalGamesInJson: gameIds.size,
		totalImagesInCoversRaw: imageBasenames.size,
		orphanedImages,
		missingCovers
	};

	return result;
}

// Run the main function
main();

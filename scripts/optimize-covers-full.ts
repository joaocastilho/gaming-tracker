import sharp from 'sharp';
import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';

const COVERS_RAW_DIR = join(process.cwd(), 'static', 'covers_raw');
const COVERS_DIR = join(process.cwd(), 'static', 'covers');
const GAMES_JSON_PATH = join(process.cwd(), 'static', 'games.json');

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

interface OptimizationResult {
	originalFilename: string;
	gameId: string;
	gameTitle: string;
	status: 'success' | 'error' | 'skipped';
	error?: string;
	originalSize?: number;
	cover200Size?: number;
	cover300Size?: number;
	detail400Size?: number;
	processingTime?: number;
}

interface OptimizationStats {
	totalFiles: number;
	processed: number;
	successful: number;
	errors: number;
	skipped: number;
	totalOriginalSize: number;
	totalCover200Size: number;
	totalCover300Size: number;
	totalDetail400Size: number;
	totalTime: number;
}

async function findMatchingGame(filename: string, games: Game[]): Promise<Game | null> {
	const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

	// Try exact ID match first
	let match = games.find((g) => g.id === nameWithoutExt);
	if (match) return match;

	// Try slugified title match
	const sluggedFilename = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	match = games.find((g) => g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === sluggedFilename);
	if (match) return match;

	// Try partial title match
	match = games.find(
		(g) =>
			g.title.toLowerCase().includes(nameWithoutExt.toLowerCase()) ||
			nameWithoutExt.toLowerCase().includes(g.title.toLowerCase())
	);
	if (match) return match;

	return null;
}

async function processImage(
	filename: string,
	games: Game[],
	outputDir: string
): Promise<OptimizationResult> {
	const startTime = Date.now();

	try {
		const matchingGame = await findMatchingGame(filename, games);
		if (!matchingGame) {
			return {
				originalFilename: filename,
				gameId: 'unknown',
				gameTitle: 'Unknown',
				status: 'skipped',
				error: 'No matching game found'
			};
		}

		const inputPath = join(COVERS_RAW_DIR, filename);
		const gameId = matchingGame.id;

		// Paths:
		// - 200w: {id}-200w.webp      (tier list view / compact)
		// - 300w: {id}.webp           (card / grid)
		// - 400w: {id}-detail.webp    (detail / modal)
		const cover200Path = join(outputDir, `${gameId}-200w.webp`);
		const cover300Path = join(outputDir, `${gameId}.webp`);
		const detail400Path = join(outputDir, `${gameId}-detail.webp`);

		const originalStats = await stat(inputPath);
		const originalSize = originalStats.size;

		// 1) 200w x 300h -> tier list / small usage
		await sharp(inputPath)
			.resize(200, 300, {
				fit: 'cover',
				position: 'center',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.webp({
				quality: 80,
				effort: 6
			})
			.toFile(cover200Path);

		// 2) 300w x 450h -> card usage
		await sharp(inputPath)
			.resize(300, 450, {
				fit: 'cover',
				position: 'center',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.webp({
				quality: 85,
				effort: 6
			})
			.toFile(cover300Path);

		// 3) 400w x 600h -> detail usage
		await sharp(inputPath)
			.resize(400, 600, {
				fit: 'cover',
				position: 'center',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.webp({
				quality: 90,
				effort: 6
			})
			.toFile(detail400Path);

		const cover200Stats = await stat(cover200Path);
		const cover300Stats = await stat(cover300Path);
		const detail400Stats = await stat(detail400Path);

		const processingTime = Date.now() - startTime;

		return {
			originalFilename: filename,
			gameId: matchingGame.id,
			gameTitle: matchingGame.title,
			status: 'success',
			originalSize,
			cover200Size: cover200Stats.size,
			cover300Size: cover300Stats.size,
			detail400Size: detail400Stats.size,
			processingTime
		};
	} catch (error) {
		return {
			originalFilename: filename,
			gameId: 'unknown',
			gameTitle: 'Unknown',
			status: 'error',
			error: error instanceof Error ? error.message : 'Unknown error',
			processingTime: Date.now() - startTime
		};
	}
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatTime(ms: number): string {
	if (ms < 1000) return `${ms}ms`;
	return `${(ms / 1000).toFixed(1)}s`;
}

async function main(): Promise<void> {
	console.log('🎮 Gaming Tracker - Cover Image Optimizer');
	console.log('==========================================');

	const overallStartTime = Date.now();

	// Load games data
	console.log('📂 Loading games data...');
	const gamesData = await readFile(GAMES_JSON_PATH, 'utf-8');
	const gamesJson = JSON.parse(gamesData);
	const games: Game[] = gamesJson.games || gamesJson;
	console.log(`✅ Loaded ${games.length} games`);

	// Get all PNG files
	console.log('🔍 Scanning covers_raw directory...');
	const allFiles = await readdir(COVERS_RAW_DIR);
	const pngFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.png'));
	console.log(`✅ Found ${pngFiles.length} PNG files`);

	// Create output directory
	await mkdir(COVERS_DIR, { recursive: true });
	console.log(`✅ Output directory ready: ${COVERS_DIR}`);

	console.log('\n🚀 Starting optimization process...');
	console.log('Progress: 0/' + pngFiles.length);

	const results: OptimizationResult[] = [];
	let processed = 0;

	for (const filename of pngFiles) {
		const result = await processImage(filename, games, COVERS_DIR);
		results.push(result);
		processed++;

		if (processed % 25 === 0 || processed === pngFiles.length) {
			const progress = Math.round((processed / pngFiles.length) * 100);
			console.log(`Progress: ${processed}/${pngFiles.length} (${progress}%)`);
		}

		if (result.status === 'error') {
			console.log(`⚠️  Error processing ${filename}: ${result.error}`);
		}
	}

	const totalTime = Date.now() - overallStartTime;

	const successful = results.filter((r) => r.status === 'success');
	const stats: OptimizationStats = {
		totalFiles: pngFiles.length,
		processed: results.length,
		successful: successful.length,
		errors: results.filter((r) => r.status === 'error').length,
		skipped: results.filter((r) => r.status === 'skipped').length,
		totalOriginalSize: successful.reduce((sum, r) => sum + (r.originalSize || 0), 0),
		totalCover200Size: successful.reduce((sum, r) => sum + (r.cover200Size || 0), 0),
		totalCover300Size: successful.reduce((sum, r) => sum + (r.cover300Size || 0), 0),
		totalDetail400Size: successful.reduce((sum, r) => sum + (r.detail400Size || 0), 0),
		totalTime
	};

	console.log('\n📊 Optimization Results');
	console.log('========================');
	console.log(`Total files: ${stats.totalFiles}`);
	console.log(`✅ Successful: ${stats.successful}`);
	console.log(`⚠️  Errors: ${stats.errors}`);
	console.log(`⏭️  Skipped: ${stats.skipped}`);
	console.log(`\nTotal processing time: ${formatTime(stats.totalTime)}`);

	if (stats.successful > 0) {
		console.log(`\n📈 Size Overview:`);
		console.log(`Original total: ${formatBytes(stats.totalOriginalSize)}`);
		console.log(`200w covers total: ${formatBytes(stats.totalCover200Size)}`);
		console.log(`300w covers total: ${formatBytes(stats.totalCover300Size)}`);
		console.log(`400w details total: ${formatBytes(stats.totalDetail400Size)}`);
	}

	const manifest = {
		generatedAt: new Date().toISOString(),
		totalImages: stats.totalFiles,
		optimizedImages: stats.successful,
		totalSizeBefore: stats.totalOriginalSize,
		totalCover200Size: stats.totalCover200Size,
		totalCover300Size: stats.totalCover300Size,
		totalDetail400Size: stats.totalDetail400Size,
		totalTimeMs: stats.totalTime,
		results
	};

	const manifestPath = join(COVERS_DIR, 'optimization-manifest.json');
	await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
	console.log(`\n📋 Manifest saved: ${manifestPath}`);

	// Update games.json with new cover paths:
	// coverImage always points to the 300w card image: covers/{id}.webp
	console.log('\n🔗 Updating cover paths in games.json...');
	const updatedGames = games.map((game) => {
		const result = results.find((r) => r.gameId === game.id && r.status === 'success');
		if (result) {
			return {
				...game,
				coverImage: `covers/${game.id}.webp`
			};
		}
		return game;
	});

	const updatedGamesPath = join(process.cwd(), 'static', 'games.json');
	await writeFile(updatedGamesPath, JSON.stringify({ games: updatedGames }, null, 2));
	console.log('✅ Updated games.json with 300w coverImage paths');

	console.log('\n🎉 Optimization complete!');
}

main().catch(console.error);

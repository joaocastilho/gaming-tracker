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
	optimizedSize?: number;
	sizeReduction?: number;
	processingTime?: number;
}

interface OptimizationStats {
	totalFiles: number;
	processed: number;
	successful: number;
	errors: number;
	skipped: number;
	totalOriginalSize: number;
	totalOptimizedSize: number;
	totalTime: number;
}

async function findMatchingGame(filename: string, games: Game[]): Promise<Game | null> {
	const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
	
	// Try exact ID match first
	let match = games.find(g => g.id === nameWithoutExt);
	if (match) return match;
	
	// Try slugified title match
	const sluggedFilename = nameWithoutExt.toLowerCase().replace(/[^a-z0-9]+/g, '-');
	match = games.find(g => g.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === sluggedFilename);
	if (match) return match;
	
	// Try partial title match
	match = games.find(g => 
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
		// Find matching game
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
		const outputPath = join(outputDir, `${matchingGame.id}.webp`);
		
		// Get original file size
		const originalStats = await stat(inputPath);
		const originalSize = originalStats.size;
		
		// Optimize image
		await sharp(inputPath)
			.webp({
				quality: 85,
				effort: 6
			})
			.resize(600, 900, {
				fit: 'cover',
				position: 'center',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.toFile(outputPath);
		
		// Get optimized file size
		const optimizedStats = await stat(outputPath);
		const optimizedSize = optimizedStats.size;
		
		const processingTime = Date.now() - startTime;
		const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100;
		
		return {
			originalFilename: filename,
			gameId: matchingGame.id,
			gameTitle: matchingGame.title,
			status: 'success',
			originalSize,
			optimizedSize,
			sizeReduction,
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
	const games: Game[] = JSON.parse(gamesData);
	console.log(`✅ Loaded ${games.length} games`);
	
	// Get all PNG files
	console.log('🔍 Scanning covers_raw directory...');
	const allFiles = await readdir(COVERS_RAW_DIR);
	const pngFiles = allFiles.filter(f => f.toLowerCase().endsWith('.png'));
	console.log(`✅ Found ${pngFiles.length} PNG files`);
	
	// Create output directory
	await mkdir(COVERS_DIR, { recursive: true });
	console.log(`✅ Output directory ready: ${COVERS_DIR}`);
	
	// Process all images
	console.log('\n🚀 Starting optimization process...');
	console.log('Progress: 0/' + pngFiles.length);
	
	const results: OptimizationResult[] = [];
	let processed = 0;
	
	for (const filename of pngFiles) {
		const result = await processImage(filename, games, COVERS_DIR);
		results.push(result);
		processed++;
		
		// Progress update every 25 files
		if (processed % 25 === 0 || processed === pngFiles.length) {
			const progress = Math.round((processed / pngFiles.length) * 100);
			console.log(`Progress: ${processed}/${pngFiles.length} (${progress}%)`);
		}
		
		// Show status for errors
		if (result.status === 'error') {
			console.log(`⚠️  Error processing ${filename}: ${result.error}`);
		}
	}
	
	const totalTime = Date.now() - overallStartTime;
	
	// Calculate statistics
	const stats: OptimizationStats = {
		totalFiles: pngFiles.length,
		processed: results.length,
		successful: results.filter(r => r.status === 'success').length,
		errors: results.filter(r => r.status === 'error').length,
		skipped: results.filter(r => r.status === 'skipped').length,
		totalOriginalSize: results
			.filter(r => r.status === 'success' && r.originalSize)
			.reduce((sum, r) => sum + (r.originalSize || 0), 0),
		totalOptimizedSize: results
			.filter(r => r.status === 'success' && r.optimizedSize)
			.reduce((sum, r) => sum + (r.optimizedSize || 0), 0),
		totalTime
	};
	
	// Display results
	console.log('\n📊 Optimization Results');
	console.log('========================');
	console.log(`Total files: ${stats.totalFiles}`);
	console.log(`✅ Successful: ${stats.successful}`);
	console.log(`⚠️  Errors: ${stats.errors}`);
	console.log(`⏭️  Skipped: ${stats.skipped}`);
	console.log(`\nTotal processing time: ${formatTime(stats.totalTime)}`);
	
	if (stats.successful > 0) {
		const avgReduction = results
			.filter(r => r.status === 'success' && r.sizeReduction)
			.reduce((sum, r) => sum + (r.sizeReduction || 0), 0) / stats.successful;
		
		console.log(`\n📈 Size Optimization:`);
		console.log(`Original total: ${formatBytes(stats.totalOriginalSize)}`);
		console.log(`Optimized total: ${formatBytes(stats.totalOptimizedSize)}`);
		console.log(`Space saved: ${formatBytes(stats.totalOriginalSize - stats.totalOptimizedSize)}`);
		console.log(`Average reduction: ${avgReduction.toFixed(1)}%`);
	}
	
	// Generate manifest
	const manifest = {
		generatedAt: new Date().toISOString(),
		totalImages: stats.totalFiles,
		optimizedImages: stats.successful,
		totalSizeBefore: stats.totalOriginalSize,
		totalSizeAfter: stats.totalOptimizedSize,
		totalTimeMs: stats.totalTime,
		results
	};
	
	const manifestPath = join(COVERS_DIR, 'optimization-manifest.json');
	await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
	console.log(`\n📋 Manifest saved: ${manifestPath}`);
	
	// Update games.json with new cover paths
	console.log('\n🔗 Updating cover paths in games.json...');
	const updatedGames = games.map(game => {
		const result = results.find(r => r.gameId === game.id);
		if (result && result.status === 'success') {
			return {
				...game,
				coverImage: `covers/${game.id}.webp`
			};
		}
		return game;
	});
	
	const updatedGamesPath = join(process.cwd(), 'static', 'games.json');
	await writeFile(updatedGamesPath, JSON.stringify({ games: updatedGames }, null, 2));
	console.log('✅ Updated games.json with new cover paths');
	
	console.log('\n🎉 Optimization complete!');
}

// Run the script
main().catch(console.error);
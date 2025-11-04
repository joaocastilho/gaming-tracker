import sharp from 'sharp';
import { stat } from 'fs/promises';
import { join } from 'path';

async function optimizeLogo(): Promise<void> {
	console.log('🎮 Optimizing logo.png for web...');

	const logoPath = join(process.cwd(), 'static', 'logo.png');
	const outputPath = join(process.cwd(), 'static', 'logo.webp');

	try {
		// Get original file size
		const originalStats = await stat(logoPath);
		const originalSize = originalStats.size;
		console.log(`📊 Original size: ${formatBytes(originalSize)}`);

		// Optimize the logo
		await sharp(logoPath)
			.webp({
				quality: 90, // Higher quality for logo
				effort: 6,
				lossless: false
			})
			.toFile(outputPath);

		// Get optimized file size
		const optimizedStats = await stat(outputPath);
		const optimizedSize = optimizedStats.size;
		const reduction = ((originalSize - optimizedSize) / originalSize) * 100;

		console.log(`✅ Optimized size: ${formatBytes(optimizedSize)}`);
		console.log(`📈 Size reduction: ${reduction.toFixed(1)}%`);

		// Also create a compressed PNG version
		const compressedPngPath = join(process.cwd(), 'static', 'logo-compressed.png');
		await sharp(logoPath)
			.png({
				quality: 90,
				compressionLevel: 9
			})
			.toFile(compressedPngPath);

		const compressedStats = await stat(compressedPngPath);
		const compressedSize = compressedStats.size;
		const pngReduction = ((originalSize - compressedSize) / originalSize) * 100;

		console.log(
			`🖼️  Compressed PNG size: ${formatBytes(compressedSize)} (${pngReduction.toFixed(1)}% reduction)`
		);

		console.log('\n🎉 Logo optimization complete!');
		console.log('📁 Files created:');
		console.log(`   - static/logo.webp`);
		console.log(`   - static/logo-compressed.png`);
		console.log('\n💡 Update your HTML to use logo.webp for better performance!');
	} catch (error) {
		console.error('❌ Error optimizing logo:', error);
		process.exit(1);
	}
}

function formatBytes(bytes: number): string {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Run the script
optimizeLogo().catch(console.error);

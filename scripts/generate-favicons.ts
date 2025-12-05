import sharp from 'sharp';
import { stat } from 'fs/promises';
import { join } from 'path';

async function generateFavicons(): Promise<void> {
	console.log('🖼️ Generating favicon files from static/favicon.png...');

	const inputPath = join(process.cwd(), 'static', 'favicon.png');
	const outputDir = join(process.cwd(), 'static');

	try {
		// Get original metadata
		const metadata = await sharp(inputPath).metadata();
		console.log(`📐 Original dimensions: ${metadata.width}x${metadata.height}`);
		console.log(`🎨 Original format: ${metadata.format}`);

		// Get original file size
		const originalStats = await stat(inputPath);
		const originalSize = originalStats.size;
		console.log(`📊 Original size: ${formatBytes(originalSize)}`);

		// Generate single-size favicon.ico (32x32)
		console.log('\n🔸 Generating favicon.ico (32x32)...');
		// @ts-ignore Sharp types missing .ico() but runtime supports it
		await sharp(inputPath)
			.resize(32, 32, {
				fit: 'contain',
				background: { r: 255, g: 255, b: 255, alpha: 1 }
			})
			.ico()
			.toFile(join(outputDir, 'favicon.ico'));

		const icoStats = await stat(join(outputDir, 'favicon.ico'));
		console.log(`  📁 ${formatBytes(icoStats.size)}`);

		// Generate PNG icons for various platforms
		const pngSizes = [
			{ name: 'favicon-16x16', size: 16 },
			{ name: 'favicon-32x32', size: 32 },
			{ name: 'apple-touch-icon', size: 180 },
			{ name: 'android-chrome-192x192', size: 192 },
			{ name: 'android-chrome-512x512', size: 512 }
		];

		for (const { name, size } of pngSizes) {
			console.log(`🔸 Generating ${name}.png (${size}x${size})...`);
			const outputPath = join(outputDir, `${name}.png`);
			await sharp(inputPath)
				.resize(size, size, {
					fit: 'contain',
					background: { r: 255, g: 255, b: 255, alpha: 1 } // White background for favicons
				})
				.png({
					quality: 95,
					adaptiveFiltering: true,
					compressionLevel: 9
				})
				.toFile(outputPath);

			const stats = await stat(outputPath);
			console.log(`  📁 ${formatBytes(stats.size)}`);
		}

		console.log('\n✅ All favicon files generated successfully!');
		console.log('📁 Files created in static/:');
		console.log('   - favicon.ico');
		console.log('   - favicon-16x16.png');
		console.log('   - favicon-32x32.png');
		console.log('   - apple-touch-icon.png');
		console.log('   - android-chrome-192x192.png');
		console.log('   - android-chrome-512x512.png');
		console.log('\n💡 Your site.webmanifest already references android-chrome icons.');
		console.log('💡 Add these to src/app.html <head>:');
		console.log('   <link rel="icon" type="image/x-icon" href="/favicon.ico">');
		console.log('   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">');
		console.log('   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">');
		console.log('   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">');
	} catch (error) {
		console.error('❌ Error generating favicons:', error);
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
generateFavicons().catch(console.error);

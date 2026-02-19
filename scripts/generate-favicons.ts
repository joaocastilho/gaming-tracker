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
		await sharp(inputPath)
			.resize(32, 32, {
				fit: 'contain',
				background: { r: 0, g: 0, b: 0, alpha: 0 }
			})
			.png() // Fallback to PNG as .ico() is not natively supported by sharp
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
					background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
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

		// Generate maskable PNG icons
		const maskableSizes = [
			{ name: 'android-chrome-maskable-192x192', size: 192 },
			{ name: 'android-chrome-maskable-512x512', size: 512 }
		];

		const THEME_COLOR = { r: 15, g: 20, b: 25 }; // #0f1419

		for (const { name, size } of maskableSizes) {
			console.log(`🔸 Generating ${name}.png (${size}x${size})...`);
			const outputPath = join(outputDir, `${name}.png`);
			const innerSize = Math.round(size * 0.8);
			const padding = Math.floor((size - innerSize) / 2);

			await sharp(inputPath)
				.resize(innerSize, innerSize, {
					fit: 'contain',
					background: { r: 0, g: 0, b: 0, alpha: 0 }
				})
				.extend({
					top: padding,
					bottom: size - innerSize - padding,
					left: padding,
					right: size - innerSize - padding,
					background: { r: 0, g: 0, b: 0, alpha: 0 }
				})
				.flatten({ background: THEME_COLOR })
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
		console.log('   - android-chrome-maskable-192x192.png');
		console.log('   - android-chrome-maskable-512x512.png');
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

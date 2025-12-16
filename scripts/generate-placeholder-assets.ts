import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const COVERS_DIR = 'static/covers';
const SOURCE_IMAGE = 'placeholder_source.webp'; // Source file (renamed to avoid lock)

async function generatePlaceholders() {
	const sourcePath = path.join(COVERS_DIR, SOURCE_IMAGE);

	if (!fs.existsSync(sourcePath)) {
		console.error(`Source image not found at ${sourcePath}`);
		process.exit(1);
	}

	console.log('Processing placeholder images...');

	// 1. Generate standard cover (300w, usually 600x900 2x density, or just 300x450?)
	// GameCard uses: 300w and 400w (-detail).
	// Let's target:
	// - standard: 600x900 (High quality base) -> stored as .webp
	// - detail: 800x1200 (Higher quality) -> stored as -detail.webp
	// - 200w: 400x600 (2x density for 200px width) -> stored as -200w.webp
	// OR matching existing conventions.
	// Let's check existing convention. `imageSrcset.ts` says:
	// - {id}.webp -> 300w (so ~300px width? or density?)
	// - {id}-detail.webp -> 400w
	// - {id}-200w.webp -> 200w

	// So distinct widths.
	// Aspect Ratio: 2:3.

	const imageInfo = await sharp(sourcePath).metadata();
	console.log(`Source dimensions: ${imageInfo.width}x${imageInfo.height}`);

	const buffer = await sharp(sourcePath).toBuffer();

	// Standard: 300x450
	// Actually, usually we want 2x for retina, so maybe 600x900?
	// Let's stick to the suffix implies usually. 300w implies 300px width slot.
	// If I make it 600px wide, it's good for 2x.
	// Let's go with:
	// - base: 600x900 (treated as '300w' slot candidates often have high res)
	// Wait, let's look at `optimize-covers-full.ts` to see what it does if I can found it?
	// Or just make reasonable assumptions.
	// 600x900 for base.
	// 800x1200 for detail.
	// 400x600 for 200w.

	// Base
	await sharp(buffer)
		.resize(600, 900, { fit: 'cover', position: 'center' })
		.toFile(path.join(COVERS_DIR, 'placeholder_cover.webp'));

	// Detail
	await sharp(buffer)
		.resize(800, 1200, { fit: 'cover', position: 'center' })
		.toFile(path.join(COVERS_DIR, 'placeholder_cover-detail.webp'));

	// 200w
	await sharp(buffer)
		.resize(400, 600, { fit: 'cover', position: 'center' })
		.toFile(path.join(COVERS_DIR, 'placeholder_cover-200w.webp'));

	console.log('Placeholder images generated successfully with correct 2:3 aspect ratio.');
}

generatePlaceholders().catch((err) => {
	console.error(err);
	process.exit(1);
});

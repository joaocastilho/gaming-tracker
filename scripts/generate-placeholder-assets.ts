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

	const buffer = await sharp(sourcePath).toBuffer();
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

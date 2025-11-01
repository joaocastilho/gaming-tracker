const fs = require('fs');
const path = require('path');

function main() {
  // Read the games.json file
  const gamesData = JSON.parse(fs.readFileSync('static/games.json', 'utf8'));

  // Extract all game IDs from the JSON data
  const gameIds = new Set(gamesData.map(game => game.id));
  console.log(`Found ${gameIds.size} game entries in JSON`);

  // Get all PNG files from the covers_raw directory
  const coversRawPath = 'static/covers_raw';
  const imageFiles = fs.readdirSync(coversRawPath).filter(file => file.endsWith('.png'));
  console.log(`Found ${imageFiles.length} PNG files in covers_raw`);

  // Extract just the filename (without extension) for comparison
  const imageBasenames = new Set(imageFiles.map(file => path.parse(file).name));
  console.log(`Extracted ${imageBasenames.size} image basenames`);

  // Find orphaned images (images without corresponding game IDs)
  const orphanedImages = [...imageBasenames].filter(image => !gameIds.has(image));

  console.log('\n=== ORPHANED IMAGES ===');
  console.log(`Images without corresponding game ID: ${orphanedImages.length}`);
  if (orphanedImages.length > 0) {
    console.log('\nList of orphaned images:');
    orphanedImages.sort().forEach(image => {
      console.log(`- ${image}.png`);
    });
  } else {
    console.log('No orphaned images found!');
  }

  // Also check for missing covers (game IDs without corresponding images)
  const missingCovers = [...gameIds].filter(gameId => !imageBasenames.has(gameId));
  console.log('\n=== MISSING COVERS ===');
  console.log(`Game IDs without corresponding images: ${missingCovers.length}`);
  if (missingCovers.length > 0) {
    console.log('List of games missing cover images:');
    missingCovers.sort().forEach(gameId => {
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
}

main();
#!/usr/bin/env bun

/**
 * Generate Large Dataset for Performance Testing
 *
 * This script generates 1000+ games for testing the app's performance
 * with large datasets. It creates realistic game data with proper
 * distribution across platforms, genres, years, and completion status.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Game data templates
const PLATFORMS = [
  'PC', 'PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Xbox One',
  'Nintendo Switch', 'Nintendo 3DS', 'Wii U', 'PlayStation Vita',
  'Steam Deck', 'Mac', 'Linux', 'iOS', 'Android'
];

const GENRES = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
  'Racing', 'Fighting', 'Puzzle', 'Platformer', 'Shooter', 'Horror',
  'Survival', 'Sandbox', 'Rhythm', 'Visual Novel', 'Roguelike'
];

const COOP_STATUS = ['Single Player', 'Co-op', 'Multiplayer'] as const;

// Generate realistic game titles
function generateGameTitle(): string {
  const prefixes = [
    'The Legend of', 'Super', 'Mega', 'Ultra', 'Neo', 'Cyber', 'Quantum',
    'Cosmic', 'Galactic', 'Infinite', 'Eternal', 'Mystic', 'Ancient',
    'Modern', 'Future', 'Retro', 'Classic', 'Epic', 'Legendary'
  ];

  const nouns = [
    'Warrior', 'Hero', 'Quest', 'Journey', 'Adventure', 'Saga', 'Tale',
    'Story', 'Chronicles', 'Odyssey', 'Expedition', 'Mission', 'Battle',
    'War', 'Empire', 'Kingdom', 'World', 'Universe', 'Galaxy', 'Planet'
  ];

  const suffixes = [
    'Remastered', 'HD', 'Collection', 'Definitive Edition', 'Ultimate Edition',
    'Director\'s Cut', 'Special Edition', 'Anniversary Edition', 'Reloaded',
    'Evolution', 'Revolution', 'Awakening', 'Ascension', 'Legacy'
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const suffix = Math.random() > 0.7 ? ` ${suffixes[Math.floor(Math.random() * suffixes.length)]}` : '';

  return `${prefix} ${noun}${suffix}`;
}

// Generate random ratings (0-10)
function generateRating(): number {
  // Normal distribution around 7-8
  const mean = 7.5;
  const stdDev = 1.5;
  let rating;
  do {
    rating = mean + (Math.random() - 0.5) * 4 * stdDev;
  } while (rating < 0 || rating > 10);
  return Math.round(rating * 10) / 10;
}

// Generate random year (1980-2025)
function generateYear(): number {
  const currentYear = 2025;
  const minYear = 1980;
  const weights = [];

  // Weight more recent years higher
  for (let year = minYear; year <= currentYear; year++) {
    const weight = Math.max(1, (year - minYear) / (currentYear - minYear) * 10);
    weights.push(weight);
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return minYear + i;
    }
  }

  return currentYear;
}

// Generate random hours played (for completed games)
function generateHoursPlayed(): string {
  const hours = Math.floor(Math.random() * 200) + 1; // 1-200 hours
  const minutes = Math.floor(Math.random() * 60);
  return `${hours}h ${minutes}m`;
}

// Generate random finished date (within last 10 years)
function generateFinishedDate(): string {
  const now = new Date();
  const tenYearsAgo = new Date(now.getTime() - 10 * 365 * 24 * 60 * 60 * 1000);
  const randomTime = tenYearsAgo.getTime() + Math.random() * (now.getTime() - tenYearsAgo.getTime());
  return new Date(randomTime).toISOString().split('T')[0];
}

// Generate random time to beat (in hours)
function generateTimeToBeat(): number {
  // Most games take 2-20 hours
  return Math.floor(Math.random() * 18) + 2;
}

// Generate cover image path
function generateCoverImage(title: string): string {
  // Create a slug from the title for the image name
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `covers/${slug}.webp`;
}

// Game interface for type safety
interface GeneratedGame {
  id: string;
  title: string;
  platform: string;
  year: number;
  genre: string;
  coOp: string;
  timeToBeat: number;
  status: 'Completed' | 'Planned';
  coverImage: string;
  finishedDate?: string;
  hoursPlayed?: string;
  ratingPresentation?: number;
  ratingStory?: number;
  ratingGameplay?: number;
  totalScore?: number;
  tier?: string;
}

// Main generation function
function generateLargeDataset(count: number = 1500): GeneratedGame[] {
  const games: GeneratedGame[] = [];

  console.log(`Generating ${count} games for performance testing...`);

  for (let i = 0; i < count; i++) {
    const title = generateGameTitle();
    const year = generateYear();
    const platform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
    const genre = GENRES[Math.floor(Math.random() * GENRES.length)];
    const coOp = COOP_STATUS[Math.floor(Math.random() * COOP_STATUS.length)];
    const timeToBeat = generateTimeToBeat();

    // 70% completed, 30% planned
    const isCompleted = Math.random() < 0.7;
    const status = isCompleted ? 'Completed' : 'Planned';

    const game: GeneratedGame = {
      id: `game-${i + 1}`,
      title,
      platform,
      year,
      genre,
      coOp,
      timeToBeat,
      status,
      coverImage: generateCoverImage(title)
    };

    if (isCompleted) {
      // Add completion data
      game.finishedDate = generateFinishedDate();
      game.hoursPlayed = generateHoursPlayed();

      // Add ratings
      game.ratingPresentation = generateRating();
      game.ratingStory = generateRating();
      game.ratingGameplay = generateRating();

      // Calculate total score
      game.totalScore = Math.round(((game.ratingPresentation + game.ratingStory + game.ratingGameplay) / 3) * 2);

      // Assign tier based on total score
      if (game.totalScore >= 18) game.tier = 'S';
      else if (game.totalScore >= 16) game.tier = 'A';
      else if (game.totalScore >= 14) game.tier = 'B';
      else if (game.totalScore >= 12) game.tier = 'C';
      else if (game.totalScore >= 10) game.tier = 'D';
      else game.tier = 'E';
    }

    games.push(game);

    if ((i + 1) % 100 === 0) {
      console.log(`Generated ${i + 1} games...`);
    }
  }

  console.log(`✅ Generated ${games.length} games successfully!`);
  console.log(`📊 Distribution:`);
  console.log(`   - Completed: ${games.filter(g => g.status === 'Completed').length}`);
  console.log(`   - Planned: ${games.filter(g => g.status === 'Planned').length}`);
  console.log(`   - Platforms: ${new Set(games.map(g => g.platform)).size} unique`);
  console.log(`   - Genres: ${new Set(games.map(g => g.genre)).size} unique`);

  return games;
}

// Generate and save the dataset
function main() {
  const count = parseInt(process.argv[2] || '1500');
  const games = generateLargeDataset(count);

  const outputPath = join(process.cwd(), 'static', 'games-large.json');
  writeFileSync(outputPath, JSON.stringify(games, null, 2));

  console.log(`💾 Saved large dataset to: ${outputPath}`);
  console.log(`📈 Dataset size: ${(JSON.stringify(games).length / 1024 / 1024).toFixed(2)} MB`);
  console.log(`🎯 Ready for performance testing!`);
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { generateLargeDataset };

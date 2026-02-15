// Platform color mappings using CSS variables for automatic theme switching
// Dark mode: translucent backgrounds with bright text
// Light mode: light backgrounds with dark text

export function getPlatformClasses(platform: string): string {
	const colorKey = PLATFORM_COLORS[platform] || 'platform-pc';
	return `${colorKey}-badge`;
}

export function getGenreClasses(genre: string): string {
	const colorKey = GENRE_COLORS[genre] || 'genre-action';
	return `${colorKey}-badge`;
}

export const PLATFORM_COLORS: Record<string, string> = {
	PC: 'platform-pc',
	PS5: 'platform-ps5',
	PS4: 'platform-ps4',
	PS3: 'platform-ps3',
	PS2: 'platform-ps2',
	PS1: 'platform-ps1',
	Switch: 'platform-switch',
	'3DS': 'platform-3ds',
	N64: 'platform-n64',
	GameCube: 'platform-gamecube',
	'Game Boy Advance': 'platform-gba',
	Xbox: 'platform-xbox',
	'Xbox 360': 'platform-xbox-360',
	'Xbox Series X': 'platform-xbox-series',
	Dreamcast: 'platform-dreamcast'
};

// Genre color mappings using CSS variables
export const GENRE_COLORS: Record<string, string> = {
	// Action genres
	Action: 'genre-action',
	'Action Platformer': 'genre-action-platformer',
	'Bullet Hell': 'genre-bullet-hell',
	'Hack & Slash': 'genre-hack-slash',

	// Adventure genres
	'Action Adventure': 'genre-action-adventure',
	'Story Adventure': 'genre-story-adventure',

	// RPG genres
	'Action RPG': 'genre-action-rpg',
	'Classic RPG': 'genre-classic-rpg',
	'Japanese RPG': 'genre-japanese-rpg',
	'Sandbox RPG': 'genre-sandbox-rpg',
	'Story RPG': 'genre-story-rpg',

	// Platformer genres
	Platformer: 'genre-platformer',
	'Puzzle Platformer': 'genre-puzzle-platformer',
	'Story Platformer': 'genre-story-platformer',

	// Puzzle genres
	Puzzle: 'genre-puzzle',
	'Story Puzzle': 'genre-story-puzzle',

	// Horror genres
	'Survival Horror': 'genre-survival-horror',
	'Story Horror': 'genre-story-horror',
	'Horror RPG': 'genre-horror-rpg',

	// Other genres
	FPS: 'genre-fps',
	Metroidvania: 'genre-metroidvania',
	Roguelike: 'genre-roguelike',
	Strategy: 'genre-strategy',
	Survival: 'genre-survival'
};

// Tier color mappings - use CSS classes from app.css
export const TIER_COLORS: Record<string, string> = {
	'S - Masterpiece': 'tier-s',
	'A - Amazing': 'tier-a',
	'B - Great': 'tier-b',
	'C - Good': 'tier-c',
	'D - Decent': 'tier-d',
	'E - Bad': 'tier-e'
};

// Tier display names
export const TIER_LABELS: Record<string, string> = {
	S: 'S - Masterpiece',
	A: 'A - Amazing',
	B: 'B - Great',
	C: 'C - Good',
	D: 'D - Decent',
	E: 'E - Bad'
};

export const COOP_COLORS: Record<string, string> = {
	Yes: 'coop-yes',
	No: 'coop-no'
};

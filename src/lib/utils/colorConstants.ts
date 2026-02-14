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
	PS1: 'platform-ps2', // Group with PS2
	Switch: 'platform-switch',
	'3DS': 'platform-switch', // Group with Switch
	N64: 'platform-switch', // Group with Switch
	GameCube: 'platform-switch', // Group with Switch
	'Game Boy Advance': 'platform-switch', // Group with Switch
	Xbox: 'platform-xbox',
	'Xbox 360': 'platform-xbox-360',
	'Xbox Series X': 'platform-xbox',
	Dreamcast: 'platform-xbox' // Use Xbox colors
};

// Genre color mappings using CSS variables
export const GENRE_COLORS: Record<string, string> = {
	// Action genres
	Action: 'genre-action',
	'Action Platformer': 'genre-action',
	'Bullet Hell': 'genre-action',
	'Hack & Slash': 'genre-hack-slash',

	// Adventure genres
	'Action Adventure': 'genre-action-adventure',
	'Story Adventure': 'genre-story-adventure',

	// RPG genres
	'Action RPG': 'genre-action-rpg',
	'Classic RPG': 'genre-classic-rpg',
	'Japanese RPG': 'genre-japanese-rpg',
	'Sandbox RPG': 'genre-action-rpg', // Group with Action RPG
	'Story RPG': 'genre-story-rpg',

	// Platformer genres
	Platformer: 'genre-platformer',
	'Puzzle Platformer': 'genre-puzzle-platformer',
	'Story Platformer': 'genre-platformer', // Group with Platformer

	// Puzzle genres
	Puzzle: 'genre-puzzle',
	'Story Puzzle': 'genre-story-puzzle',

	// Horror genres
	'Survival Horror': 'genre-survival-horror',
	'Story Horror': 'genre-story-horror',
	'Horror RPG': 'genre-survival-horror', // Group with Survival Horror

	// Other genres
	FPS: 'genre-fps',
	Metroidvania: 'genre-metroidvania',
	Roguelike: 'genre-roguelike',
	Strategy: 'genre-strategy',
	Survival: 'genre-survival-horror' // Group with Survival Horror
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

// Co-op is now shown as icon only, not badge
// Keeping for backwards compatibility
export const COOP_COLORS: Record<string, string> = {
	Yes: 'coop-yes',
	No: 'coop-no'
};

// Platform display names
export const PLATFORM_LABELS: Record<string, string> = {
	PC: 'PC',
	PS5: 'PS5',
	PS4: 'PlayStation 4',
	PS3: 'PlayStation 3',
	PS2: 'PlayStation 2',
	PS1: 'PlayStation 1',
	Switch: 'Nintendo Switch',
	'3DS': 'Nintendo 3DS',
	N64: 'Nintendo 64',
	GameCube: 'GameCube',
	'Game Boy Advance': 'Game Boy Advance',
	Xbox: 'Xbox',
	'Xbox 360': 'Xbox 360',
	'Xbox Series X': 'Xbox Series X',
	Dreamcast: 'Dreamcast'
};

// Genre display names
export const GENRE_LABELS: Record<string, string> = {
	Platformer: 'Platformer',
	'Action Platformer': 'Action Platformer',
	'Puzzle Platformer': 'Puzzle Platformer',
	'Story Platformer': 'Story Platformer',
	'Story Adventure': 'Story Adventure',
	'Action Adventure': 'Action Adventure',
	'Survival Horror': 'Survival Horror',
	'Story Puzzle': 'Story Puzzle',
	Puzzle: 'Puzzle',
	'Action RPG': 'Action RPG',
	'Classic RPG': 'Classic RPG',
	'Japanese RPG': 'Japanese RPG',
	'Sandbox RPG': 'Sandbox RPG',
	'Story RPG': 'Story RPG',
	FPS: 'FPS',
	Action: 'Action',
	'Bullet Hell': 'Bullet Hell',
	'Hack & Slash': 'Hack & Slash',
	Survival: 'Survival',
	Strategy: 'Strategy',
	Metroidvania: 'Metroidvania',
	Roguelike: 'Roguelike',
	'Story Horror': 'Story Horror',
	'Horror RPG': 'Horror RPG'
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

// Progress bar color based on rating value
export function getRatingBarColor(rating: number | null): string {
	if (rating === null) return 'progress-bar-fill-empty';
	if (rating >= 8) return 'progress-bar-fill high';
	if (rating >= 6) return 'progress-bar-fill medium';
	if (rating >= 4) return 'progress-bar-fill low';
	return 'progress-bar-fill very-low';
}

// Rating colors for text/icons
export const RATING_COLORS = {
	presentation: 'text-rose-500',
	story: 'text-sky-500',
	gameplay: 'text-emerald-500',
	total: 'text-amber-500'
};

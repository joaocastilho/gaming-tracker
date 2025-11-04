// Centralized color constants for platforms, genres, and tiers
// Used by GameCard component and filter utilities for consistent theming

// Platform color mappings - each platform has its own widely different, vibrant, colorful unique color
export const PLATFORM_COLORS: Record<string, string> = {
	PC: 'bg-[#4c1d95] text-[#a78bfa]', // Deep purple
	PS4: 'bg-[#f59e0b] text-[#fef3c7]', // Bright amber
	PS3: 'bg-[#ef4444] text-[#fecaca]', // Bright red
	PS2: 'bg-[#a855f7] text-[#e9d5ff]', // Bright purple
	PS1: 'bg-[#f97316] text-white', // Vibrant orange
	Switch: 'bg-[#22c55e] text-[#dcfce7]', // Bright green
	'3DS': 'bg-[#ec4899] text-[#fce7f3]', // Bright pink
	N64: 'bg-[#eab308] text-[#fef3c7]', // Bright yellow
	GameCube: 'bg-[#06b6d4] text-[#cffafe]', // Bright cyan
	'Game Boy Advance': 'bg-[#dc2626] text-[#fca5a5]', // Crimson red
	Xbox: 'bg-[#166534] text-[#dcfce7]', // Dark green
	'Xbox 360': 'bg-[#65a30d] text-[#f7f9e3]', // Bright lime green
	Dreamcast: 'bg-[#0d9488] text-[#ccfbf1]' // Bright teal
};

// Genre color mappings - each genre has its own widely different, vibrant, colorful unique color
export const GENRE_COLORS: Record<string, string> = {
	// Each genre gets its own widely different, vibrant, colorful unique color
	Platformer: 'bg-[#ea580c] text-[#fed7aa]', // Bright orange
	'Action Platformer': 'bg-[#ef4444] text-[#fecaca]', // Bright red
	'Puzzle Platformer': 'bg-[#a855f7] text-[#e9d5ff]', // Bright purple
	'Story Platformer': 'bg-[#f97316] text-white', // Vibrant orange
	'Story Adventure': 'bg-[#eab308] text-[#fef3c7]', // Bright yellow
	'Action Adventure': 'bg-[#06b6d4] text-[#cffafe]', // Bright cyan
	'Survival Horror': 'bg-[#9333ea] text-[#f3e8ff]', // Bright purple
	'Story Puzzle': 'bg-[#ec4899] text-[#fce7f3]', // Bright pink
	Puzzle: 'bg-[#22c55e] text-[#dcfce7]', // Bright green
	'Action RPG': 'bg-[#f59e0b] text-[#fef3c7]', // Bright amber
	'Classic RPG': 'bg-[#dc2626] text-[#fca5a5]', // Crimson red
	'Japanese RPG': 'bg-[#059669] text-[#a7f3d0]', // Emerald green
	'Sandbox RPG': 'bg-[#0891b2] text-[#ecfeff]', // Bright cyan-blue
	'Story RPG': 'bg-[#be123c] text-[#f9a8d4]', // Hot pink
	FPS: 'bg-[#b91c1c] text-[#fecaca]', // Scarlet red
	Action: 'bg-[#7f1d1d] text-[#fecaca]', // Burgundy red
	'Bullet Hell': 'bg-[#991b1b] text-[#fca5a5]', // Dark red
	'Hack & Slash': 'bg-[#92400e] text-[#fed7aa]', // Burnt orange
	Survival: 'bg-[#16a34a] text-[#dcfce7]', // Bright green
	Strategy: 'bg-[#6366f1] text-[#e0e7ff]', // Bright blue
	Metroidvania: 'bg-[#4c1d95] text-[#ddd6fe]', // Deep purple
	Roguelike: 'bg-[#c2410c] text-[#fed7aa]', // Dark orange
	'Story Horror': 'bg-[#581c87] text-[#d8b4fe]', // Royal purple
	'Horror RPG': 'bg-[#0d9488] text-[#ccfbf1]' // Bright teal
};

// Tier color mappings - uses full names as keys (matching display format)
export const TIER_COLORS: Record<string, string> = {
	'S - Masterpiece': 'bg-[#dc2626] text-white', // Red background, white text
	'A - Amazing': 'bg-[#f97316] text-white', // Orange background, white text
	'B - Great': 'bg-[#eab308] text-white', // Yellow background, white text
	'C - Good': 'bg-[#22c55e] text-white', // Green background, white text
	'D - Decent': 'bg-[#06b6d4] text-white', // Cyan background, white text
	'E - Bad': 'bg-[#6b7280] text-white' // Gray background, white text
};

// Centralized display labels for platforms, genres, and tiers
// Used by components to ensure consistent labeling across the app

// Platform display names
export const PLATFORM_LABELS: Record<string, string> = {
	PC: 'PC',
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

// Tier display names (for display purposes - maps single letters to full names)
export const TIER_LABELS: Record<string, string> = {
	S: 'S - Masterpiece',
	A: 'A - Amazing',
	B: 'B - Great',
	C: 'C - Good',
	D: 'D - Decent',
	E: 'E - Bad'
};

// Utility function to get full tier display name
export const getTierDisplayName = (tierLetter: string): string => {
	return TIER_LABELS[tierLetter] || tierLetter;
};

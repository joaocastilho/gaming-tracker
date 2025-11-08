// Platform color mappings
export const PLATFORM_COLORS: Record<string, string> = {
	PC: 'bg-[#1e40af] text-white', // Royal blue (changed from purple)
	PS4: 'bg-[#f59e0b] text-[#fef3c7]', // Bright amber
	PS3: 'bg-[#ef4444] text-[#fecaca]', // Bright red
	PS2: 'bg-[#a855f7] text-[#e9d5ff]', // Bright purple
	PS1: 'bg-[#f97316] text-white', // Vibrant orange
	Switch: 'bg-[#22c55e] text-[#dcfce7]', // Bright green
	'3DS': 'bg-[#ec4899] text-[#fce7f3]', // Bright pink
	N64: 'bg-[#7c3aed] text-white', // Electric purple (changed from bright yellow)
	GameCube: 'bg-[#06b6d4] text-[#cffafe]', // Bright cyan
	'Game Boy Advance': 'bg-[#dc2626] text-[#fca5a5]', // Crimson red
	Xbox: 'bg-[#166534] text-[#dcfce7]', // Dark green
	'Xbox 360': 'bg-[#65a30d] text-[#f7f9e3]', // Bright lime green
	Dreamcast: 'bg-[#0d9488] text-[#ccfbf1]' // Bright teal
};

// Genre color mappings
export const GENRE_COLORS: Record<string, string> = {
	// Highly distinct colors, guaranteeing separation and white text readability

	// REDS / ORANGES
	Platformer: 'bg-[#b91c1c] text-white', // Deep Red (Base)
	'Action Platformer': 'bg-[#991b1b] text-white', // Darker Red
	'Hack & Slash': 'bg-[#d97706] text-white', // Dark Amber
	Survival: 'bg-[#78350f] text-white', // Deep Brown
	'Bullet Hell': 'bg-[#ea580c] text-white', // Burnt Orange
	Action: 'bg-[#ef4444] text-white', // Primary Red

	// BLUES / TEALS
	'Action Adventure': 'bg-[#1e40af] text-white', // Strong Royal Blue
	'Story Adventure': 'bg-[#4338ca] text-white', // Bright Indigo
	'Action RPG': 'bg-[#0369a1] text-white', // Sapphire Blue

	// PURPLES / MAGENTAS
	'Puzzle Platformer': 'bg-[#581c87] text-white', // Deep Violet
	'Story Platformer': 'bg-[#7c3aed] text-white', // Royal Purple
	'Classic RPG': 'bg-[#4f46e5] text-white', // Indigo
	'Japanese RPG': 'bg-[#8b5cf6] text-white', // Medium Purple
	'Sandbox RPG': 'bg-[#c026d3] text-white', // Magenta
	'Story RPG': 'bg-[#db2777] text-white', // Deep Pink
	FPS: 'bg-[#9f1239] text-white', // Wine Red

	// GREENS / CYANS / UTILITY
	Puzzle: 'bg-[#15803d] text-white', // Dark Green (Base)
	'Story Puzzle': 'bg-[#047871] text-white', // Deep Teal
	'Story Horror': 'bg-[#065f46] text-white', // Forest Green
	'Horror RPG': 'bg-[#4d7c0f] text-white', // Olive Green
	'Survival Horror': 'bg-[#57534e] text-white', // Dark Slate Gray
	Strategy: 'bg-[#44403c] text-white', // Dark Gray/Slate
	Metroidvania: 'bg-[#a16207] text-white', // Dark Goldenrod
	Roguelike: 'bg-[#0f766e] text-white' // Dark Cyan
};

// Tier color mappings
export const TIER_COLORS: Record<string, string> = {
	'S - Masterpiece': 'bg-[#dc2626] text-white', // Red background, white text
	'A - Amazing': 'bg-[#f97316] text-white', // Orange background, white text
	'B - Great': 'bg-[#eab308] text-white', // Yellow background, white text
	'C - Good': 'bg-[#22c55e] text-white', // Green background, white text
	'D - Decent': 'bg-[#06b6d4] text-white', // Cyan background, white text
	'E - Bad': 'bg-[#6b7280] text-white' // Gray background, white text
};

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

export const getTierDisplayName = (tierLetter: string): string => {
	return TIER_LABELS[tierLetter] || tierLetter;
};

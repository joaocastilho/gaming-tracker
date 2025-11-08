// Platform color mappings - each platform has its own widely different, vibrant, colorful unique color
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

// Genre color mappings - maximally distinct, unique colors with white text
export const GENRE_COLORS: Record<string, string> = {
	// Each genre gets a completely unique color with maximum visual distinction
	Platformer: 'bg-[#dc2626] text-white', // Scarlet red
	'Action Platformer': 'bg-[#991b1b] text-white', // Dark red
	'Puzzle Platformer': 'bg-[#7c2d12] text-white', // Deep brown
	'Story Platformer': 'bg-[#92400e] text-white', // Dark orange
	'Story Adventure': 'bg-[#a16207] text-white', // Amber
	'Action Adventure': 'bg-[#ca8a04] text-white', // Yellow
	'Survival Horror': 'bg-[#65a30d] text-white', // Lime green
	'Story Puzzle': 'bg-[#16a34a] text-white', // Emerald green
	Puzzle: 'bg-[#059669] text-white', // Teal green
	'Action RPG': 'bg-[#0891b2] text-white', // Sky blue
	'Classic RPG': 'bg-[#0284c7] text-white', // Bright blue
	'Japanese RPG': 'bg-[#2563eb] text-white', // Royal blue
	'Sandbox RPG': 'bg-[#4f46e5] text-white', // Indigo
	'Story RPG': 'bg-[#7c3aed] text-white', // Purple
	FPS: 'bg-[#9333ea] text-white', // Violet
	Action: 'bg-[#c026d3] text-white', // Magenta
	'Bullet Hell': 'bg-[#db2777] text-white', // Pink
	'Hack & Slash': 'bg-[#e11d48] text-white', // Rose
	Survival: 'bg-[#ea580c] text-white', // Orange
	Strategy: 'bg-[#f97316] text-white', // Pumpkin
	Metroidvania: 'bg-[#f59e0b] text-white', // Amber
	Roguelike: 'bg-[#eab308] text-white', // Yellow
	'Story Horror': 'bg-[#84cc16] text-white', // Lime
	'Horror RPG': 'bg-[#22c55e] text-white' // Emerald
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

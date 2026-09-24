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
	Dreamcast: 'platform-dreamcast',
};

// Genre color mappings for the genres currently used by the library.
export const GENRE_COLORS: Record<string, string> = {
	Action: 'genre-action',
	'Action Adventure': 'genre-action-adventure',
	RPG: 'genre-rpg',
	Shooter: 'genre-shooter',
	Horror: 'genre-horror',
	Platformer: 'genre-platformer',
	Puzzle: 'genre-puzzle',
	Metroidvania: 'genre-metroidvania',
	Strategy: 'genre-strategy',
	Survival: 'genre-survival',
};

export type ColorTheme = 'dark' | 'light';

export const GENRE_CHART_COLORS: Record<string, Record<ColorTheme, string>> = {
	Action: { dark: '#E6194B', light: '#E6194B' },
	'Action Adventure': { dark: '#4363D8', light: '#4363D8' },
	RPG: { dark: '#FFE119', light: '#FFE119' },
	Shooter: { dark: '#3CB44B', light: '#3CB44B' },
	Horror: { dark: '#9A6324', light: '#9A6324' },
	Platformer: { dark: '#F032E6', light: '#F032E6' },
	Puzzle: { dark: '#42D4F4', light: '#42D4F4' },
	Metroidvania: { dark: '#911EB4', light: '#911EB4' },
	Strategy: { dark: '#008080', light: '#008080' },
	Survival: { dark: '#F58231', light: '#F58231' },
};

export function getGenreChartColor(genre: string, theme: ColorTheme): string {
	return GENRE_CHART_COLORS[genre]?.[theme] ?? GENRE_CHART_COLORS.Action[theme];
}

export const COOP_COLORS: Record<string, string> = {
	Yes: 'coop-yes',
	No: 'coop-no',
};

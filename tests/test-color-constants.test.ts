import { describe, expect, it } from 'vitest';
import { getGenreChartColor, getGenreClasses } from '$lib/utils/colorConstants';

describe('genre color constants', () => {
	it('gives the main genre families distinct chart colors in both themes', () => {
		const genres = [
			'Action',
			'Action Adventure',
			'Puzzle',
			'RPG',
			'Horror',
			'Shooter',
			'Platformer',
			'Metroidvania',
			'Survival',
			'Strategy',
		];
		const darkColors = genres.map((genre) => getGenreChartColor(genre, 'dark'));
		const lightColors = genres.map((genre) => getGenreChartColor(genre, 'light'));

		expect(new Set(darkColors).size).toBe(genres.length);
		expect(new Set(lightColors).size).toBe(genres.length);
	});

	it('uses dedicated website badge classes for the main genre families', () => {
		expect(getGenreClasses('RPG')).toBe('genre-rpg-badge');
		expect(getGenreClasses('Shooter')).toBe('genre-shooter-badge');
		expect(getGenreClasses('Horror')).toBe('genre-horror-badge');
	});
});

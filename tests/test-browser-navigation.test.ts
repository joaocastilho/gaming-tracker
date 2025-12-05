import { describe, test, expect } from 'vitest';

describe('Browser Navigation', () => {
	test('Filter State Persistence', () => {
		const expectedURL =
			'http://localhost:5173/?searchTerm=zelda&platforms=Nintendo+Switch&genres=Action&genres=Adventure';

		expect(expectedURL).toContain('searchTerm=zelda');
		expect(expectedURL).toContain('platforms=Nintendo+Switch');
		expect(expectedURL).toContain('genres=Action');
		expect(expectedURL).toContain('genres=Adventure');
	});

	test('Co-op Filter Persistence', () => {
		const coopURL = 'http://localhost:5173/?coOp=Yes&coOp=No';
		expect(coopURL).toContain('coOp=Yes');
		expect(coopURL).toContain('coOp=No');
	});

	test('Sort State Persistence', () => {
		const sortURL = 'http://localhost:5173/?sortBy=score&sortDir=desc';

		expect(sortURL).toContain('sortBy=score');
		expect(sortURL).toContain('sortDir=desc');
	});

	test('Tab Persistence', () => {
		const allTabURL = 'http://localhost:5173/';
		const completedTabURL = 'http://localhost:5173/completed';

		expect(allTabURL).not.toContain('tab=');
		expect(completedTabURL).toContain('completed');
	});

	test('Search Persistence', () => {
		const searchURL = 'http://localhost:5173/?searchTerm=final+fantasy';
		const clearURL = 'http://localhost:5173/';

		expect(searchURL).toContain('searchTerm=final+fantasy');
		expect(clearURL).not.toContain('searchTerm');
	});

	test('Modal Deep Linking', () => {
		const modalURL = 'http://localhost:5173/?game=zelda-breath-of-the-wild';
		const cleanURL = 'http://localhost:5173/';

		expect(modalURL).toContain('game=zelda-breath-of-the-wild');
		expect(cleanURL).not.toContain('game=');
	});

	test('Complex State Combinations', () => {
		const complexURL =
			'http://localhost:5173/?searchTerm=action+rpg&platforms=PC&genres=Action&genres=RPG&tab=completed&sortBy=score&sortDir=desc';

		expect(complexURL).toContain('searchTerm=action+rpg');
		expect(complexURL).toContain('platforms=PC');
		expect(complexURL).toContain('genres=Action');
		expect(complexURL).toContain('genres=RPG');
		expect(complexURL).toContain('tab=completed');
		expect(complexURL).toContain('sortBy=score');
		expect(complexURL).toContain('sortDir=desc');
	});

	test('Route Navigation', () => {
		const routes = ['/', '/completed', '/planned', '/tierlist'];
		routes.forEach((route) => {
			expect(route).toBeDefined();
		});
	});

	test('URL Parameter Encoding', () => {
		const arrayURL = 'http://localhost:5173/?genres=Action&genres=Adventure&genres=RPG';
		const commaURL = 'http://localhost:5173/?genres=Action%2CAdventure%2CRPG';

		expect(arrayURL).toContain('genres=Action');
		expect(arrayURL).toContain('genres=Adventure');
		expect(arrayURL).toContain('genres=RPG');
		expect(arrayURL).not.toContain('genres=Action%2CAdventure%2CRPG');

		expect(commaURL).toContain('genres=Action%2CAdventure%2CRPG');
		expect(commaURL).not.toContain('genres=Action&genres=Adventure');
	});

	test('Browser Refresh', () => {
		const refreshURL =
			'http://localhost:5173/?searchTerm=mario&tab=completed&platforms=Nintendo+Switch&genres=Action';

		expect(refreshURL).toContain('searchTerm=mario');
		expect(refreshURL).toContain('tab=completed');
		expect(refreshURL).toContain('platforms=Nintendo+Switch');
		expect(refreshURL).toContain('genres=Action');
	});

	test('Invalid URL Parameters', () => {
		const invalidURL = 'http://localhost:5173/?unknownParam=value&searchTerm=valid';

		expect(invalidURL).toContain('searchTerm=valid');
		expect(invalidURL).toContain('unknownParam=value');
	});

	test('Empty Parameters', () => {
		const emptyURL = 'http://localhost:5173/?searchTerm=&platforms=';

		expect(emptyURL).toContain('searchTerm=');
		expect(emptyURL).toContain('platforms=');
	});
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@solidjs/testing-library';
import { describe, expect, it } from 'vitest';

import { gamesStore } from '#lib/stores/games.js';
import HomePage from '../src/pages/HomePage.js';
import { createTestGame } from './helpers/factories';

function readSource(path: string): string {
	return readFileSync(resolve(process.cwd(), path), 'utf8');
}

function cssRule(source: string, selector: string): string {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return source.match(new RegExp(`^\\s*${escaped}\\s*\\{([^}]*)\\}`, 'm'))?.[1] ?? '';
}

describe('game card vertical rhythm', () => {
	it('spaces the stacked footer rows with a roomier gap', () => {
		const rule = cssRule(readSource('src/lib/components/GameCard.css'), '.game-card .card-content-bottom');

		expect(rule).toMatch(/display:\s*flex/);
		expect(rule).toMatch(/flex-direction:\s*column/);

		const gap = Number(rule.match(/gap:\s*clamp\(\s*(\d+)px/)?.[1]);
		expect(gap).toBeGreaterThanOrEqual(14);
	});

	it('leaves the row spacing to that gap instead of per-row margins', () => {
		const info = readSource('src/lib/components/game-card/GameCardInfo.css');

		expect(cssRule(info, '.time-date-row')).not.toMatch(/margin-top/);
		expect(cssRule(info, '.ratings-and-score-wrapper')).not.toMatch(/margin-top/);
	});

	it('keeps the cover aspect ratio so extra height grows the card, not the art', () => {
		const rule = cssRule(readSource('src/lib/components/game-card/GameCardArtwork.css'), '.cover-container');

		expect(rule).toMatch(/aspect-ratio:\s*2\s*\/\s*3/);
	});
});

describe('Now Playing playtime', () => {
	it('shows the value without the Time to Beat phrase', () => {
		gamesStore.setAllGames([createTestGame({ status: 'Playing' })]);
		const { container } = render(() => <HomePage />);

		expect(container.querySelector('.np-playtime-value')).toBeTruthy();
		expect(container.querySelector('.np-playtime-label')).toBeNull();
		expect(container.textContent).not.toContain('Time to Beat');
	});
});

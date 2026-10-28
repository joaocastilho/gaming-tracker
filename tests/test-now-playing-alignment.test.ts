import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readHomeSource(): string {
	return readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
}

function cssRule(source: string, selector: string): string {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return source.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
}

/**
 * A single in-progress game used to stretch to an arbitrary 800px card, so it
 * did not share a column with the Recent Completions grid below. The row now
 * uses the same auto-fill track as that grid, and each card fills exactly one
 * track.
 */
describe('Now Playing cards align with the rest of the page', () => {
	it('uses the same grid track and gap as Recent Completions', () => {
		const source = readHomeSource();
		const npRow = cssRule(source, '.np-scroll-row');
		const recentGrid = cssRule(source, '.recent-grid');

		expect(npRow).toMatch(/display:\s*grid/);
		expect(npRow).toMatch(/grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(300px,\s*1fr\)\)/);
		expect(npRow).toMatch(/gap:\s*12px/);
		expect(recentGrid).toMatch(/grid-template-columns:\s*repeat\(auto-fill,\s*minmax\(300px,\s*1fr\)\)/);
		expect(recentGrid).toMatch(/gap:\s*12px/);
	});

	it('lets each card fill one column instead of stretching', () => {
		const card = cssRule(readHomeSource(), '.np-scroll-row .np-card');

		expect(card).toMatch(/width:\s*100%/);
		expect(card).not.toMatch(/max-width:\s*800px/);
		expect(card).not.toMatch(/flex:\s*1 1 420px/);
	});

	it('falls back to one column on phones', () => {
		const source = readHomeSource();
		const mobileBlocks = Array.from(source.matchAll(/@media \(max-width: 767px\)\s*\{([\s\S]*?)\n\t\}/g)).map(
			(match) => match[1]
		);
		const npMobile = mobileBlocks.find((block) => block.includes('.np-scroll-row')) ?? '';

		expect(npMobile).toMatch(/grid-template-columns:\s*1fr/);
	});
});

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function readHomeSource(): string {
	return readFileSync(resolve(process.cwd(), 'src/routes/+page.svelte'), 'utf8');
}

function cssRule(source: string, selector: string): string {
	const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Anchor at line start so a descendant rule like `.np-card:hover .np-cover`
	// cannot win over the base `.np-cover` rule.
	return source.match(new RegExp(`^\\s*${escaped}\\s*\\{([^}]*)\\}`, 'm'))?.[1] ?? '';
}

/**
 * The showcase row: poster-sized cards that fill themselves with cover art,
 * left-aligned and width-capped near the recent-completion card width so a
 * lone card cannot stretch to the full 1600px container and the row lines up
 * with the section heading.
 */
describe('Now Playing poster cards', () => {
	it('left-aligns the row and caps card width near the recent-completion cards', () => {
		const source = readHomeSource();
		const grid = cssRule(source, '.np-grid');
		const card = cssRule(source, '.np-card');

		expect(grid).toMatch(/display:\s*flex/);
		expect(grid).toMatch(/flex-wrap:\s*wrap/);
		expect(grid).toMatch(/justify-content:\s*flex-start/);
		expect(card).toMatch(/flex:\s*0 1 \d+px/);

		const maxWidth = Number(card.match(/max-width:\s*(\d+)px/)?.[1]);
		expect(maxWidth).toBeGreaterThan(0);
		expect(maxWidth).toBeLessThanOrEqual(340);
	});

	it('fills the card with cover art on a poster aspect ratio', () => {
		const source = readHomeSource();
		const card = cssRule(source, '.np-card');
		const cover = cssRule(source, '.np-cover');

		expect(card).toMatch(/aspect-ratio:\s*4\s*\/\s*5/);
		expect(cover).toMatch(/position:\s*absolute/);
		expect(cover).toMatch(/object-fit:\s*cover/);
	});

	it('fades the text overlay into the themed surface for both themes', () => {
		const shade = cssRule(readHomeSource(), '.np-shade');

		expect(shade).toMatch(/linear-gradient\(/);
		expect(shade).toContain('var(--color-surface-solid)');
	});

	it('carries the playing status tokens on the live badge and card edge', () => {
		const source = readHomeSource();
		const live = cssRule(source, '.np-live');
		const card = cssRule(source, '.np-card');

		expect(live).toMatch(/color:\s*var\(--color-status-playing-text\)/);
		expect(card).toContain('var(--color-status-playing-border)');
	});

	it('respects reduced motion for the looping animations', () => {
		const source = readHomeSource();
		const reduced = source.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\t\}/)?.[1] ?? '';

		expect(reduced).toContain('.np-badge');
		expect(reduced).toContain('.np-live-dot');
	});
});

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

const SEARCH_SOURCE = readSource('../src/lib/components/layout/MobileSearch.svelte');
const LAYOUT_SOURCE = readSource('../src/routes/+layout.svelte');

/**
 * The fixed mobile search panel used to add 12px above the field and the
 * content was offset by 75px, which left a visible band between the panel and
 * the first game card. Both values are tightened together so the bar sits near
 * the top edge and the grid starts just below its shadow.
 */
describe('Mobile search spacing', () => {
	it('keeps the search panel close to the top edge', () => {
		const rule = SEARCH_SOURCE.match(/\.mobile-search-container\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(rule).toMatch(/padding:\s*6px\s+16px\s+6px/);
	});

	it('starts the content just below the fixed panel', () => {
		const rule = LAYOUT_SOURCE.match(/:global\(main\.search-open-mobile\)\s*\{([^}]*)\}/)?.[1] ?? '';
		const paddingTop = Number(rule.match(/padding-top:\s*(\d+)px/)?.[1]);

		expect(paddingTop).toBeGreaterThan(40);
		expect(paddingTop).toBeLessThan(60);
	});
});

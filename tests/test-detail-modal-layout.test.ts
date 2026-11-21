import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

function readSource(relativePath: string): string {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

const MODAL_SOURCE = `${readSource('../src/lib/components/DetailModal.tsx')}\n${readSource('../src/lib/components/DetailModal.css')}`;
const DETAIL_CARD_SOURCE = `${readSource('../src/lib/components/detail-modal/GameDetailCard.tsx')}\n${readSource('../src/lib/components/detail-modal/GameDetailCard.css')}`;

function pixelWidth(source: string): number {
	return Number(source.match(/md:w-\[(\d+)px\]/)?.[1]);
}

describe('Detail modal proportions', () => {
	it('keeps the 600px details column while shortening the cover', () => {
		const coverWidth = pixelWidth(DETAIL_CARD_SOURCE);
		const modalWidth = pixelWidth(MODAL_SOURCE);

		expect(coverWidth).toBe(360);
		expect(modalWidth - coverWidth).toBe(600);
	});
});

describe('Detail modal portrait sizing', () => {
	const portraitBlock =
		DETAIL_CARD_SOURCE.match(/@media \(max-width: 767px\) and \(orientation: portrait\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';

	it('lets the cover absorb the height the details column leaves', () => {
		const imageRule = portraitBlock.match(/\.modal-image-container\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(imageRule).toMatch(/flex:\s*1\s+1\s+auto/);
		expect(imageRule).toMatch(/max-height:\s*none/);
	});

	it('keeps the details column at its natural content height', () => {
		const wrapperRule = portraitBlock.match(/\.modal-details-wrapper\s*\{([^}]*)\}/)?.[1] ?? '';

		expect(wrapperRule).toMatch(/flex:\s*0\s+0\s+auto/);
	});
});

describe('Detail modal portrait tablet height', () => {
	it('gives the stacked verdict badges enough room', () => {
		const tabletBlock =
			MODAL_SOURCE.match(
				/@media \(min-width: 768px\) and \(max-width: 899px\) and \(orientation: portrait\)\s*\{([\s\S]*?)\n\}/
			)?.[1] ?? '';

		expect(tabletBlock).toMatch(/max-height:\s*min\(660px/);
	});
});

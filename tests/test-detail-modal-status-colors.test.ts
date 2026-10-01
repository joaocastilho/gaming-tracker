import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ModalRatings from '$lib/components/detail-modal/ModalRatings.svelte';
import { createTestGame, createCompletedGame } from './helpers/factories';

function readSource(relativePath: string): string {
	return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf8');
}

const CARD_SOURCE = readSource('../src/lib/components/game-card/GameCardInfo.svelte');
const MODAL_SOURCE = readSource('../src/lib/components/detail-modal/ModalRatings.svelte');
const APP_CSS = readSource('../src/app.css');

/**
 * The score/status colours used to be hardcoded hex values duplicated between the
 * grid card and the detail modal. They drifted, so mobile and desktop rendered
 * different colours for the same state. Both components now read from the
 * shared --color-status-* variables defined in src/app.css.
 */
describe('Detail modal score/status colours come from shared variables', () => {
	it('uses the same shared colour variable names as the game card', () => {
		expect(CARD_SOURCE).toContain('--color-status-');
		expect(MODAL_SOURCE).toContain('--color-status-');
	});

	it('does not hardcode status hex colours in either component', () => {
		const hardcodedHex = /#(?:fbbf24|34d399|60a5fa|059669|d97706|2563eb)\b/i;

		expect(CARD_SOURCE).not.toMatch(hardcodedHex);
		expect(MODAL_SOURCE).not.toMatch(hardcodedHex);
	});

	it('defines every variable both components reference', () => {
		const referenced = new Set(`${CARD_SOURCE}\n${MODAL_SOURCE}`.match(/--color-status-[a-z-]+/g) ?? []);
		expect(referenced.size).toBeGreaterThan(0);

		for (const name of referenced) {
			expect(APP_CSS, `missing definition for ${name}`).toContain(`${name}:`);
		}
	});
});

describe('Detail modal score/status badge matches the game card', () => {
	it('renders a score badge for Completed games', () => {
		const game = createCompletedGame({ score: 8 });
		const { container } = render(ModalRatings, { props: { game } });

		const badge = container.querySelector('.score-result .score-badge');
		expect(badge).toBeTruthy();
		expect(badge?.textContent).toContain('8');
	});

	it('renders a playing badge for Playing games', () => {
		const game = createTestGame({ status: 'Playing' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(container.querySelector('.score-result .playing-badge')).toBeTruthy();
	});

	it('renders a planned badge for Planned games', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		expect(container.querySelector('.score-result .planned-badge')).toBeTruthy();
	});

	it('never renders a bare placeholder dash in the score block', () => {
		const game = createTestGame({ status: 'Planned' });
		const { container } = render(ModalRatings, { props: { game } });

		const scoreResult = container.querySelector('.score-result');
		expect(scoreResult?.textContent).not.toContain('-');
	});
});

/**
 * Regression guard for the swipe jump: the score block sits inside a wrapper that
 * is pinned to the bottom of the modal on mobile. If the score block were taller
 * for one status than another, the Ratings row would visibly move as you swipe
 * between games. Every status must therefore share one badge class, which
 * carries a single fixed height.
 */
describe('Score block has one consistent height for every status', () => {
	const statuses = [
		['Completed', createCompletedGame({ score: 8 })],
		['Playing', createTestGame({ status: 'Playing' })],
		['Planned', createTestGame({ status: 'Planned' })],
	] as const;

	it.each(statuses)('%s uses the shared status-badge box', (_name, game) => {
		const { container } = render(ModalRatings, { props: { game } });

		const scoreResult = container.querySelector('.score-result');
		const badges = scoreResult?.querySelectorAll('.status-badge');

		expect(badges?.length).toBe(1);
		expect(badges?.[0].classList.contains('status-badge')).toBe(true);
	});

	it('declares a single fixed height for the shared badge box', () => {
		const source = MODAL_SOURCE;

		// The shared box owns the height, so all statuses render identically tall.
		const badgeRule = source.match(/\.status-badge\s*\{([^}]*)\}/);
		expect(badgeRule).toBeTruthy();
		expect(badgeRule?.[1]).toMatch(/height:\s*[\d.]+(rem|px)/);

		// No per-status height overrides that could reintroduce the jump.
		expect(source).not.toMatch(/\.(score|playing|planned)-badge\s*\{[^}]*height:/);
	});

	it('gives every status the same width, not a content-sized one', () => {
		const badgeRule = MODAL_SOURCE.match(/\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';

		// A shrink-to-fit badge renders "PLAYING" narrower than the icon+number
		// score badge, so width must be driven by the shared rule.
		expect(badgeRule).toMatch(/width:\s*100%/);

		// No per-status width overrides.
		expect(MODAL_SOURCE).not.toMatch(/\.(score|playing|planned)-badge\s*\{[^}]*width:/);
	});

	it('is visibly larger than the previous compact sizing', () => {
		const badgeRule = MODAL_SOURCE.match(/\.status-badge\s*\{([^}]*)\}/)?.[1] ?? '';
		const height = Number(badgeRule.match(/height:\s*([\d.]+)rem/)?.[1]);

		// Previous sizing was 3rem; the badge should still be taller than that.
		expect(height).toBeGreaterThan(3);
	});

	it('narrows the badge symmetrically so it stays centred', () => {
		// Narrowing happens through matching left/right insets on the wrapper, so
		// the badge never depends on its own text length for width.
		const wrapper = MODAL_SOURCE.match(/<div class="score-result[^"]*"/)?.[0] ?? '';

		expect(wrapper).toMatch(/mx-\d/);
		expect(wrapper).not.toMatch(/\bml-\d/);
		expect(wrapper).not.toMatch(/\bmr-\d/);
	});
});
